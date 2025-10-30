# backend/app/models.py

from sqlalchemy import Column, Integer, String, Float, Date, BigInteger
from .database import Base


class DistrictPerformance(Base):
    __tablename__ = "district_performance"

    id = Column(Integer, primary_key=True, index=True)

    # Key Fields
    fin_year = Column(String)
    month = Column(String)
    state_code = Column(String)
    state_name = Column(String)
    district_code = Column(String)
    district_name = Column(String, index=True)
    report_date = Column(
        Date, index=True
    )  # We will create this from fin_year and month

    # --- Data Fields (from data.gov.in) ---
    Approved_Labour_Budget = Column(BigInteger)
    Average_Wage_rate_per_day_per_person = Column(Float)
    Average_days_of_employment_provided_per_Household = Column(BigInteger)
    Differently_abled_persons_worked = Column(BigInteger)
    Material_and_skilled_Wages = Column(Float)
    Number_of_Completed_Works = Column(BigInteger)
    Number_of_GPs_with_NIL_exp = Column(BigInteger)
    Number_of_Ongoing_Works = Column(BigInteger)
    Persondays_of_Central_Liability_so_far = Column(BigInteger)
    SC_persondays = Column(BigInteger)
    SC_workers_against_active_workers = Column(BigInteger)
    ST_persondays = Column(BigInteger)
    ST_workers_against_active_workers = Column(BigInteger)
    Total_Adm_Expenditure = Column(Float)
    Total_Exp = Column(Float)
    Total_Households_Worked = Column(BigInteger)
    Total_Individuals_Worked = Column(BigInteger)
    Total_No_of_Active_Job_Cards = Column(BigInteger)
    Total_No_of_Active_Workers = Column(BigInteger)
    Total_No_of_HHs_completed_100_Days_of_Wage_Employment = Column(BigInteger)
    Total_No_of_JobCards_issued = Column(BigInteger)
    Total_No_of_Workers = Column(BigInteger)
    Total_No_of_Works_Takenup = Column(BigInteger)
    Wages = Column(Float)
    Women_Persondays = Column(BigInteger)
    percent_of_Category_B_Works = Column(Float)
    percent_of_Expenditure_on_Agriculture_Allied_Works = Column(Float)
    percent_of_NRM_Expenditure = Column(Float)
    percentage_payments_gererated_within_15_days = Column(Float)
    Remarks = Column(String)

    # __table_args__ has been REMOVED
