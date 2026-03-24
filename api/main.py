from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import prediction

app = FastAPI(
    title="Plant Disease Detection API",
    description="A FastAPI-powered REST API for detecting plant diseases using a trained deep learning model.",
    version="1.0.0",
)

# Allow all origins for development (restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prediction.router, prefix="/api/v1", tags=["Prediction"])


@app.get("/", tags=["Health"])
def root():
    return {
        "message": "🌿 Plant Disease Detection API is running!",
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok"}
