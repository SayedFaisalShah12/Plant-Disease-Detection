import io
from fastapi import APIRouter, File, UploadFile, HTTPException
from PIL import Image

from api.services.model_service import predict
from api.schemas.prediction import PredictionResponse

router = APIRouter()

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp"}


@router.post("/predict", response_model=PredictionResponse, summary="Predict plant disease from image")
async def predict_disease(file: UploadFile = File(..., description="Upload a potato leaf image (JPEG/PNG)")):
    """
    Upload a potato leaf image and receive a disease prediction.

    - **predicted_class**: The class with the highest confidence
    - **confidence**: Confidence percentage (0–100)
    - **all_predictions**: Probabilities for all classes
    - **is_healthy**: True if no disease is detected
    - **message**: Human-readable advice
    """
    # ── Validate content type ──────────────────────────────────────────────────
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{file.content_type}'. Please upload a JPEG or PNG image.",
        )

    # ── Read & open image ──────────────────────────────────────────────────────
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read the uploaded file. Make sure it is a valid image.")

    # ── Run inference ──────────────────────────────────────────────────────────
    try:
        result = predict(image)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    return result


@router.get("/classes", summary="List all supported disease classes")
def get_classes():
    """Returns the list of plant disease classes the model can predict."""
    from api.services.model_service import CLASS_NAMES
    return {"classes": CLASS_NAMES, "total": len(CLASS_NAMES)}
