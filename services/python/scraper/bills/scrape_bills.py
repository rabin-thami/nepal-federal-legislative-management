#!/usr/bin/env python3
"""
Nepal Parliament Bills Scraper

Scrapes bills data from both HoR (House of Representatives) and NA (National Assembly)
from Nepal Parliament website in both Nepali and English.

Usage:
    python scrape_bills.py              # Scrape all (HoR + NA)
    python scrape_bills.py --type HoR  # Scrape only HoR
    python scrape_bills.py --type NA   # Scrape only NA
"""

import asyncio
import json
import logging
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

import httpx
from bs4 import BeautifulSoup

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
log = logging.getLogger(__name__)

# Configuration
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

# Parliament URLs
PARLIAMENT_URLS = {
    "HoR": "https://hr.parliament.gov.np",
    "NA": "https://na.parliament.gov.np"
}

# Language codes
LANGUAGES = {
    "np": "np",
    "en": "en"
}

# Bill types to scrape
BILL_TYPES = ["reg"]  # Registration bills


# =====================================================================
# HTTP CLIENT
# =====================================================================

class BillsHTTPClient:
    """HTTP client for fetching parliament pages."""

    def __init__(self):
        self.client = httpx.AsyncClient(
            timeout=30.0,
            verify=False,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
            },
            follow_redirects=True
        )

    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()

    async def get(self, url: str) -> Optional[str]:
        """Fetch a URL and return HTML content."""
        try:
            response = await self.client.get(url)
            response.raise_for_status()
            return response.text
        except httpx.HTTPStatusError as e:
            log.error(f"HTTP error fetching {url}: {e}")
            return None
        except Exception as e:
            log.error(f"Error fetching {url}: {e}")
            return None


# =====================================================================
# BILL LIST SCRAPER
# =====================================================================

class BillListScraper:
    """Scraper for extracting bill IDs from list pages."""

    def __init__(self, client: BillsHTTPClient):
        self.client = client

    async def extract_bill_ids_from_page(self, html: str) -> List[str]:
        """Extract bill IDs from a list page HTML."""
        if not html:
            return []

        soup = BeautifulSoup(html, 'lxml')
        bill_ids = []

        # Find all bill links in the table
        # Pattern: /{lang}/bills/{bill_id}
        table = soup.find('table', class_='table-bordered')
        if not table:
            log.warning("No table found on list page")
            return []

        # Find all links in any column of each row
        rows = table.find('tbody').find_all('tr') if table.find('tbody') else []
        for row in rows:
            # Find the first link whose href contains "/bills/"
            link = row.find('a', href=re.compile(r'/bills/'))
            if link:
                href = link.get('href', '')
                # Extract bill ID from URL
                # Pattern: .../bills/{bill_id}
                match = re.search(r'/bills/([A-Za-z0-9]+)$', href)
                if match:
                    bill_id = match.group(1)
                    bill_ids.append(bill_id)

        log.info(f"Extracted {len(bill_ids)} bill IDs from page")
        return bill_ids

    async def get_bill_ids_for_type(self, parliament_type: str, bill_type: str = "reg") -> List[str]:
        """Get all bill IDs for a given parliament type and bill type."""
        all_bill_ids = []
        page = 1

        base_url = PARLIAMENT_URLS[parliament_type]
        url_template = f"{base_url}/np/bills?type={bill_type}&ref=BILL&page={{page}}"

        log.info(f"Fetching bill IDs for {parliament_type} - {bill_type}")

        while True:
            url = url_template.format(page=page)
            log.info(f"Fetching page {page}: {url}")

            html = await self.client.get(url)
            if not html:
                log.warning(f"Failed to fetch page {page}, stopping")
                break

            bill_ids = await self.extract_bill_ids_from_page(html)

            if not bill_ids:
                log.info(f"No more bills found on page {page}, stopping")
                break

            all_bill_ids.extend(bill_ids)
            log.info(f"Total bill IDs so far: {len(all_bill_ids)}")
            page += 1

            # Small delay to be respectful
            await asyncio.sleep(0.5)

        return all_bill_ids


# =====================================================================
# BILL DETAIL SCRAPER
# =====================================================================

class BillDetailScraper:
    """Scraper for extracting bill details from detail pages."""

    def __init__(self, client: BillsHTTPClient):
        self.client = client

    async def scrape_bill_detail(self, parliament_type: str, bill_id: str, lang: str) -> Dict:
        """
        Scrape bill detail page in specified language.
        Returns dict with bill details.
        """
        base_url = PARLIAMENT_URLS[parliament_type]
        url = f"{base_url}/{lang}/bills/{bill_id}"

        html = await self.client.get(url)
        if not html:
            log.error(f"Failed to fetch bill detail: {url}")
            return {}

        soup = BeautifulSoup(html, 'lxml')

        bill_detail = {
            "bill_id": bill_id,
            "language": lang,
        }

        # Extract title from h1
        title_element = soup.find('h1')
        if title_element:
            bill_detail["title"] = title_element.get_text(strip=True)

        # Extract info from tables
        info_tables = soup.find_all('table', class_='table-info')

        # Nepali key mapping (original fields)
        key_mapping_np = {
            "दर्ता नं.": "registration_number",
            "वर्ष": "year",
            "संवत्": "sambat",
            "प्रस्तुतकर्ता": "presenter",
            "मन्त्रालय": "ministry",
            "अधिवेशन": "session",
            "सरकारी/गैर-सरकारी": "government_type",
            "मूल/संशोधन": "bill_type",  # Original/Amendment
            "वर्ग": "category",
        }

        # English key mapping for parallel English fields
        key_mapping_en = {
            "Presenter": "presenter_en",
            "Ministry": "ministry_en",
            "Governmental/Non Governmental": "government_type_en",
            "Original/Amendment": "bill_type_en",
            "Category": "category_en",
        }

        for table in info_tables:
            rows = table.find_all('tr')
            for row in rows:
                cells = row.find_all('td')
                if len(cells) == 2:
                    key = cells[0].get_text(strip=True)
                    value = cells[1].get_text(strip=True)

                    if key in key_mapping_np:
                        bill_detail[key_mapping_np[key]] = value
                    elif lang == "en" and key in key_mapping_en:
                        bill_detail[key_mapping_en[key]] = value

        # Extract status timeline and current status (from English detail page)
        if lang == "en":
            status_container = soup.find("div", class_="fpn-auth-table-container")
            if status_container:
                status_table = status_container.find("table")
                if status_table:
                    thead = status_table.find("thead")
                    tbody = status_table.find("tbody")
                    header_cells = thead.find_all("th") if thead else []
                    body_row = tbody.find("tr") if tbody else None
                    statuses = []

                    if header_cells and body_row:
                        value_cells = body_row.find_all("td")
                        for th, td in zip(header_cells, value_cells):
                            label = th.get_text(strip=True)
                            date_text = td.get_text(strip=True)
                            if date_text:
                                statuses.append(
                                    {
                                        "label": label,
                                        "date": date_text,
                                    }
                                )

                    if statuses:
                        bill_detail["status_timeline"] = statuses
                        bill_detail["current_status"] = statuses[-1]["label"]
                        bill_detail["current_status_date"] = statuses[-1]["date"]

        # Extract resource link (PDF)
        resource_link = None
        download_btn = soup.find('a', class_='btn-small', href=re.compile(r'\.pdf$'))
        if download_btn:
            resource_link = download_btn.get('href', '')
            # Make absolute URL if relative
            if resource_link and not resource_link.startswith('http'):
                if resource_link.startswith('/'):
                    resource_link = f"{base_url}{resource_link}"

        if resource_link:
            bill_detail["resource_link"] = resource_link

        return bill_detail

    async def scrape_bill_both_languages(self, parliament_type: str, bill_id: str) -> Dict:
        """
        Scrape bill in both Nepali and English and merge results.
        Returns dict with combined data.
        """
        log.info(f"Scraping bill {bill_id} from {parliament_type} in both languages")

        # Scrape both languages
        np_result = await self.scrape_bill_detail(parliament_type, bill_id, "np")
        en_result = await self.scrape_bill_detail(parliament_type, bill_id, "en")

        # Small delay between requests
        await asyncio.sleep(0.3)

        if not np_result and not en_result:
            log.warning(f"Failed to scrape bill {bill_id} in both languages")
            return {}

        # Merge results
        combined = {
            "bill_id": bill_id,
            "type": parliament_type,  # HoR or NA
            "titleNp": np_result.get("title", ""),
            "titleEn": en_result.get("title", ""),
            "registration_number": np_result.get("registration_number") or en_result.get("registration_number"),
            "year": np_result.get("year") or en_result.get("year"),
            "sambat": np_result.get("sambat") or en_result.get("sambat"),
            "presenter": np_result.get("presenter") or en_result.get("presenter"),
            "ministry": np_result.get("ministry") or en_result.get("ministry"),
            "session": np_result.get("session") or en_result.get("session"),
            "government_type": np_result.get("government_type") or en_result.get("government_type"),
            "bill_type": np_result.get("bill_type") or en_result.get("bill_type"),
            "category": np_result.get("category") or en_result.get("category"),
            "resource_link": np_result.get("resource_link") or en_result.get("resource_link"),
            # English parallel fields (if available)
            "presenterEn": en_result.get("presenter_en", ""),
            "ministryEn": en_result.get("ministry_en", ""),
            "government_type_en": en_result.get("government_type_en"),
            "bill_type_en": en_result.get("bill_type_en"),
            "category_en": en_result.get("category_en"),
            # Status information from English detail
            "current_status": en_result.get("current_status"),
            "current_status_date": en_result.get("current_status_date"),
            "status_timeline": en_result.get("status_timeline", []),
            "scraped_at": datetime.now().isoformat(),
        }

        return combined


# =====================================================================
# MAIN SCRAPER
# =====================================================================

class BillsScraper:
    """Main bills scraper orchestrator."""

    def __init__(self):
        self.client = BillsHTTPClient()
        self.list_scraper = BillListScraper(self.client)
        self.detail_scraper = BillDetailScraper(self.client)

    async def scrape_parliament_type(self, parliament_type: str) -> List[Dict]:
        """Scrape all bills for a given parliament type."""
        log.info("="*60)
        log.info(f"Scraping bills for {parliament_type}")
        log.info("="*60)

        all_bills = []

        # Get all bill IDs for each bill type
        for bill_type in BILL_TYPES:
            log.info(f"Fetching {bill_type} bills for {parliament_type}")

            bill_ids = await self.list_scraper.get_bill_ids_for_type(parliament_type, bill_type)
            log.info(f"Found {len(bill_ids)} total bills for {parliament_type} - {bill_type}")

            # Scrape each bill's details
            for i, bill_id in enumerate(bill_ids, 1):
                log.info(f"[{i}/{len(bill_ids)}] Scraping bill {bill_id}")

                try:
                    bill_data = await self.detail_scraper.scrape_bill_both_languages(parliament_type, bill_id)
                    if bill_data:
                        all_bills.append(bill_data)
                except Exception as e:
                    log.error(f"Error scraping bill {bill_id}: {e}")

                # Small delay between bill requests
                await asyncio.sleep(0.2)

        return all_bills

    async def scrape_all(self) -> List[Dict]:
        """Scrape all bills from both HoR and NA."""
        log.info("="*60)
        log.info("Starting Bills Scraper")
        log.info("="*60)

        all_bills = []

        # Scrape HoR
        try:
            hor_bills = await self.scrape_parliament_type("HoR")
            all_bills.extend(hor_bills)
        except Exception as e:
            log.error(f"Error scraping HoR: {e}")

        # Scrape NA
        try:
            na_bills = await self.scrape_parliament_type("NA")
            all_bills.extend(na_bills)
        except Exception as e:
            log.error(f"Error scraping NA: {e}")

        await self.client.close()

        log.info("="*60)
        log.info(f"Scraping complete! Total bills: {len(all_bills)}")
        log.info("="*60)

        return all_bills


# =====================================================================
# OUTPUT HANDLING
# =====================================================================

def save_to_json(bills: List[Dict], output_file: str):
    """Save bills data to JSON file."""
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(bills, f, ensure_ascii=False, indent=2)
    log.info(f"Saved {len(bills)} bills to {output_file}")


def get_output_filename():
    """Generate output filename with timestamp."""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    return str(DATA_DIR / f"bills_{timestamp}.json")


# =====================================================================
# CLI
# =====================================================================

async def main():
    """Main entry point for CLI usage."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Nepal Parliament Bills Scraper",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python scrape_bills.py              # Scrape all (HoR + NA)
  python scrape_bills.py --type HoR  # Scrape only HoR
  python scrape_bills.py --type NA   # Scrape only NA
  python scrape_bills.py --output custom.json
        """
    )

    parser.add_argument(
        "--type",
        choices=["HoR", "NA", "all"],
        default="all",
        help="Parliament type to scrape (default: all)"
    )
    parser.add_argument(
        "--output",
        type=str,
        help="Output JSON file path (default: auto-generated with timestamp)"
    )

    args = parser.parse_args()

    scraper = BillsScraper()
    all_bills = []

    if args.type in ["all", "HoR"]:
        try:
            hor_bills = await scraper.scrape_parliament_type("HoR")
            all_bills.extend(hor_bills)
        except Exception as e:
            log.error(f"Error scraping HoR: {e}")

    if args.type in ["all", "NA"]:
        try:
            na_bills = await scraper.scrape_parliament_type("NA")
            all_bills.extend(na_bills)
        except Exception as e:
            log.error(f"Error scraping NA: {e}")

    await scraper.client.close()

    # Save results
    output_file = args.output or get_output_filename()
    save_to_json(all_bills, output_file)

    # Print summary
    hor_count = sum(1 for b in all_bills if b["type"] == "HoR")
    na_count = sum(1 for b in all_bills if b["type"] == "NA")

    log.info("\n" + "="*60)
    log.info("SUMMARY")
    log.info("="*60)
    log.info(f"Total bills: {len(all_bills)}")
    log.info(f"  HoR: {hor_count}")
    log.info(f"  NA:  {na_count}")
    log.info(f"Output: {output_file}")
    log.info("="*60 + "\n")


async def scrape_all():
    """Function for importing and running from main.py."""
    scraper = BillsScraper()
    all_bills = await scraper.scrape_all()

    # Save results
    output_file = get_output_filename()
    save_to_json(all_bills, output_file)

    return all_bills


if __name__ == "__main__":
    asyncio.run(main())
