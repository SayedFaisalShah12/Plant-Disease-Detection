import uvicorn
from api.services.model_service import load_model

if __name__ == "__main__":
    print("🌿 Starting Plant Disease Detection API...")
    load_model()  # pre-load model before first request
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_excludes=["saved_models/*", "training/*"],
    )
