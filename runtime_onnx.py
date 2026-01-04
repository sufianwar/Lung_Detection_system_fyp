from __future__ import annotations

from pathlib import Path
import numpy as np

class OnnxRunner:
    """
    Minimal ONNX Runtime wrapper.
    Expects a single input and returns the first output as numpy array.
    """
    def __init__(self, onnx_path: Path):
        self.onnx_path = Path(onnx_path)
        if not self.onnx_path.exists():
            raise FileNotFoundError(f"ONNX model not found: {self.onnx_path}")

        import onnxruntime as ort

        # CPU-only by default (portable)
        so = ort.SessionOptions()
        so.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL

        self.sess = ort.InferenceSession(str(self.onnx_path), sess_options=so, providers=["CPUExecutionProvider"])
        self.input_name = self.sess.get_inputs()[0].name
        self.output_name = self.sess.get_outputs()[0].name

    def run(self, x: np.ndarray) -> np.ndarray:
        if not isinstance(x, np.ndarray):
            x = np.array(x)
        # ensure float32 for most exported models
        if x.dtype != np.float32:
            x = x.astype(np.float32)
        out = self.sess.run([self.output_name], {self.input_name: x})[0]
        return np.array(out)
