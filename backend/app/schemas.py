from pydantic import BaseModel
from datetime import date
from typing import Optional


class DistrictPerformance(BaseModel):
    # This must match your models.py
    id: int
    fin_year: Optional[str] = None
    month: Optional[str] = None
    state_name: Optional[str] = None
    district_name: Optional[str] = None
    report_date: Optional[date] = None

    # --- Add all the data fields you want to show on the frontend ---
    Approved_Labour_Budget: Optional[float] = None
    Average_Wage_rate_per_day_per_person: Optional[float] = None
    Average_days_of_employment_provided_per_Household: Optional[int] = None
    Differently_abled_persons_worked: Optional[int] = None
    Material_and_skilled_Wages: Optional[float] = None
    Number_of_Completed_Works: Optional[int] = None
    Number_of_GPs_with_NIL_exp: Optional[int] = None
    Number_of_Ongoing_Works: Optional[int] = None
    Persondays_of_Central_Liability_so_far: Optional[int] = None
    SC_persondays: Optional[int] = None
    SC_workers_against_active_workers: Optional[int] = None
    ST_persondays: Optional[int] = None
    ST_workers_against_active_workers: Optional[int] = None
    Total_Adm_Expenditure: Optional[float] = None
    Total_Exp: Optional[float] = None  # THIS WAS MISSING!
    Total_Households_Worked: Optional[int] = None
    Total_Individuals_Worked: Optional[int] = None
    Total_No_of_Active_Job_Cards: Optional[int] = None
    Total_No_of_Active_Workers: Optional[int] = None
    Total_No_of_HHs_completed_100_Days_of_Wage_Employment: Optional[int] = None
    Total_No_of_JobCards_issued: Optional[int] = None
    Total_No_of_Workers: Optional[int] = None
    Total_No_of_Works_Takenup: Optional[int] = None
    Wages: Optional[float] = None
    Women_Persondays: Optional[int] = None
    percent_of_Category_B_Works: Optional[float] = None
    percent_of_Expenditure_on_Agriculture_Allied_Works: Optional[float] = None
    percent_of_NRM_Expenditure: Optional[float] = None
    percentage_payments_gererated_within_15_days: Optional[float] = None
    Remarks: Optional[str] = None

    # Add any other fields you need...

    class Config:
        from_attributes = True


# --- NEW SCHEMA ADDED HERE ---
class RecordCount(BaseModel):
    """Simple schema for returning a total count."""

    total_entries: int
