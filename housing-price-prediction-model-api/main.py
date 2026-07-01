"""
Housing Price Prediction API Service
Built with FastAPI + CatBoost, supporting single and batch house price predictions.
"""

import os
import json
from contextlib import asynccontextmanager
from typing import Optional

import numpy as np
import pandas as pd
from catboost import CatBoostRegressor, Pool
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from feature_engineering import build_features, get_feature_columns, CAT_FEATURES

# ─────────────────────────────────────────────
# Global variables
# ─────────────────────────────────────────────
BASE_DIR       = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH     = os.path.join(BASE_DIR, "model", "catboost_model.cbm")
MODEL_INFO_PATH = os.path.join(BASE_DIR, "model", "model_info.json")
model: Optional[CatBoostRegressor] = None
model_info: dict = {}
feature_cols: list = []


# ─────────────────────────────────────────────
# Startup / shutdown lifecycle
# ─────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    global model, model_info, feature_cols
    # Load model on startup
    if not os.path.exists(MODEL_PATH):
        raise RuntimeError(
            f"Model file not found: {MODEL_PATH}. Please run train_catboost.py first."
        )
    model = CatBoostRegressor()
    model.load_model(MODEL_PATH)
    # Load model metadata
    if os.path.exists(MODEL_INFO_PATH):
        with open(MODEL_INFO_PATH, "r", encoding="utf-8") as f:
            model_info = json.load(f)
    else:
        model_info = {}
    # Infer feature columns using a dummy DataFrame
    sample = build_features(pd.DataFrame({
        "square_footage": [0], "bedrooms": [0], "bathrooms": [0],
        "year_built": [0], "lot_size": [0],
        "distance_to_city_center": [0], "school_rating": [0],
    }))
    feature_cols = get_feature_columns(sample)
    print("Model loaded successfully. API is ready.")
    yield
    model = None


app = FastAPI(
    title="Housing Price Prediction API",
    description="CatBoost-based housing price prediction service, supporting single and batch predictions.",
    version="1.0.0",
    lifespan=lifespan,
)


# ─────────────────────────────────────────────
# Pydantic request / response models
# ─────────────────────────────────────────────
class HouseInput(BaseModel):
    """Single house input"""
    square_footage: float = Field(..., description="House area in square feet", examples=[1550])
    bedrooms: int         = Field(..., description="Number of bedrooms", examples=[3])
    bathrooms: float      = Field(..., description="Number of bathrooms", examples=[2.0])
    year_built: int       = Field(..., description="Year built", examples=[1997])
    lot_size: float       = Field(..., description="Lot size in square feet", examples=[6800])
    distance_to_city_center: float = Field(..., description="Distance to city center in miles", examples=[4.1])
    school_rating: float  = Field(..., description="School rating (1-10)", examples=[7.6])


class BatchInput(BaseModel):
    """Batch house input"""
    houses: list[HouseInput] = Field(..., description="List of houses", min_length=3)


class PredictionResult(BaseModel):
    """Single prediction result"""
    predicted_price: float = Field(..., description="Predicted price in USD")
    input: HouseInput      = Field(..., description="Original input")


class BatchResult(BaseModel):
    """Batch prediction result"""
    results: list[PredictionResult] = Field(..., description="List of prediction results")
    total: int                      = Field(..., description="Total count")


# ─────────────────────────────────────────────
# Prediction utility function
# ─────────────────────────────────────────────
def _predict(house: HouseInput) -> float:
    """Apply feature engineering and predict price for a single house."""
    df = pd.DataFrame([house.model_dump()])
    feat_df = build_features(df)
    pool = Pool(data=feat_df[feature_cols], cat_features=CAT_FEATURES)
    return float(model.predict(pool)[0])


# ─────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────
@app.get("/", tags=["Health Check"])
def root():
    """Service health check"""
    return {"status": "ok", "model_loaded": model is not None}


@app.post("/predict", response_model=PredictionResult, tags=["Prediction"])
def predict_single(house: HouseInput):
    """
    Predict price for a single house

    Accepts one house property and returns the predicted price.
    """
    try:
        price = _predict(house)
        return PredictionResult(predicted_price=round(price, 2), input=house)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.post("/predict/batch", response_model=BatchResult, tags=["Prediction"])
def predict_batch(batch: BatchInput):
    """
    Predict prices for multiple houses

    Accepts a list of house properties and returns predicted prices for each.
    """
    try:
        df = pd.DataFrame([h.model_dump() for h in batch.houses])
        feat_df = build_features(df)
        pool = Pool(data=feat_df[feature_cols], cat_features=CAT_FEATURES)
        prices = model.predict(pool)

        results = [
            PredictionResult(predicted_price=round(float(p), 2), input=h)
            for p, h in zip(prices, batch.houses)
        ]
        return BatchResult(results=results, total=len(results))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}")


@app.get("/model-info", tags=["Model Info"])
def get_model_info():
    """
    Query model information

    Returns model name, training parameters, evaluation metrics and feature importance.
    """
    if not model_info:
        raise HTTPException(status_code=404, detail="Model metadata not loaded. Please ensure model_info.json exists.")
    return model_info
