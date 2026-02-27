#!/usr/bin/env python3
"""
Nepal Federal Legislative Scraper - Main Controller

Controls scraping for both Bills and Committees from Nepal Parliament.
Provides interactive menu and CLI options to run scrapers independently or together.

Usage:
    python main.py                    # Interactive menu
    python main.py --menu             # Interactive menu
    python main.py --all              # Run all scrapers
    python main.py --bills            # Run only bills scraper
    python main.py --bills-clean      # Clean and insert bills data
    python main.py --committees       # Run only committees scraper
    python main.py --committees-clean # Clean and insert committees data
"""

import argparse
import asyncio
import json
import logging
import subprocess
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


def import_bills_cleaner():
    """Import bills cleaner/normalizer module."""
    sys.path.insert(0, str(SCRAPER_DIR / "bills"))
    try:
        import clean_and_insert_bills
        return clean_and_insert_bills
    except ImportError:
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
# BILLS FUNCTIONS
# =====================================================================

async def run_bills_scraper():
    """
    Run bills scraper and save to JSON.
    Returns dict with stats and output path.
    """
    log.info("="*60)
    log.info("Starting Bills Scraper")
    log.info("="*60)

    start_time = datetime.now()

    try:
        # Import and run scraper
        scrape_bills = import_bills_scraper()
        if not scrape_bills:
            return {"success": False, "error": "Failed to import bills scraper"}

        # Run scraper
        bills = await scrape_bills.scrape_all()

        # Save to output directory
        central_output = OUTPUT_DIR / f"bills_{start_time.strftime('%Y%m%d_%H%M%S')}.json"
        with open(central_output, 'w', encoding='utf-8') as f:
            json.dump(bills, f, ensure_ascii=False, indent=2)

        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()

        # Count by type
        hor_count = sum(1 for b in bills if b["type"] == "HoR")
        na_count = sum(1 for b in bills if b["type"] == "NA")

        return {
            "success": True,
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "duration_seconds": duration,
            "total_bills": len(bills),
            "hor_count": hor_count,
            "na_count": na_count,
            "output": str(central_output),
        }

    except Exception as e:
        log.error(f"Bills scraper failed: {e}", exc_info=True)
        return {
            "success": False,
            "error": str(e),
            "start_time": start_time.isoformat() if 'start_time' in locals() else None,
        }


def run_bills_cleaner():
    """
    Run bills cleaner and database inserter.
    Returns dict with stats.
    """
    log.info("="*60)
    log.info("Starting Bills Cleaner & Inserter")
    log.info("="*60)

    start_time = datetime.now()

    try:
        # Import and run cleaner
        clean_and_insert_bills = import_bills_cleaner()
        if not clean_and_insert_bills:
            return {"success": False, "error": "Bills cleaner module not found. Create scraper/bills/clean_and_insert_bills.py"}

        # Run main function
        result = clean_and_insert_bills.main()

        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()

        return {
            "success": result.get("success", True),
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "duration_seconds": duration,
            "output": "Direct database insertion",
        }

    except Exception as e:
        log.error(f"Bills cleaner failed: {e}", exc_info=True)
        return {
            "success": False,
            "error": str(e),
            "start_time": start_time.isoformat() if 'start_time' in locals() else None,
        }


def run_bills_insert_from_cleaned():
    """
    Insert bills into the database from an existing cleaned JSON file.

    This assumes that `bills_cleaned.json` has already been generated
    by the cleaner in `data/output/bills_cleaned.json`.
    """
    log.info("=" * 60)
    log.info("Inserting Bills from cleaned JSON into DB")
    log.info("=" * 60)

    start_time = datetime.now()

    try:
        cleaned_path = OUTPUT_DIR / "bills_cleaned.json"
        if not cleaned_path.exists():
            return {
                "success": False,
                "error": f"Cleaned bills file not found at {cleaned_path}. "
                "Run 'Clean and Normalize Bills Data' first.",
            }

        # Delegate actual DB insertion to Bun/TypeScript script
        repo_root = BASE_DIR.parent
        completed = subprocess.run(
            ["bun", "db:import-bills"],
            cwd=str(repo_root),
            capture_output=True,
            text=True,
        )

        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()

        if completed.returncode != 0:
            log.error(
                "bun db:import-bills failed with code %s: %s",
                completed.returncode,
                completed.stderr,
            )
            return {
                "success": False,
                "error": completed.stderr.strip() or "bun db:import-bills failed",
                "start_time": start_time.isoformat(),
                "end_time": end_time.isoformat(),
                "duration_seconds": duration,
            }

        return {
            "success": True,
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "duration_seconds": duration,
            "output": f"Inserted from {cleaned_path}",
        }

    except Exception as e:
        log.error(f"Bills insert-from-cleaned failed: {e}", exc_info=True)
        return {
            "success": False,
            "error": str(e),
            "start_time": start_time.isoformat() if "start_time" in locals() else None,
        }


# =====================================================================
# COMMITTEES FUNCTIONS
# =====================================================================

def run_committees_scraper():
    """
    Run committees scraper and save to JSON.
    Returns dict with stats and output path.
    """
    log.info("="*60)
    log.info("Starting Committees Scraper")
    log.info("="*60)

    start_time = datetime.now()
    output_file = SCRAPER_DIR / "committees" / "data" / "committees.json"

    try:
        # Import and run scraper
        scrape_committees = import_committees_scraper()
        if not scrape_committees:
            return {"success": False, "error": "Failed to import committees scraper"}

        # Run scraper
        committees = scrape_committees.scrape_all_committees()

        # Save to original location (scraper uses this)
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
    Run committees cleaner and database inserter.
    Returns dict with stats.
    """
    log.info("="*60)
    log.info("Starting Committees Cleaner & Inserter")
    log.info("="*60)

    start_time = datetime.now()

    try:
        # Import and run cleaner
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
            if "total_bills" in result:
                log.info(f"  Total bills: {result['total_bills']}")
                log.info(f"    HoR: {result['hor_count']}")
                log.info(f"    NA:  {result['na_count']}")
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
# INTERACTIVE MENU
# =====================================================================

def show_menu():
    """Display the interactive menu."""
    print("\n" + "="*60)
    print("NEPAL FEDERAL LEGISLATIVE SCRAPER")
    print("="*60)
    print("\nPlease select an option:")
    print("  1. Scrape Bills")
    print("  2. Clean and Normalize Bills Data")
    print("  3. Scrape Bills + Clean/Normalize")
    print("  4. Scrape Committees")
    print("  5. Clean and Normalize Committees Data")
    print("  6. Scrape Committees + Clean/Normalize")
    print("  7. Scrape All (Bills + Committees)")
    print("  8. Scrape All + Clean/Normalize All")
    print("  9. Insert Bills from cleaned JSON (bills_cleaned.json)")
    print("  0. Exit")
    print("="*60)


def run_menu():
    """Run the interactive menu loop."""
    while True:
        show_menu()
        try:
            choice = input("\nEnter your choice (0-9): ").strip()

            if choice == "0":
                print("\nExiting...")
                sys.exit(0)

            elif choice == "1":
                # Scrape Bills
                results = asyncio.run(run_bills_scraper())
                print_report({"bills": results})

            elif choice == "2":
                # Clean Bills
                results = run_bills_cleaner()
                print_report({"bills_clean": results})

            elif choice == "3":
                # Scrape Bills + Clean
                print("\nRunning bills scraper first...")
                results = {}
                results["bills"] = asyncio.run(run_bills_scraper())
                print("\nRunning bills cleaner...")
                results["bills_clean"] = run_bills_cleaner()
                print_report(results)

            elif choice == "4":
                # Scrape Committees
                results = run_committees_scraper()
                print_report({"committees": results})

            elif choice == "5":
                # Clean Committees
                results = run_committees_cleaner()
                print_report({"committees_clean": results})

            elif choice == "6":
                # Scrape Committees + Clean
                print("\nRunning committees scraper first...")
                results = {}
                results["committees"] = run_committees_scraper()
                print("\nRunning committees cleaner...")
                results["committees_clean"] = run_committees_cleaner()
                print_report(results)

            elif choice == "7":
                # Scrape All
                print("\nRunning all scrapers...")
                results = {}
                results["bills"] = asyncio.run(run_bills_scraper())
                results["committees"] = run_committees_scraper()
                print_report(results)

            elif choice == "8":
                # Scrape All + Clean All
                print("\nRunning all scrapers...")
                results = {}
                results["bills"] = asyncio.run(run_bills_scraper())
                results["committees"] = run_committees_scraper()
                print("\nRunning all cleaners...")
                results["bills_clean"] = run_bills_cleaner()
                results["committees_clean"] = run_committees_cleaner()
                print_report(results)

            elif choice == "9":
                # Insert Bills from existing cleaned JSON
                results = run_bills_insert_from_cleaned()
                print_report({"bills_insert": results})

            else:
                print("\nInvalid choice. Please enter a number between 0 and 9.")

        except KeyboardInterrupt:
            print("\n\nExiting...")
            sys.exit(0)
        except Exception as e:
            print(f"\nError: {e}")
            log.error(f"Menu error: {e}", exc_info=True)

        input("\nPress Enter to continue...")


# =====================================================================
# MAIN ENTRY POINT
# =====================================================================

def main():
    """Main entry point."""
    # If no arguments provided, show interactive menu
    if len(sys.argv) == 1:
        run_menu()
        return

    parser = argparse.ArgumentParser(
        description="Nepal Federal Legislative Scraper - Main Controller",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py                           # Interactive menu
  python main.py --menu                     # Interactive menu
  python main.py --all                     # Run all scrapers
  python main.py --bills                   # Run only bills scraper
  python main.py --bills-clean             # Clean and insert bills data
  python main.py --committees              # Run only committees scraper
  python main.py --committees-clean         # Clean and insert committees data
        """
    )

    parser.add_argument(
        "--menu",
        action="store_true",
        help="Show interactive menu"
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
        "--bills-clean",
        action="store_true",
        help="Clean and insert bills data (requires scraped data)"
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

    # Show menu if requested
    if args.menu:
        run_menu()
        return

    # Validate at least one option is selected
    if not any([args.all, args.bills, args.bills_clean, args.committees, args.committees_clean]):
        parser.print_help()
        sys.exit(1)

    results = {}

    # Run bills scraper
    if args.all or args.bills:
        results["bills"] = asyncio.run(run_bills_scraper())

    # Run bills cleaner
    if args.all or args.bills_clean:
        results["bills_clean"] = run_bills_cleaner()

    # Run committees scraper
    if args.all or args.committees:
        results["committees"] = run_committees_scraper()

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
        log.error(f"Failed operations: {', '.join(failed)}")
        sys.exit(1)
    else:
        log.info("All operations completed successfully!")
        sys.exit(0)


if __name__ == "__main__":
    main()
