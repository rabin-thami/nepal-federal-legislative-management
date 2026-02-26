"""
Nepal Parliament Bills Scraper

Scraper for registered bills from https://hr.parliament.gov.np/np/bills
"""

import requests
from bs4 import BeautifulSoup
import urllib3

# Suppress SSL warnings (common in WSL environments)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
import json
import time
from typing import List, Dict, Optional
import os


class BillsScraper:
    """Scraper for Nepal Parliament bills"""

    BASE_URL_NP = "https://hr.parliament.gov.np/np/bills"
    BASE_URL_EN = "https://hr.parliament.gov.np/en/bills"
    BILLS_LIST_URL = "https://hr.parliament.gov.np/np/bills?type=reg&ref=BILL&page={page}"

    def __init__(self, delay: float = 1.0):
        """
        Initialize the scraper

        Args:
            delay: Delay between requests in seconds (default: 1.0)
        """
        self.delay = delay
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })

    def _get_page(self, url: str) -> BeautifulSoup:
        """
        Fetch and parse a page

        Args:
            url: URL to fetch

        Returns:
            BeautifulSoup object
        """
        # Disable SSL verification (common issue in WSL environments)
        response = self.session.get(url, timeout=30, verify=False)
        response.raise_for_status()
        return BeautifulSoup(response.content, 'html.parser')

    def _extract_bill_id(self, href: str) -> Optional[str]:
        """
        Extract bill ID from a href

        Args:
            href: URL like 'https://hr.parliament.gov.np/np/bills/PfzGSahf'

        Returns:
            Bill ID (e.g., 'PfzGSahf') or None
        """
        if href and '/np/bills/' in href:
            parts = href.split('/np/bills/')
            if len(parts) > 1:
                return parts[1].split('?')[0]
        return None

    def get_all_bill_ids(self) -> List[str]:
        """
        Get all bill IDs by scraping all pages

        Returns:
            List of bill IDs
        """
        bill_ids = []
        page = 1
        has_more = True

        print("Starting to scrape all bill IDs...")

        while has_more:
            print(f"Scraping page {page}...")
            url = self.BILLS_LIST_URL.format(page=page)
            soup = self._get_page(url)

            # Find the table with bills
            table = soup.find('table', class_='table')
            if not table:
                print("No table found on page")
                break

            tbody = table.find('tbody')
            if not tbody:
                print("No tbody found")
                break

            rows = tbody.find_all('tr')
            if not rows:
                print("No rows found")
                has_more = False
                break

            # Extract bill IDs from each row
            page_bill_ids = []
            for row in rows:
                # Find the title link which contains the bill ID
                title_cell = row.find_all('td')[3] if len(row.find_all('td')) > 3 else None
                if title_cell:
                    link = title_cell.find('a')
                    if link and link.get('href'):
                        bill_id = self._extract_bill_id(link['href'])
                        if bill_id and bill_id not in bill_ids:
                            bill_ids.append(bill_id)
                            page_bill_ids.append(bill_id)

            print(f"  Found {len(page_bill_ids)} bill IDs on this page")

            # Check for pagination
            pagination = soup.find('div', class_='pagination-navigation')
            has_more = False
            if pagination:
                next_link = pagination.find('a', string='Next')
                if next_link:
                    has_more = True
                    page += 1
                else:
                    # Also check for page numbers > current page
                    page_links = pagination.find_all('a', href=True)
                    for link in page_links:
                        if link.get('href'):
                            href = link['href']
                            if 'page=' in href:
                                page_num = int(href.split('page=')[-1].split('&')[0])
                                if page_num > page:
                                    has_more = True
                                    page += 1
                                    break

            time.sleep(self.delay)

        print(f"\nTotal bill IDs found: {len(bill_ids)}")
        return bill_ids

    def _parse_nepali_number(self, text: str) -> str:
        """
        Parse Nepali number text and return it as string

        Args:
            text: Text that may contain Nepali numbers

        Returns:
            Cleaned text
        """
        if not text:
            return ""
        return text.strip()

    def scrape_bill_details(self, bill_id: str, include_english: bool = True) -> Optional[Dict]:
        """
        Scrape detailed information for a single bill

        Args:
            bill_id: The bill ID (e.g., 'PfzGSahf')
            include_english: Whether to also fetch the English version (default: True)

        Returns:
            Dictionary with bill details or None if failed
        """
        url_np = f"{self.BASE_URL_NP}/{bill_id}"
        url_en = f"{self.BASE_URL_EN}/{bill_id}" if include_english else None
        print(f"  Scraping bill {bill_id}...")

        try:
            # Scrape Nepali version
            soup_np = self._get_page(url_np)
            bill_data = self._parse_bill_page(soup_np, bill_id, url_np, language='np')

            if not bill_data:
                print(f"    No single bill view found for {bill_id}")
                return None

            # Scrape English version if requested
            if include_english:
                try:
                    soup_en = self._get_page(url_en)
                    english_data = self._parse_bill_page(soup_en, bill_id, url_en, language='en')
                    if english_data:
                        # Add English data with 'en_' prefix
                        for key, value in english_data.items():
                            if key not in ['bill_id']:
                                bill_data[f'en_{key}'] = value
                except Exception as e:
                    print(f"    Warning: Could not scrape English version: {e}")

            return bill_data

        except Exception as e:
            print(f"    Error scraping bill {bill_id}: {e}")
            return None

    def _parse_bill_page(self, soup: BeautifulSoup, bill_id: str, url: str, language: str = 'np') -> Optional[Dict]:
        """
        Parse a bill page (Nepali or English)

        Args:
            soup: BeautifulSoup object
            bill_id: Bill ID
            url: Page URL
            language: 'np' for Nepali, 'en' for English

        Returns:
            Dictionary with parsed data or None
        """
        # Find the main content
        single_bill_view = soup.find('div', class_='single-bill-view')
        if not single_bill_view:
            return None

        # Extract title
        title = single_bill_view.find('h1')
        title_text = title.get_text(strip=True) if title else ""

        bill_data = {
            'bill_id': bill_id,
            'title': title_text,
            'url': url,
            'language': language
        }

        # Find the authorization table (dates and status)
        auth_table = single_bill_view.find('table', class_='fpn-auth-table-container')
        if auth_table:
            table = auth_table.find('table')
            if table:
                rows = table.find('tbody').find_all('tr') if table.find('tbody') else table.find_all('tr')[1:]
                if rows:
                    cells = rows[0].find_all('td')
                    headers = table.find('thead').find_all('th')
                    for i, cell in enumerate(cells):
                        if i < len(headers):
                            header_text = headers[i].get_text(strip=True).replace('\n', ' ')
                            cell_text = cell.get_text(strip=True)
                            bill_data[header_text] = cell_text

        # Find the info tables (registration details)
        info_container = single_bill_view.find('div', class_='fpn-info-container')
        if info_container:
            tables = info_container.find_all('table', class_='table-info')
            for table in tables:
                rows = table.find_all('tr')
                for row in rows:
                    cells = row.find_all('td')
                    if len(cells) >= 2:
                        key = cells[0].get_text(strip=True)
                        value = cells[1].get_text(strip=True)
                        bill_data[key] = value

        # Extract download links
        download_links = []
        all_links = single_bill_view.find_all('a', class_='bg-blue')
        for link in all_links:
            href = link.get('href')
            text = link.get_text(strip=True)
            if href and 'Download' in text:
                download_links.append({
                    'text': text,
                    'url': href
                })
        if download_links:
            bill_data['download_links'] = download_links

        # Extract description if present
        description = single_bill_view.find('div', class_='description')
        if description:
            desc_text = description.get_text(strip=True)
            if desc_text:
                bill_data['description'] = desc_text

        return bill_data

    def scrape_all_bills(self, save_to: Optional[str] = None) -> List[Dict]:
        """
        Scrape all bills with full details

        Args:
            save_to: Optional file path to save the JSON data

        Returns:
            List of dictionaries with bill details
        """
        # Get all bill IDs
        bill_ids = self.get_all_bill_ids()

        if not bill_ids:
            print("No bill IDs found!")
            return []

        # Scrape details for each bill
        all_bills = []
        print(f"\nScraping details for {len(bill_ids)} bills...")

        for i, bill_id in enumerate(bill_ids, 1):
            print(f"[{i}/{len(bill_ids)}]", end=" ")
            bill_data = self.scrape_bill_details(bill_id)
            if bill_data:
                all_bills.append(bill_data)

            time.sleep(self.delay)

        print(f"\nSuccessfully scraped {len(all_bills)} bills")

        # Save to file if requested
        if save_to:
            self._save_to_file(all_bills, save_to)
            print(f"Data saved to {save_to}")

        return all_bills

    def _save_to_file(self, data: List[Dict], filepath: str):
        """
        Save data to a JSON file

        Args:
            data: List of dictionaries to save
            filepath: Path to save the file
        """
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(filepath), exist_ok=True)

        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def scrape_bill_ids_only(self, save_to: Optional[str] = None) -> List[str]:
        """
        Scrape only bill IDs (faster than full scrape)

        Args:
            save_to: Optional file path to save the bill IDs

        Returns:
            List of bill IDs
        """
        bill_ids = self.get_all_bill_ids()

        if save_to:
            self._save_to_file(bill_ids, save_to)
            print(f"Bill IDs saved to {save_to}")

        return bill_ids


def main():
    """Main function to run the scraper"""
    scraper = BillsScraper(delay=1.0)

    # Option 1: Scrape all bills with full details
    print("=== Scrape all bills with full details ===")
    bills = scraper.scrape_all_bills(save_to='scraper/bills/data/bills.json')

    # Option 2: Scrape only bill IDs
    # print("\n=== Scrape only bill IDs ===")
    # bill_ids = scraper.scrape_bill_ids_only(save_to='scraper/bills/data/bill_ids.json')

    print("\nDone!")


if __name__ == "__main__":
    main()
