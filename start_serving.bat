@echo off
set MODEL_DIR=%~dp0models\pdd
set MODEL_NAME=pdd

echo 🌿 Scaling up Plant Disease Detection with TF Serving...
echo 📂 Mapping model from: %MODEL_DIR%
echo 📍 Endpoint: http://localhost:8501/v1/models/pdd:predict

docker run -p 8501:8501 ^
  --name tf_serving_pdd ^
  --mount type=bind,source="%MODEL_DIR%",target=/models/pdd ^
  -e MODEL_NAME=%MODEL_NAME% ^
  -t tensorflow/serving
