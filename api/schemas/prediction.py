from pydantic import BaseModel
from typing import List


class ClassProbability(BaseModel):
    label: str
    confidence: float


class PredictionResponse(BaseModel):
    predicted_class: str
    confidence: float
    all_predictions: List[ClassProbability]
    is_healthy: bool
    message: str
