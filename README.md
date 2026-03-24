# Plant Disease Detection — Production Stack

This project uses a production-grade architecture with **FastAPI** as the gateway and **TensorFlow Serving** for scalable model inference.

## 📁 Architecture

```
PDD/
├── api/             ← FastAPI Gateway
│   ├── main.py
│   ├── routes/
│   ├── schemas/
│   └── services/    ← model_service.py (talks to TF Serving)
├── models/
│   └── pdd/
│       └── 1/       ← Versioned SavedModel
│           ├── saved_model.pb
│           └── variables/
├── run.py           ← FastAPI Entry Point
├── start_serving.bat ← TF Serving Docker Entry Point
├── requirements.txt
└── export_model.py  ← Keras-to-SavedModel Exporter
```

## 🚀 How to Run

### 1. Start TensorFlow Serving (Docker required)
Run the batch script:
```cmd
start_serving.bat
```
*Alternatively (Manual Docker command):*
```bash
docker run -p 8501:8501 --name tf_serving_pdd --mount type=bind,source=E:/Deep Learning/Z-Projects/PDD/models/pdd,target=/models/pdd -e MODEL_NAME=pdd -t tensorflow/serving
```

### 2. Start FastAPI Gateway
In a separate terminal:
```bash
pip install -r requirements.txt
python run.py
```

## 📍 Endpoints

- **FastAPI**: `http://localhost:8000/api/v1/predict` (Human Friendly)
- **TF Serving REST**: `http://localhost:8501/v1/models/pdd:predict` (Direct Inference)
- **Interactive API Docs**: `http://localhost:8000/docs`

## 🧠 Why TF Serving?

1.  **Independent Scaling**: Scale the API and Model separately.
2.  **Versioning**: Serve `/models/pdd/1/` now, and simply drop `/models/pdd/2/` later to update without downtime.
3.  **Efficiency**: High-performance C++ server meant for production.
