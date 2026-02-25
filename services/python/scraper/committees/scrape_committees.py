"""
Nepal Federal Parliament Committee Scraper

Scrapes committee data from:
  - House of Representatives (HoR): https://hr.parliament.gov.np/np/committees
  - National Assembly (NA): https://na.parliament.gov.np/np/committees/

Outputs JSON matching the committee DB schema.
"""

import json
import os
import re
import time
import urllib3

import requests
from bs4 import BeautifulSoup

# Suppress InsecureRequestWarning (Nepal govt sites have SSL cert issues)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# ─── Configuration ────────────────────────────────────────────────────────────

SOURCES = [
    {
        "type": "HoR",
        "listing_url": "https://hr.parliament.gov.np/np/committees",
        "base_url": "https://hr.parliament.gov.np",
    },
    {
        "type": "NA",
        "listing_url": "https://na.parliament.gov.np/np/committees/",
        "base_url": "https://na.parliament.gov.np",
    },
]

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "committees.json")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "ne,en;q=0.9",
}

REQUEST_DELAY = 1.5  # seconds between requests to be polite


# ─── Helper Functions ─────────────────────────────────────────────────────────


def fetch_page(url: str) -> BeautifulSoup:
    """Fetch a page and return a BeautifulSoup object."""
    print(f"  Fetching: {url}")
    response = requests.get(url, headers=HEADERS, verify=False, timeout=30)
    response.raise_for_status()
    response.encoding = "utf-8"
    return BeautifulSoup(response.text, "lxml")


def clean_text(text: str) -> str:
    """Clean extracted text: normalize whitespace, strip."""
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def get_committee_links(listing_url: str, base_url: str) -> list[dict]:
    """
    Parse the committee listing page and extract committee detail URLs.
    Returns a list of dicts with 'name' and 'url'.
    """
    soup = fetch_page(listing_url)

    # Committees are listed inside div.committee-listing-posts
    container = soup.find("div", class_="committee-listing-posts")
    if not container:
        # Fallback: look for classic-posts with committee listings
        container = soup.find("div", class_="classic-posts")

    if not container:
        print(f"  WARNING: Could not find committee listing container on {listing_url}")
        return []

    committees = []
    seen_urls = set()

    # Committee links are in <h4> tags inside the container
    for h4 in container.find_all("h4"):
        link = h4.find("a")
        if not link:
            # h4 itself might be inside an <a>
            link = h4.parent if h4.parent.name == "a" else None

        if link and link.get("href"):
            href = link["href"]
            name = clean_text(link.get_text())

            # Make absolute URL if needed
            if href.startswith("/"):
                href = base_url + href

            # Skip duplicates and non-committee links
            if href not in seen_urls and "/np/committees/" in href:
                seen_urls.add(href)
                committees.append({"name": name, "url": href})

    return committees


def scrape_committee_detail(url: str) -> dict:
    """
    Scrape a single committee detail page.
    Returns dict with 'name' and 'introduction'.
    """
    soup = fetch_page(url)

    # ── Name ──
    # The committee name is in the <h1> tag (inside .classic-posts or page-level)
    name = ""
    h1 = soup.find("h1")
    if h1:
        name = clean_text(h1.get_text())

    # ── Introduction ──
    # The introduction content is inside div.committee-description
    # It uses a mix of <p>, <div>, and <ol>/<li> tags for the text
    introduction_parts = []

    # Primary: look in div.committee-description
    desc_div = soup.find("div", class_="committee-description")
    if desc_div:
        # Collect text from all text-bearing elements
        for el in desc_div.find_all(["p", "div", "li"]):
            # Skip elements that are just containers for other matched elements
            if el.find(["p", "div", "li"]):
                continue
            text = clean_text(el.get_text())
            if text and len(text) > 10:
                introduction_parts.append(text)

    # Fallback: look in col-md-9 for <p> tags
    if not introduction_parts:
        col_md_9 = soup.find("div", class_="col-md-9")
        if col_md_9:
            for el in col_md_9.find_all(["p", "div"]):
                if el.find(["p", "div"]):
                    continue
                text = clean_text(el.get_text())
                if text and len(text) > 10:
                    introduction_parts.append(text)

    introduction = "\n\n".join(introduction_parts) if introduction_parts else ""

    return {
        "name": name,
        "introduction": introduction,
    }


def scrape_all_committees() -> list[dict]:
    """Scrape committees from all sources and return combined list."""
    all_committees = []

    for source in SOURCES:
        house_type = source["type"]
        print(f"\n{'='*60}")
        print(f"Scraping {house_type} committees from: {source['listing_url']}")
        print(f"{'='*60}")

        # Step 1: Get committee links from listing page
        committee_links = get_committee_links(
            source["listing_url"], source["base_url"]
        )
        print(f"  Found {len(committee_links)} committees")

        # Step 2: Scrape each committee detail page
        for i, committee_info in enumerate(committee_links):
            print(f"\n  [{i+1}/{len(committee_links)}] {committee_info['name']}")
            time.sleep(REQUEST_DELAY)

            try:
                detail = scrape_committee_detail(committee_info["url"])

                committee_data = {
                    "type": house_type,
                    "name": detail["name"] or committee_info["name"],
                    "start_date": None,
                    "end_date": None,
                    "introduction": detail["introduction"],
                }

                all_committees.append(committee_data)
                print(f"    ✓ Name: {committee_data['name']}")
                print(
                    f"    ✓ Introduction: {len(committee_data['introduction'])} chars"
                )

            except Exception as e:
                print(f"    ✗ Error scraping {committee_info['url']}: {e}")
                # Still add with data from listing page
                all_committees.append(
                    {
                        "type": house_type,
                        "name": committee_info["name"],
                        "start_date": None,
                        "end_date": None,
                        "introduction": "",
                    }
                )

    return all_committees


def save_to_json(data: list[dict], filepath: str) -> None:
    """Save committee data to JSON file."""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"\nSaved {len(data)} committees to {filepath}")


# ─── Main ─────────────────────────────────────────────────────────────────────


def main():
    print("Nepal Federal Parliament Committee Scraper")
    print("=" * 60)

    committees = scrape_all_committees()

    # Summary
    hor_count = sum(1 for c in committees if c["type"] == "HoR")
    na_count = sum(1 for c in committees if c["type"] == "NA")
    print(f"\n{'='*60}")
    print(f"SUMMARY: {len(committees)} total committees")
    print(f"  HoR: {hor_count}")
    print(f"  NA:  {na_count}")
    print(f"{'='*60}")

    save_to_json(committees, OUTPUT_FILE)

    # Print sample
    if committees:
        print(f"\nSample entry:")
        print(json.dumps(committees[0], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
