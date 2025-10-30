# backend/app/validation.py

from pydantic import BaseModel, validator
from typing import Optional, Any


def clean_na_values(value: Any) -> Optional[Any]:
    """Converts 'NA' or empty strings to None."""
    if isinstance(value, str) and (value.strip() == "NA" or value.strip() == ""):
        return None
    return value


class DataGovRecord(BaseModel):
    # These fields MUST match the JSON keys from the 'records' array
    fin_year: Optional[str] = None
    month: Optional[str] = None
    state_code: Optional[str] = None
    state_name: Optional[str] = None
    district_code: Optional[str] = None
    district_name: Optional[str] = None
    Approved_Labour_Budget: Optional[str] = None
    Average_Wage_rate_per_day_per_person: Optional[str] = None
    Average_days_of_employment_provided_per_Household: Optional[str] = None
    Differently_abled_persons_worked: Optional[str] = None
    Material_and_skilled_Wages: Optional[str] = None
    Number_of_Completed_Works: Optional[str] = None
    Number_of_GPs_with_NIL_exp: Optional[str] = None
    Number_of_Ongoing_Works: Optional[str] = None
    Persondays_of_Central_Liability_so_far: Optional[str] = None
    SC_persondays: Optional[str] = None
    SC_workers_against_active_workers: Optional[str] = None
    ST_persondays: Optional[str] = None
    ST_workers_against_active_workers: Optional[str] = None
    Total_Adm_Expenditure: Optional[str] = None
    Total_Exp: Optional[str] = None
    Total_Households_Worked: Optional[str] = None
    Total_Individuals_Worked: Optional[str] = None
    Total_No_of_Active_Job_Cards: Optional[str] = None
    Total_No_of_Active_Workers: Optional[str] = None
    Total_No_of_HHs_completed_100_Days_of_Wage_Employment: Optional[str] = None
    Total_No_of_JobCards_issued: Optional[str] = None
    Total_No_of_Workers: Optional[str] = None
    Total_No_of_Works_Takenup: Optional[str] = None
    Wages: Optional[str] = None
    Women_Persondays: Optional[str] = None
    percent_of_Category_B_Works: Optional[str] = None
    percent_of_Expenditure_on_Agriculture_Allied_Works: Optional[str] = None
    percent_of_NRM_Expenditure: Optional[str] = None
    percentage_payments_gererated_within_15_days: Optional[str] = None
    Remarks: Optional[str] = None

    # --- Pydantic Validator ---
    # This runs on every field before any other validation
    _clean_all = validator("*", pre=True, allow_reuse=True)(clean_na_values)
