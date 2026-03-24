import numpy as np
import requests
from PIL import Image
from pathlib import Path

# ── Config ────────────────────────────────────────────────────────────────────
# TF Serving endpoint (default port 8501)
TF_SERVING_URL = "http://localhost:8501/v1/models/pdd:predict"

IMG_SIZE = (256, 256)

CLASS_NAMES = [
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
]

DISEASE_MESSAGES = {
    "Potato___Early_blight": (
        "Early Blight detected. Caused by Alternaria solani fungus. "
        "Apply fungicides containing chlorothalonil or mancozeb and remove infected leaves."
    ),
    "Potato___Late_blight": (
        "Late Blight detected. Caused by Phytophthora infestans. "
        "Use copper-based fungicides immediately and avoid overhead irrigation."
    ),
    "Potato___healthy": "The plant appears healthy. No disease detected. Keep up good agricultural practices!",
}

def load_model() -> None:
    """No local loading needed for TF Serving."""
    print(f"[ModelService] Configured to use TF Serving at: {TF_SERVING_URL}")

def get_model():
    """Placeholder as model is hosted externally."""
    return None

# ── Preprocessing ──────────────────────────────────────────────────────────────
def preprocess_image(image: Image.Image) -> np.ndarray:
    """Resize, convert to RGB array, and normalise to [0, 1]."""
    image = image.convert("RGB").resize(IMG_SIZE)
    arr = np.array(image, dtype=np.float32) / 255.0
    return np.expand_dims(arr, axis=0)  # (1, 256, 256, 3)

# ── Prediction ────────────────────────────────────────────────────────────────
def predict(image: Image.Image) -> dict:
    """Send preprocessing image to TF Serving and return structured result."""
    tensor = preprocess_image(image)
    
    # TF Serving expects JSON: {"instances": [[...]]}
    payload = {
        "instances": tensor.tolist()
    }
    
    response = requests.post(TF_SERVING_URL, json=payload)
    
    if response.status_code != 200:
        raise Exception(f"TF Serving error: {response.text}")
        
    predictions = response.json()["predictions"][0]  # shape: (num_classes,)

    predicted_idx = int(np.argmax(predictions))
    predicted_class = CLASS_NAMES[predicted_idx]
    confidence = float(predictions[predicted_idx])

    all_predictions = [
        {"label": CLASS_NAMES[i], "confidence": float(predictions[i])}
        for i in range(len(CLASS_NAMES))
    ]

    return {
        "predicted_class": predicted_class,
        "confidence": round(confidence * 100, 2),
        "all_predictions": [
            {"label": p["label"], "confidence": round(p["confidence"] * 100, 2)}
            for p in all_predictions
        ],
        "is_healthy": predicted_class == "Potato___healthy",
        "message": DISEASE_MESSAGES.get(predicted_class, "Unknown prediction."),
    }
