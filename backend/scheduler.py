# backend/scheduler.py

from app.celery_worker import fetch_state_data_for_month

# --- CONFIGURATION ---
STATE_TO_FETCH = "UTTAR PRADESH"

# Define the "live" year that needs refreshing
CURRENT_FINANCIAL_YEAR = "2024-2025"

# Define all years you want in your database
FINANCIAL_YEARS = [
    "2024-2025",
    "2023-2024",
    "2022-2023",
    "2021-2022",
    "2020-2021",
    "2019-2020",
    "2018-2019",
]
MONTHS = [
    "Jan",
    "Feb",
    "March",
    "April",
    "May",
    "June",
    "July",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
]


def queue_all_jobs():
    print("Queueing all data fetching jobs (with optimization)...")
    job_count = 0

    for year in FINANCIAL_YEARS:

        # This is our new logic!
        # If the year is not the current one, it's a historical backfill.
        is_historical_backfill = year != CURRENT_FINANCIAL_YEAR

        for month in MONTHS:
            fetch_state_data_for_month.delay(
                state_name=STATE_TO_FETCH,
                financial_year=year,
                month=month,
                # We pass the new flag to the task
                is_historical_backfill=is_historical_backfill,
            )
            job_count += 1

    print(f"Done! Queued {job_count} jobs.")
    print(f"Historical 'Backfill' jobs (will skip if data exists): {job_count - 12}")
    print(f"Current Year 'Refresh' jobs (will delete-then-insert): 12")


if __name__ == "__main__":
    queue_all_jobs()
