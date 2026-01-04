from __future__ import annotations

from pathlib import Path
from typing import Dict, Any, Tuple

import numpy as np
from PIL import Image


def load_metadata(path: Path) -> Dict[str, Any]:
    import json
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def to_rgb_uint8(img: Image.Image) -> np.ndarray:
    """
    Convert PIL image to RGB uint8 (H,W,3).
    - Grayscale is repeated to RGB.
    - 16-bit images are scaled down to 8-bit.
    """
    # Convert to RGB via PIL (handles L -> RGB replication)
    # For 16-bit images, PIL may use mode "I;16" or "I"
    if img.mode in ("I;16", "I", "F"):
        arr = np.array(img).astype(np.float32)
        # scale to 0..255 robustly (clip)
        # If already within range, keep; else min/max scale
        if arr.max() > 255.0:
            arr = (arr / (arr.max() + 1e-6)) * 255.0
        arr = np.clip(arr, 0.0, 255.0).astype(np.uint8)
        img = Image.fromarray(arr, mode="L").convert("RGB")
    else:
        img = img.convert("RGB")
    return np.array(img, dtype=np.uint8)


def preprocess_classifier(rgb_u8: np.ndarray, size: Tuple[int, int]) -> np.ndarray:
    import cv2
    w, h = int(size[0]), int(size[1])
    im = cv2.resize(rgb_u8, (w, h), interpolation=cv2.INTER_AREA)
    x = im.astype(np.float32) / 255.0
    return x[None, ...]  # (1,H,W,3)


def preprocess_segmenter(rgb_u8: np.ndarray, size: Tuple[int, int]) -> np.ndarray:
    import cv2
    w, h = int(size[0]), int(size[1])
    im = cv2.resize(rgb_u8, (w, h), interpolation=cv2.INTER_AREA)
    x = im.astype(np.float32) / 255.0
    return x[None, ...]  # (1,H,W,3)


def softmax(logits: np.ndarray) -> np.ndarray:
    x = logits.astype(np.float32)
    x = x - np.max(x)
    e = np.exp(x)
    return e / (np.sum(e) + 1e-8)


def seg_prob_to_mask(prob_map: np.ndarray, threshold: float) -> np.ndarray:
    prob = prob_map.astype(np.float32)
    # Some exports may output logits; if values outside [0,1], squash with sigmoid
    if prob.min() < 0.0 or prob.max() > 1.0:
        prob = 1.0 / (1.0 + np.exp(-prob))
    mask = (prob >= float(threshold)).astype(np.uint8)
    return mask


def mask_png_bytes(mask01: np.ndarray, color=(0,255,0)) -> bytes:
    """
    mask01: (H,W) uint8 0/1
    color: RGB tuple applied to mask==1
    """
    import cv2
    h, w = mask01.shape
    rgb = np.zeros((h, w, 3), dtype=np.uint8)
    rgb[mask01 == 1] = np.array(color, dtype=np.uint8)
    ok, buf = cv2.imencode(".png", cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR))
    if not ok:
        raise RuntimeError("Failed to encode mask PNG.")
    return buf.tobytes()


def overlay_png_bytes(rgb_u8: np.ndarray, mask01: np.ndarray, color=(0,255,0), alpha=0.45) -> bytes:
    import cv2
    base = rgb_u8.copy()
    color_img = np.zeros_like(base, dtype=np.uint8)
    color_img[mask01 == 1] = np.array(color, dtype=np.uint8)
    overlay = cv2.addWeighted(base, 1.0, color_img, float(alpha), 0.0)
    ok, buf = cv2.imencode(".png", cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR))
    if not ok:
        raise RuntimeError("Failed to encode overlay PNG.")
    return buf.tobytes()
