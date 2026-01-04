from __future__ import annotations

import base64
from io import BytesIO
from pathlib import Path
from typing import Dict, Any

import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image

from .runtime_onnx import OnnxRunner
from .utils import (
    load_metadata,
    to_rgb_uint8,
    preprocess_classifier,
    preprocess_segmenter,
    softmax,
    seg_prob_to_mask,
    mask_png_bytes,
    overlay_png_bytes,
)

BASE_DIR = Path(__file__).resolve().parents[1]  # backend/
MODELS_DIR = BASE_DIR / "models"
META_PATH = MODELS_DIR / "metadata.json"

CLF_ONNX = MODELS_DIR / "onnx" / "classifier.onnx"
SEG_ONNX = MODELS_DIR / "onnx" / "segmenter.onnx"

metadata = load_metadata(META_PATH)
classes = metadata["classes"]
clf_meta = metadata["classifier"]
seg_meta = metadata["segmenter"]

# ONNX runners
clf = OnnxRunner(CLF_ONNX)
seg = OnnxRunner(SEG_ONNX)

app = FastAPI(title="Lung CT Classifier + Segmenter API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {
        "ok": True,
        "classes": classes,
        "classifier_input": clf_meta["input_size"],
        "segmenter_input": seg_meta["input_size"],
        "onnx": {
            "classifier": str(CLF_ONNX.exists()),
            "segmenter": str(SEG_ONNX.exists()),
        },
    }

@app.post("/analyze")
async def analyze(
    file: UploadFile = File(..., description='Upload an image. Field name must be "file".'),
    threshold: float = Query(None, description="Override segmentation threshold (default from metadata)."),
) -> JSONResponse:
    # Read upload
    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty upload.")

    # Decode
    try:
        img = Image.open(BytesIO(raw))
    except Exception:
        raise HTTPException(status_code=400, detail="Unsupported image format. Upload PNG/JPG.")

    # Convert to RGB uint8 (notes: grayscale -> repeat to RGB)
    rgb_u8 = to_rgb_uint8(img)

    # IMPORTANT: segmenter works at fixed size; we also render mask/overlay at that size
    seg_w, seg_h = int(seg_meta["input_size"][0]), int(seg_meta["input_size"][1])
    import cv2
    rgb_seg_u8 = cv2.resize(rgb_u8, (seg_w, seg_h), interpolation=cv2.INTER_AREA)
# ---------- Classification ----------
    x_clf = preprocess_classifier(rgb_u8, tuple(clf_meta["input_size"]))  # (1,224,224,3) float32 0..1
    out_clf = clf.run(x_clf)
    probs = softmax(out_clf.reshape(-1))
    probs = probs[: len(classes)]  # safety
    pred_idx = int(np.argmax(probs))
    pred_class = classes[pred_idx]

    class_probs = {classes[i]: float(round(float(probs[i]), 6)) for i in range(len(classes))}

    # ---------- Segmentation ----------
    x_seg = preprocess_segmenter(rgb_seg_u8, tuple(seg_meta["input_size"]))  # (1,256,256,3) float32 0..1
    out_seg = seg.run(x_seg)  # expected (1,256,256,1) or (1,1,256,256) or (1,256,256)
    thr = float(seg_meta.get("threshold", 0.5)) if threshold is None else float(threshold)

    prob_map = out_seg
    # normalize shape to (H,W)
    while prob_map.ndim > 2:
        prob_map = np.squeeze(prob_map, axis=0)
        if prob_map.ndim > 2:
            prob_map = np.squeeze(prob_map, axis=-1) if prob_map.shape[-1] == 1 else np.squeeze(prob_map, axis=0)
    prob_map = prob_map.astype(np.float32)

    mask = seg_prob_to_mask(prob_map, thr)  # uint8 0/1
    lesion_area_pct = float(round(float(mask.mean() * 100.0), 4))

    # Color logic: use classifier result to choose overlay color
    # normal -> blue, benign -> green, malignant -> red
    color = (0, 0, 0)
    if pred_class == "benign":
        color = (0, 255, 0)
    elif pred_class == "malignant":
        color = (255, 0, 0)

    mask_png = mask_png_bytes(mask, color=color)
    overlay_png = overlay_png_bytes(rgb_seg_u8, mask, color=color, alpha=0.45)

    payload: Dict[str, Any] = {
        "predicted_class": pred_class,
        "class_probs": class_probs,
        "seg_threshold": thr,
        "output_size": [int(seg_w), int(seg_h)],
        "lesion_area_pct": lesion_area_pct,
        "mask_png_base64": base64.b64encode(mask_png).decode("utf-8"),
        "overlay_png_base64": base64.b64encode(overlay_png).decode("utf-8"),
    }
    return JSONResponse(payload)
