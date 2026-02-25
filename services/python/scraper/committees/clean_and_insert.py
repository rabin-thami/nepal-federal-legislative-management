#!/usr/bin/env python3
"""
Committee Data Cleaner and Database Inserter

This script reads committees.json, cleans/normalizes the data,
and inserts it into the PostgreSQL database.
"""

import json
import re
import os
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any

import psycopg2
from psycopg2 import sql
from psycopg2.extras import execute_values
from dotenv import load_dotenv

# Load environment variables - .env is at project root
project_root = Path(__file__).parent.parent.parent.parent.parent
load_dotenv(project_root / '.env')


# Valid committee types from schema
VALID_COMMITTEE_TYPES = ["HoR", "NA"]


def clean_text(text: str) -> str:
    """Clean and normalize text content."""
    if not text:
        return ""

    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text.strip())

    # Remove zero-width characters
    text = text.replace('\u200b', '').replace('\u200c', '').replace('\u200d', '')

    # Clean up punctuation
    text = re.sub(r'[,\.]\s*$', '', text)

    return text.strip()


def parse_date(date_str: Optional[str]) -> Optional[str]:
    """Parse date string to YYYY-MM-DD format."""
    if not date_str or date_str.lower() == 'null':
        return None

    date_str = str(date_str).strip()

    # If already in YYYY-MM-DD format, validate and return
    if re.match(r'^\d{4}-\d{2}-\d{2}$', date_str):
        try:
            datetime.strptime(date_str, '%Y-%m-%d')
            return date_str
        except ValueError:
            pass

    # Try various date formats
    for fmt in ['%Y/%m/%d', '%Y-%m-%d', '%d/%m/%Y', '%d-%m-%Y',
                '%Y.%m.%d', '%d.%m.%Y']:
        try:
            parsed = datetime.strptime(date_str, fmt)
            return parsed.strftime('%Y-%m-%d')
        except ValueError:
            continue

    return None


def normalize_committee_name(name: str) -> str:
    """Normalize committee name."""
    if not name:
        raise ValueError("Committee name cannot be empty")

    name = clean_text(name)
    name = re.sub(r'\s+', ' ', name)

    # Standardize parentheses spacing
    name = re.sub(r'\s*\(\s*', ' (', name)
    name = re.sub(r'\s*\)\s*', ') ', name)
    name = name.strip()

    return name


def clean_introduction(intro: str) -> str:
    """Clean the introduction text."""
    if not intro:
        return ""

    # Remove common headers
    intro = re.sub(r'^संक्षिप्‍त परिचय:\s*', '', intro)
    intro = re.sub(r'^परिचय:\s*', '', intro)
    intro = re.sub(r'^परिचय\s*', '', intro)

    # Clean up text
    intro = clean_text(intro)

    return intro


def validate_committee(committee: Dict[str, Any]) -> Dict[str, Any]:
    """Validate a committee record."""
    errors = []

    if not committee.get('name'):
        errors.append("Missing 'name' field")
    if not committee.get('type'):
        errors.append("Missing 'type' field")
    if not committee.get('introduction'):
        errors.append("Missing 'introduction' field")

    if errors:
        raise ValueError(f"Validation errors: {', '.join(errors)}")

    # Validate type is in enum
    if committee['type'] not in VALID_COMMITTEE_TYPES:
        raise ValueError(f"Invalid type '{committee['type']}'. Must be one of {VALID_COMMITTEE_TYPES}")

    return committee


def clean_committee_data(raw_data: list) -> list:
    """Clean and normalize raw committee data."""
    cleaned_data = []

    for idx, raw_committee in enumerate(raw_data, 1):
        try:
            print(f"Processing committee {idx}/{len(raw_data)}: {raw_committee.get('name', 'Unknown')}")

            # Extract and clean fields
            name = normalize_committee_name(raw_committee.get('name', ''))
            committee_type = raw_committee.get('type', '')
            start_date = parse_date(raw_committee.get('start_date'))
            end_date = parse_date(raw_committee.get('end_date'))
            introduction = clean_introduction(raw_committee.get('introduction', ''))

            # Build cleaned committee object
            cleaned = {
                'type': committee_type,
                'name': name,
                'start_date': start_date,
                'end_date': end_date,
                'introduction': introduction,
            }

            # Validate
            validate_committee(cleaned)

            cleaned_data.append(cleaned)

        except Exception as e:
            print(f"  ✗ Error: {e}")
            continue

    return cleaned_data


def deduplicate_committees(committees: list) -> list:
    """Remove duplicate committees by name."""
    seen_names = set()
    unique_committees = []

    for committee in committees:
        name = committee['name']
        if name not in seen_names:
            seen_names.add(name)
            unique_committees.append(committee)
        else:
            print(f"  ⚠ Duplicate committee removed: {name}")

    return unique_committees


def get_db_connection():
    """Get database connection from environment variables."""
    db_url = os.getenv('DATABASE_URL')

    if not db_url:
        # Try to build connection string from individual variables
        db_user = os.getenv('POSTGRES_USER')
        db_password = os.getenv('POSTGRES_PASSWORD')
        db_host = os.getenv('POSTGRES_HOST', 'localhost')
        db_port = os.getenv('POSTGRES_PORT', '5432')
        db_name = os.getenv('POSTGRES_DB', 'postgres')

        if not all([db_user, db_password]):
            raise ValueError(
                "DATABASE_URL not set. Either set DATABASE_URL or "
                "POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_DB environment variables."
            )

        db_url = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"

    return psycopg2.connect(db_url)


def insert_committees(committees: list) -> None:
    """Insert committees into the database."""
    print(f"\nConnecting to database...")

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # Check if committee_type enum exists
            cursor.execute("""
                SELECT EXISTS (
                    SELECT 1 FROM pg_type
                    WHERE typname = 'committee_type'
                );
            """)
            enum_exists = cursor.fetchone()[0]

            if not enum_exists:
                print("  ✗ Error: committee_type enum does not exist in database")
                print("  Please run your database migration first to create the schema.")
                return

            # Prepare data for insertion
            records = []
            for committee in committees:
                records.append((
                    committee['type'],
                    committee['name'],
                    committee['start_date'],
                    committee['end_date'],
                    committee['introduction'],
                ))

            # Use execute_values for bulk insert
            query = sql.SQL("""
                INSERT INTO committee (type, name, start_date, end_date, introduction)
                VALUES %s
                ON CONFLICT (name) DO UPDATE SET
                    type = EXCLUDED.type,
                    start_date = EXCLUDED.start_date,
                    end_date = EXCLUDED.end_date,
                    introduction = EXCLUDED.introduction
                RETURNING id, name
            """)

            print(f"  Inserting {len(records)} committee records...")
            execute_values(cursor, query, records, page_size=100)

            # Get count of inserted/updated rows
            inserted_count = cursor.rowcount

            print(f"  ✓ Successfully processed {inserted_count} committee records")

        conn.commit()

    except psycopg2.Error as e:
        conn.rollback()
        print(f"  ✗ Database error: {e}")
        raise
    finally:
        conn.close()


def print_statistics(original: list, cleaned: list) -> None:
    """Print statistics about the cleaning process."""
    print("\n" + "=" * 50)
    print("CLEANING STATISTICS")
    print("=" * 50)
    print(f"Original records:  {len(original)}")
    print(f"Cleaned records:   {len(cleaned)}")
    print(f"Records removed:   {len(original) - len(cleaned)}")

    # Type breakdown
    type_counts = {}
    for c in cleaned:
        type_counts[c['type']] = type_counts.get(c['type'], 0) + 1

    print("\nType breakdown:")
    for type_, count in sorted(type_counts.items()):
        print(f"  {type_}: {count}")

    # Date coverage
    with_start = sum(1 for c in cleaned if c['start_date'])
    with_end = sum(1 for c in cleaned if c['end_date'])
    print(f"\nRecords with start_date: {with_start}/{len(cleaned)}")
    print(f"Records with end_date:   {with_end}/{len(cleaned)}")
    print("=" * 50)


def main():
    """Main entry point."""
    # Define paths
    base_dir = Path(__file__).parent.parent.parent.parent
    input_path = Path(__file__).parent / 'data' / 'committees.json'
    output_path = Path(__file__).parent / 'data' / 'committees_cleaned.json'

    # Read input data
    print(f"Reading data from {input_path}...")
    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            raw_data = json.load(f)
    except FileNotFoundError:
        print(f"  ✗ Error: Input file not found: {input_path}")
        return
    except json.JSONDecodeError as e:
        print(f"  ✗ Error: Invalid JSON in input file: {e}")
        return

    print(f"  ✓ Loaded {len(raw_data)} records\n")

    # Clean data
    print("Cleaning and normalizing data...")
    cleaned_data = clean_committee_data(raw_data)

    # Remove duplicates
    print("\nRemoving duplicates...")
    cleaned_data = deduplicate_committees(cleaned_data)

    # Save cleaned data
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(cleaned_data, f, ensure_ascii=False, indent=2)
    print(f"\n✓ Saved {len(cleaned_data)} cleaned records to {output_path}")

    # Print statistics
    print_statistics(raw_data, cleaned_data)

    # Insert into database
    try:
        print("\nInserting into database...")
        insert_committees(cleaned_data)
        print("\n✓ All done!")
    except Exception as e:
        print(f"\n✗ Database insertion failed: {e}")
        return


if __name__ == '__main__':
    main()
