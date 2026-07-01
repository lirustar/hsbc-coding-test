from pydantic import BaseModel, Field, field_validator
from typing import List
from datetime import datetime


class HouseInput(BaseModel):
    """Single house input"""
    square_footage: float = Field(..., gt=0, le=100000, description="House area in square feet", examples=[1550])
    bedrooms: int = Field(..., gt=0, le=20, description="Number of bedrooms", examples=[3])
    bathrooms: float = Field(..., gt=0, le=20, description="Number of bathrooms", examples=[2.0])
    year_built: int = Field(..., gt=1800, le=datetime.now().year, description="Year built", examples=[1997])
    lot_size: float = Field(..., gt=0, le=1000000, description="Lot size in square feet", examples=[6800])
    distance_to_city_center: float = Field(..., ge=0, le=10, description="Distance to city center (1-10)", examples=[4.1])
    school_rating: float = Field(..., ge=1, le=10, description="School rating (1-10)", examples=[7.6])

    @field_validator("square_footage")
    @classmethod
    def validate_square_footage(cls, v: float) -> float:
        if v is None or v <= 0:
            raise ValueError("square_footage must be a positive number")
        return v

    @field_validator("bedrooms")
    @classmethod
    def validate_bedrooms(cls, v: int) -> int:
        if v is None or v <= 0:
            raise ValueError("bedrooms must be a positive integer")
        return v

    @field_validator("bathrooms")
    @classmethod
    def validate_bathrooms(cls, v: float) -> float:
        if v is None or v <= 0:
            raise ValueError("bathrooms must be a positive number")
        return v

    @field_validator("year_built")
    @classmethod
    def validate_year_built(cls, v: int) -> int:
        if v is None:
            raise ValueError("year_built is required")
        current_year = datetime.now().year
        if v < 1800 or v > current_year:
            raise ValueError(f"year_built must be between 1800 and {current_year}")
        return v

    @field_validator("lot_size")
    @classmethod
    def validate_lot_size(cls, v: float) -> float:
        if v is None or v <= 0:
            raise ValueError("lot_size must be a positive number")
        return v

    @field_validator("distance_to_city_center")
    @classmethod
    def validate_distance_to_city_center(cls, v: float) -> float:
        if v is None or v < 0:
            raise ValueError("distance_to_city_center must be non-negative")
        return v

    @field_validator("school_rating")
    @classmethod
    def validate_school_rating(cls, v: float) -> float:
        if v is None or v < 1 or v > 10:
            raise ValueError("school_rating must be between 1 and 10")
        return v


class PredictionResult(BaseModel):
    """Single prediction result"""
    predicted_price: float = Field(..., description="Predicted price in USD")
    input: HouseInput = Field(..., description="Original input")


class BatchInput(BaseModel):
    """Batch house input"""
    houses: List[HouseInput] = Field(..., min_length=1, description="List of houses")


class BatchResult(BaseModel):
    """Batch prediction result"""
    results: List[PredictionResult] = Field(..., description="List of prediction results")
    total: int = Field(..., description="Total count")
