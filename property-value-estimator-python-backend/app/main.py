import uvicorn
import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from typing import List

from app.schemas import HouseInput, PredictionResult, BatchResult
from app.prediction_client import prediction_client

app = FastAPI(title="Property Value Estimator", version="0.1.0")

logger = logging.getLogger(__name__)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors with detailed error messages"""
    errors = []
    for error in exc.errors():
        field = " -> ".join(str(loc) for loc in error["loc"])
        msg = error["msg"]
        errors.append({"field": field, "message": msg})
    
    return JSONResponse(
        status_code=422,
        content={
            "error": "Validation Error",
            "detail": errors
        }
    )


@app.get("/")
async def root():
    return {"message": "Property Value Estimator API"}


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.post("/predict", response_model=PredictionResult)
async def predict_single(house: HouseInput):
    """Predict price for a single house by calling the remote prediction service"""
    try:
        result = await prediction_client.predict_single(house)
        return result
    except Exception as e:
        logger.error(f"Prediction service error: {str(e)}")
        raise HTTPException(status_code=502, detail=f"Prediction service error: {str(e)}")


@app.post("/predict/batch", response_model=BatchResult)
async def predict_batch(houses: List[HouseInput]):
    """Predict prices for multiple houses by calling the remote prediction service"""
    if not houses:
        raise HTTPException(status_code=400, detail="houses list cannot be empty")
    
    try:
        result = await prediction_client.predict_batch(houses)
        return result
    except Exception as e:
        logger.error(f"Prediction service error: {str(e)}")
        raise HTTPException(status_code=502, detail=f"Prediction service error: {str(e)}")


@app.get("/model-info")
async def get_model_info():
    """Query model information from the remote prediction service"""
    try:
        info = await prediction_client.get_model_info()
        return info
    except Exception as e:
        logger.error(f"Prediction service error: {str(e)}")
        raise HTTPException(status_code=502, detail=f"Prediction service error: {str(e)}")


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8002, reload=True)
