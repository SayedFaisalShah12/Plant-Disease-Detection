import tensorflow as tf
from pathlib import Path

# ── Config ────────────────────────────────────────────────────────────────────
BASE_PATH = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_PATH
SAVED_MODELS_PATH = PROJECT_ROOT / "saved_models"
KERAS_MODEL_PATH = SAVED_MODELS_PATH / "pdd_best.keras"

# TF Serving expects models/model_name/version/ (e.g., models/pdd/1/)
TF_SERVING_BASE = PROJECT_ROOT / "models" / "pdd"
VERSION = "1"
EXPORT_PATH = TF_SERVING_BASE / VERSION

def export_model():
    print(f"📦 Loading Keras model from {KERAS_MODEL_PATH}...")
    model = tf.keras.models.load_model(str(KERAS_MODEL_PATH))

    print(f"🚀 Exporting to SavedModel format at: {EXPORT_PATH}")
    
    # Create the directory if it doesn't exist
    EXPORT_PATH.mkdir(parents=True, exist_ok=True)
    
    # Save the model in TF SavedModel format
    tf.saved_model.save(model, str(EXPORT_PATH))
    print("✅ Model successfully exported for TF Serving!")

if __name__ == "__main__":
    export_model()
