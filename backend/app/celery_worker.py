# backend/app/celery_worker.py

import os
import requests
from celery import Celery
from pydantic import ValidationError
from datetime import datetime, date
from dotenv import load_dotenv

from .database import SessionLocal, engine
from . import models
from .validation import DataGovRecord


# --- Helper Functions (No Change) ---
def safe_float(val):
    if val is None:
        return None
    try:
        return float(val)
    except (ValueError, TypeError):
        return None


def safe_int(val):
    if val is None:
        return None
    try:
        return int(float(val))
    except (ValueError, TypeError):
        return None


MONTH_MAP = {
    "Jan": 1,
    "Feb": 2,
    "March": 3,
    "April": 4,
    "May": 5,
    "June": 6,
    "July": 7,
    "Aug": 8,
    "Sep": 9,
    "Oct": 10,
    "Nov": 11,
    "Dec": 12,
}


def get_report_date(fin_year: str, month: str) -> date:
    """Calculates the correct date from fin_year and month."""
    try:
        # Use our robust dictionary instead of strptime
        month_num = MONTH_MAP.get(month)
        if not month_num:
            # Month not found in our map
            return None

        year = int(fin_year.split("-")[0])  # e.g., 2024
        if (
            month_num < 4
        ):  # Jan, Feb, Mar (months 1, 2, 3) belong to the *next* calendar year
            year += 1
        return date(year, month_num, 1)  # Use the 1st of the month
    except Exception as e:
        print(f"Error in get_report_date (month: {month}, year: {fin_year}): {e}")
        return None


# --- End Helper Functions ---


# 1. Create the Celery App (No Change)
celery_app = Celery(
    "tasks",
    broker=os.getenv("CELERY_BROKER_URL"),
    backend=os.getenv("CELERY_RESULT_BACKEND"),
)
celery_app.conf.update(
    task_track_started=True,
)


# 2. Define the UPDATED Task
@celery_app.task(
    bind=True,
    autoretry_for=(requests.exceptions.RequestException,),
    retry_backoff=True,
    retry_kwargs={"max_retries": 5},
    rate_limit="60/m",
)
def fetch_state_data_for_month(
    self,
    state_name: str,
    financial_year: str,
    month: str,
    is_historical_backfill: bool = False,
):
    """
    Fetches data for a given state, year, and month.

    - If is_historical_backfill=True: It will SKIP if data already exists.
    - If is_historical_backfill=False: It will DELETE existing data and insert fresh data.
    """

    task_name = f"{state_name}, {financial_year}, {month}"
    print(f"STARTING task for {task_name} (Backfill: {is_historical_backfill})")

    API_URL = "https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722"
    API_KEY = os.getenv("DATA_GOV_API_KEY")

    db = SessionLocal()
    try:

        # --- THIS IS THE NEW OPTIMIZATION LOGIC ---
        if is_historical_backfill:
            # This is a historical task. Check if data already exists.
            first_record = (
                db.query(models.DistrictPerformance)
                .filter(
                    models.DistrictPerformance.fin_year == financial_year,
                    models.DistrictPerformance.month == month,
                    models.DistrictPerformance.state_name == state_name,
                )
                .first()
            )

            if first_record:
                # Data exists, so we skip this entire task.
                print(
                    f"SKIPPING historical backfill for {task_name} (data already exists)."
                )
                return "Skipped historical backfill (data exists)."
        else:
            # This is a refresh for the current year. Delete existing data.
            print(f"DELETING existing records for current period {task_name}...")
            db.query(models.DistrictPerformance).filter(
                models.DistrictPerformance.fin_year == financial_year,
                models.DistrictPerformance.month == month,
                models.DistrictPerformance.state_name == state_name,
            ).delete(synchronize_session=False)
            db.commit()
            print("Delete complete.")
        # --- END OF NEW LOGIC ---

        # (The rest of the function is the same pagination and insertion loop)
        offset = 0
        limit = 1000
        total_records = 0
        all_records_fetched = False
        total_inserted = 0

        while not all_records_fetched:
            params = {
                "api-key": API_KEY,
                "format": "json",
                "offset": offset,
                "limit": limit,
                "filters[state_name]": state_name,
                "filters[fin_year]": financial_year,
                "filters[month]": month,
            }

            print(f"Fetching page for {task_name}: offset={offset}, limit={limit}...")
            response = requests.get(API_URL, params=params)
            response.raise_for_status()

            data = response.json()

            if offset == 0:
                total_records = data.get("total", 0)
                if total_records == 0:
                    print(f"No records found in API for {task_name}.")
                    break

            records = data.get("records", [])
            if not records:
                break

            for record in records:
                try:
                    clean_data = DataGovRecord.model_validate(record)
                except ValidationError as e:
                    print(
                        f"SKIPPING: VALIDATION FAILED for record {record.get('district_name')}: {e}"
                    )
                    continue

                report_date = get_report_date(clean_data.fin_year, clean_data.month)
                if not report_date:
                    print(f"SKIPPING: Invalid date for {clean_data.district_name}")
                    continue

                db_record = models.DistrictPerformance(
                    fin_year=clean_data.fin_year,
                    month=clean_data.month,
                    state_code=clean_data.state_code,
                    state_name=clean_data.state_name,
                    district_code=clean_data.district_code,
                    district_name=clean_data.district_name,
                    report_date=report_date,
                    Approved_Labour_Budget=safe_int(clean_data.Approved_Labour_Budget),
                    Average_Wage_rate_per_day_per_person=safe_float(
                        clean_data.Average_Wage_rate_per_day_per_person
                    ),
                    Average_days_of_employment_provided_per_Household=safe_int(
                        clean_data.Average_days_of_employment_provided_per_Household
                    ),
                    Differently_abled_persons_worked=safe_int(
                        clean_data.Differently_abled_persons_worked
                    ),
                    Material_and_skilled_Wages=safe_float(
                        clean_data.Material_and_skilled_Wages
                    ),
                    Number_of_Completed_Works=safe_int(
                        clean_data.Number_of_Completed_Works
                    ),
                    Number_of_GPs_with_NIL_exp=safe_int(
                        clean_data.Number_of_GPs_with_NIL_exp
                    ),
                    Number_of_Ongoing_Works=safe_int(
                        clean_data.Number_of_Ongoing_Works
                    ),
                    Persondays_of_Central_Liability_so_far=safe_int(
                        clean_data.Persondays_of_Central_Liability_so_far
                    ),
                    SC_persondays=safe_int(clean_data.SC_persondays),
                    SC_workers_against_active_workers=safe_int(
                        clean_data.SC_workers_against_active_workers
                    ),
                    ST_persondays=safe_int(clean_data.ST_persondays),
                    ST_workers_against_active_workers=safe_int(
                        clean_data.ST_workers_against_active_workers
                    ),
                    Total_Adm_Expenditure=safe_float(clean_data.Total_Adm_Expenditure),
                    Total_Exp=safe_float(clean_data.Total_Exp),
                    Total_Households_Worked=safe_int(
                        clean_data.Total_Households_Worked
                    ),
                    Total_Individuals_Worked=safe_int(
                        clean_data.Total_Individuals_Worked
                    ),
                    Total_No_of_Active_Job_Cards=safe_int(
                        clean_data.Total_No_of_Active_Job_Cards
                    ),
                    Total_No_of_Active_Workers=safe_int(
                        clean_data.Total_No_of_Active_Workers
                    ),
                    Total_No_of_HHs_completed_100_Days_of_Wage_Employment=safe_int(
                        clean_data.Total_No_of_HHs_completed_100_Days_of_Wage_Employment
                    ),
                    Total_No_of_JobCards_issued=safe_int(
                        clean_data.Total_No_of_JobCards_issued
                    ),
                    Total_No_of_Workers=safe_int(clean_data.Total_No_of_Workers),
                    Total_No_of_Works_Takenup=safe_int(
                        clean_data.Total_No_of_Works_Takenup
                    ),
                    Wages=safe_float(clean_data.Wages),
                    Women_Persondays=safe_int(clean_data.Women_Persondays),
                    percent_of_Category_B_Works=safe_float(
                        clean_data.percent_of_Category_B_Works
                    ),
                    percent_of_Expenditure_on_Agriculture_Allied_Works=safe_float(
                        clean_data.percent_of_Expenditure_on_Agriculture_Allied_Works
                    ),
                    percent_of_NRM_Expenditure=safe_float(
                        clean_data.percent_of_NRM_Expenditure
                    ),
                    percentage_payments_gererated_within_15_days=safe_float(
                        clean_data.percentage_payments_gererated_within_15_days
                    ),
                    Remarks=clean_data.Remarks,
                )
                db.add(db_record)
                total_inserted += 1

            db.commit()
            print(f"Committed {len(records)} records for this page.")

            offset += len(records)
            if offset >= total_records:
                all_records_fetched = True

        print(
            f"SUCCESS: Task complete. Inserted {total_inserted} total records for {task_name}"
        )
        return f"Successfully inserted {total_inserted} records."

    except requests.exceptions.RequestException as e:
        print(f"NETWORK ERROR for {task_name}: {e}. Retrying...")
        db.rollback()
        raise self.retry(exc=e)
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        db.rollback()
    finally:
        db.close()


# Create tables on worker startup (No Change)
def create_tables():
    models.Base.metadata.create_all(bind=engine)


create_tables()
