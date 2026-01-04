# Lung CT — Classification + Segmentation (Working Full Project)

This repo implements your metadata contract:

- Classes: normal, benign, malignant
- Classifier:
  - input 224×224×3, normalize uint8 -> float32 /255
  - output probabilities [normal, benign, malignant]
- Segmenter:
  - input 256×256×3, normalize uint8 -> float32 /255
  - output prob map (H,W,1), threshold 0.5 -> binary mask

## Run backend
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# Linux/Mac: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Run frontend
```bash
cd frontend
npm install
npm run dev
```

## Endpoints
- `GET /health`
- `POST /analyze` (multipart/form-data, field name: `file`)

## Model files included (ONNX)
- `backend/models/onnx/classifier.onnx`
- `backend/models/onnx/segmenter.onnx`

> If you retrain and re-export, replace those ONNX files and update `backend/models/metadata.json`.
