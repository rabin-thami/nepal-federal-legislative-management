#!/usr/bin/env python3
"""
Nepal Federal Legislative Scraper - Main Controller

Controls scraping for both Bills and Committees from Nepal Parliament.
Provides CLI options to run scrapers independently or together.

Usage:
    python main.py --all              # Run all scrapers
    python main.py --bills            # Run only bills scraper
    python main.py --committees       # Run only committees scraper
    python main.py --committees-clean # Clean and insert committees data
    python main.py --help             # Show help
"""

import argparse
import asyncio
import json
import logging
import os
import sys
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
log = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Paths
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
OUTPUT_DIR = DATA_DIR / "output"
SCRAPER_DIR = BASE_DIR / "scraper"

# Create output directories
DATA_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)


# =====================================================================
# SCRAPER IMPORTS
# =====================================================================

def import_bills_scraper():
    """Import bills scraper module."""
    sys.path.insert(0, str(SCRAPER_DIR / "bills"))
    try:
        import scrape_bills
        return scrape_bills
    except ImportError as e:
        log.error(f"Failed to import bills scraper: {e}")
        return None


def import_committees_scraper():
    """Import committees scraper module."""
    sys.path.insert(0, str(SCRAPER_DIR / "committees"))
    try:
        import scrape_committees
        return scrape_committees
    except ImportError as e:
        log.error(f"Failed to import committees scraper: {e}")
        return None


def import_committees_cleaner():
    """Import committees cleaner module."""
    sys.path.insert(0, str(SCRAPER_DIR / "committees"))
    try:
        import clean_and_insert
        return clean_and_insert
    except ImportError as e:
        log.error(f"Failed to import committees cleaner: {e}")
        return None


# =====================================================================
# SCRAPER WRAPPERS
# =====================================================================

async def run_bills_scraper():
    """
    Run the bills scraper and capture results.
    Returns dict with stats and data.
    """
    log.info("="*60)
    log.info("Starting Bills Scraper")
    log.info("="*60)

    start_time = datetime.now()

    try:
        # Import and run the scraper
        scrape_bills = import_bills_scraper()
        if not scrape_bills:
            return {"success": False, "error": "Failed to import bills scraper"}

        # Run the scraper (it handles DB insertion directly)
        await scrape_bills.scrape_all()

        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()

        return {
            "success": True,
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "duration_seconds": duration,
            "output": "Direct database insertion",
        }

    except Exception as e:
        log.error(f"Bills scraper failed: {e}", exc_info=True)
        return {
            "success": False,
            "error": str(e),
            "start_time": start_time.isoformat() if 'start_time' in locals() else None,
        }


def run_committees_scraper():
    """
    Run the committees scraper and save to JSON.
    Returns dict with stats and output path.
    """
    log.info("="*60)
    log.info("Starting Committees Scraper")
    log.info("="*60)

    start_time = datetime.now()
    output_file = SCRAPER_DIR / "committees" / "data" / "committees.json"

    try:
        # Import and run the scraper
        scrape_committees = import_committees_scraper()
        if not scrape_committees:
            return {"success": False, "error": "Failed to import committees scraper"}

        # Run the scraper
        committees = scrape_committees.scrape_all_committees()

        # Save to the original location (scraper uses this)
        scrape_committees.save_to_json(committees, str(output_file))

        # Also copy to central output directory
        central_output = OUTPUT_DIR / f"committees_{start_time.strftime('%Y%m%d_%H%M%S')}.json"
        with open(central_output, 'w', encoding='utf-8') as f:
            json.dump(committees, f, ensure_ascii=False, indent=2)

        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()

        # Count by type
        hor_count = sum(1 for c in committees if c["type"] == "HoR")
        na_count = sum(1 for c in committees if c["type"] == "NA")

        return {
            "success": True,
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "duration_seconds": duration,
            "total_committees": len(committees),
            "hor_count": hor_count,
            "na_count": na_count,
            "output": str(central_output),
        }

    except Exception as e:
        log.error(f"Committees scraper failed: {e}", exc_info=True)
        return {
            "success": False,
            "error": str(e),
            "start_time": start_time.isoformat() if 'start_time' in locals() else None,
        }


def run_committees_cleaner():
    """
    Run the committees cleaner and database inserter.
    Returns dict with stats.
    """
    log.info("="*60)
    log.info("Starting Committees Cleaner & Inserter")
    log.info("="*60)

    start_time = datetime.now()

    try:
        # Import and run the cleaner
        clean_and_insert = import_committees_cleaner()
        if not clean_and_insert:
            return {"success": False, "error": "Failed to import committees cleaner"}

        # Run the main function which handles everything
        clean_and_insert.main()

        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()

        return {
            "success": True,
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "duration_seconds": duration,
            "output": "Direct database insertion",
        }

    except Exception as e:
        log.error(f"Committees cleaner failed: {e}", exc_info=True)
        return {
            "success": False,
            "error": str(e),
            "start_time": start_time.isoformat() if 'start_time' in locals() else None,
        }


# =====================================================================
# REPORTING
# =====================================================================

def print_report(results: dict):
    """Print a formatted report of scraping results."""
    log.info("\n" + "="*60)
    log.info("SCRAPING REPORT")
    log.info("="*60)

    for scraper_name, result in results.items():
        if result is None:
            continue

        log.info(f"\n{scraper_name.upper()}:")
        if result.get("success"):
            log.info(f"  Status: ✓ Success")
            if "duration_seconds" in result:
                log.info(f"  Duration: {result['duration_seconds']:.2f}s")
            if "total_committees" in result:
                log.info(f"  Total committees: {result['total_committees']}")
                log.info(f"    HoR: {result['hor_count']}")
                log.info(f"    NA:  {result['na_count']}")
            if "output" in result:
                log.info(f"  Output: {result['output']}")
        else:
            log.info(f"  Status: ✗ Failed")
            log.info(f"  Error: {result.get('error', 'Unknown error')}")

    log.info("\n" + "="*60 + "\n")


def save_report(results: dict):
    """Save report to JSON file."""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    report_file = OUTPUT_DIR / f"report_{timestamp}.json"

    with open(report_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    log.info(f"Report saved to: {report_file}")


# =====================================================================
# MAIN ENTRY POINT
# =====================================================================

def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Nepal Federal Legislative Scraper - Main Controller",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py --all               Run all scrapers
  python main.py --bills             Run only bills scraper
  python main.py --committees        Run only committees scraper
  python main.py --committees-clean  Clean and insert committees data
  python main.py --committees --committees-clean  Scrape then clean committees
        """
    )

    parser.add_argument(
        "--all",
        action="store_true",
        help="Run all scrapers (bills + committees)"
    )
    parser.add_argument(
        "--bills",
        action="store_true",
        help="Run bills scraper"
    )
    parser.add_argument(
        "--committees",
        action="store_true",
        help="Run committees scraper (scrape only)"
    )
    parser.add_argument(
        "--committees-clean",
        action="store_true",
        help="Clean and insert committees data (requires scraped data)"
    )
    parser.add_argument(
        "--no-report",
        action="store_true",
        help="Don't save JSON report file"
    )

    args = parser.parse_args()

    # Validate at least one option is selected
    if not any([args.all, args.bills, args.committees, args.committees_clean]):
        parser.print_help()
        sys.exit(1)

    results = {}

    # Run bills scraper
    if args.all or args.bills:
        results["bills"] = asyncio.run(run_bills_scraper())

    # Run committees scraper
    if args.all or args.committees:
        results["committees_scrape"] = run_committees_scraper()

    # Run committees cleaner
    if args.all or args.committees_clean:
        results["committees_clean"] = run_committees_cleaner()

    # Print and save report
    print_report(results)

    if not args.no_report:
        save_report(results)

    # Exit with appropriate code
    failed = [name for name, result in results.items()
              if result and not result.get("success")]

    if failed:
        log.error(f"Failed scrapers: {', '.join(failed)}")
        sys.exit(1)
    else:
        log.info("All scrapers completed successfully!")
        sys.exit(0)


if __name__ == "__main__":
    main()
