import numpy as np
from PIL import Image
from tensorflow import keras
from pathlib import Path

# ── Config ────────────────────────────────────────────────────────────────────
MODEL_PATH = Path(__file__).resolve().parents[2] / "saved_models" / "pdd_best.keras"
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

# ── Singleton Model ────────────────────────────────────────────────────────────
_model = None


def load_model() -> None:
    """Load the Keras model once into memory."""
    global _model
    if _model is None:
        print(f"[ModelService] Loading model from: {MODEL_PATH}")
        _model = keras.models.load_model(str(MODEL_PATH))
        print("[ModelService] Model loaded successfully ✔")


def get_model():
    if _model is None:
        load_model()
    return _model


# ── Preprocessing ──────────────────────────────────────────────────────────────
def preprocess_image(image: Image.Image) -> np.ndarray:
    """Resize, convert to RGB array, and normalise to [0, 1]."""
    image = image.convert("RGB").resize(IMG_SIZE)
    arr = np.array(image, dtype=np.float32) / 255.0
    return np.expand_dims(arr, axis=0)  # (1, H, W, 3)


# ── Prediction ────────────────────────────────────────────────────────────────
def predict(image: Image.Image) -> dict:
    """Run inference and return a structured prediction result."""
    model = get_model()
    tensor = preprocess_image(image)
    predictions = model.predict(tensor)[0]  # shape: (num_classes,)

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
