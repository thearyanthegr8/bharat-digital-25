from fastapi import FastAPI, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from . import models, schemas  # Make sure schemas is imported
from .database import get_db, engine
from typing import List
from fastapi.middleware.cors import CORSMiddleware
import httpx

# Create DB tables on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # <-- This allows all domains
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)


@app.get("/")
def read_root():
    return {"message": "MGNREGA Data API"}


@app.get("/api/geocode/reverse/")
async def reverse_geocode(lat: float = Query(...), lon: float = Query(...)):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}",
                headers={"User-Agent": "MGNREGA-App/1.0 (contact@aryantomar.com)"},
                timeout=10.0,
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"error": str(e)}


@app.get(
    "/api/district",
    response_model=List[
        schemas.DistrictPerformance
    ],  # Use the schema for response structure
    summary="Get Historical Data for a District",
    tags=["Performance Data"],
)
def get_district_data(
    districtName: str = Query(..., description="The name of the district"),
    db: Session = Depends(get_db),
):
    """
    Retrieves all available historical performance records for a specific district,
    ordered by the most recent report date first.

    - **districtName**: The name of the district (case-sensitive, must match database).
    """
    # Query the database for the specified district
    # Order by report_date descending to get the newest records first
    print(districtName.upper())

    data = (
        db.query(models.DistrictPerformance)
        .filter(models.DistrictPerformance.district_name == districtName.upper())
        .order_by(models.DistrictPerformance.report_date.desc())
        .all()
    )

    # If no records are found, return a 404 error
    if not data:
        raise HTTPException(
            status_code=404,
            detail=f"No performance data found for district: {districtName}",
        )

    # Return the list of records. FastAPI handles serialization via response_model.
    return data


# --- NEW ROUTE ADDED HERE ---
@app.get("/api/count", response_model=schemas.RecordCount)
def get_record_count(db: Session = Depends(get_db)):
    """
    Get the total number of performance records in the database.
    """
    count = db.query(models.DistrictPerformance).count()
    return {"total_entries": count}


# --- END OF NEW ROUTE ---


@app.get(
    "/api/district/{district_name}", response_model=List[schemas.DistrictPerformance]
)
def get_district_data(district_name: str, db: Session = Depends(get_db)):
    """
    Get all historical performance data for a single district.
    """
    data = (
        db.query(models.DistrictPerformance)
        .filter(models.DistrictPerformance.district_name == district_name)
        .order_by(models.DistrictPerformance.report_date.desc())
        .all()
    )

    if not data:
        raise HTTPException(status_code=404, detail="District data not found")

    return data
