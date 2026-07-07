import httpx
import os
from typing import Any, Dict, List

from app.schemas import HouseInput, BatchInput, PredictionResult, BatchResult

PREDICTION_API_BASE = os.getenv("PREDICTION_API_BASE_URL", "http://localhost:8000")


class PredictionClient:
    """Client for the Housing Price Prediction API"""

    def __init__(self, base_url: str = PREDICTION_API_BASE):
        self.base_url = base_url

    async def predict_single(self, house: HouseInput) -> PredictionResult:
        """Predict price for a single house"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/predict",
                json=house.model_dump(),
                timeout=30.0,
            )
            response.raise_for_status()
            return PredictionResult(**response.json())

    async def predict_batch(self, houses: List[HouseInput]) -> BatchResult:
        """Predict prices for multiple houses"""
        batch_input = BatchInput(houses=houses)
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/predict/batch",
                json=batch_input.model_dump(),
                timeout=60.0,
            )
            response.raise_for_status()
            return BatchResult(**response.json())

    async def get_model_info(self) -> Dict[str, Any]:
        """Query model information"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/model-info",
                timeout=10.0,
            )
            response.raise_for_status()
            return response.json()

    async def health_check(self) -> Dict[str, Any]:
        """Check prediction service health"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/",
                timeout=5.0,
            )
            response.raise_for_status()
            return response.json()


prediction_client = PredictionClient()
