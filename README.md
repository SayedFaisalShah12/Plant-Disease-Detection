# Plant Disease Detection — FastAPI Backend

## Project Structure

```
PDD/
├── api/
│   ├── __init__.py
│   ├── main.py              ← FastAPI app & CORS config
│   ├── routes/
│   │   ├── __init__.py
│   │   └── prediction.py    ← POST /api/v1/predict, GET /api/v1/classes
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── prediction.py    ← Pydantic response models
│   └── services/
│       ├── __init__.py
│       └── model_service.py ← Model loading & inference logic
├── saved_models/
│   └── pdd_best.keras       ← Trained Keras model
├── training/                ← Dataset & notebook
├── run.py                   ← Server entry point
├── requirements.txt
└── training.ipynb
```

## Setup & Run

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Start the server
python run.py
```

The API will be available at: **http://localhost:8000**

## API Endpoints

| Method | Endpoint               | Description                          |
|--------|------------------------|--------------------------------------|
| GET    | `/`                    | Health check / welcome message       |
| GET    | `/health`              | Simple status check                  |
| POST   | `/api/v1/predict`      | Upload leaf image → get prediction   |
| GET    | `/api/v1/classes`      | List all supported disease classes   |

Interactive docs: **http://localhost:8000/docs**

## Example Usage (curl)

```bash
curl -X POST "http://localhost:8000/api/v1/predict" \
  -H "accept: application/json" \
  -F "file=@your_potato_leaf.jpg"
```

## Example Response

```json
{
  "predicted_class": "Potato___Early_blight",
  "confidence": 97.43,
  "all_predictions": [
    { "label": "Potato___Early_blight", "confidence": 97.43 },
    { "label": "Potato___Late_blight",  "confidence": 1.89 },
    { "label": "Potato___healthy",      "confidence": 0.68 }
  ],
  "is_healthy": false,
  "message": "Early Blight detected. Caused by Alternaria solani fungus. Apply fungicides..."
}
```
