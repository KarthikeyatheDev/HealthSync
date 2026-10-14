"""
MultiTaskModel Architecture from Cell 77 of FL_backend.ipynb.
Shared encoder with separate diabetes and CVD heads.
"""
from typing import Tuple
import torch
import torch.nn as nn
import numpy as np
from pathlib import Path
from ..config import SAVED_MODELS_DIR

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
TORCH_AVAILABLE = True
DEVICE = device

class MultiTaskModel(nn.Module):
    """Shared encoder with separate diabetes and CVD heads."""
    def __init__(self, input_dim: int = 12):
        super().__init__()
        self.shared_encoder = nn.Sequential(
            nn.Linear(input_dim, 64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, 32),
            nn.ReLU(),
        )
        self.diabetes_head = nn.Linear(32, 1)
        self.cvd_head = nn.Linear(32, 1)

    def forward(self, x):
        shared = self.shared_encoder(x)
        diabetes_logits = self.diabetes_head(shared)
        cvd_logits = self.cvd_head(shared)
        return diabetes_logits, cvd_logits

class MultiTaskInferenceEngine:
    """Unified inference engine executing the PyTorch MultiTaskModel directly."""
    def __init__(self):
        self.device = device
        self.reset_weights()
        # Attempt to load saved weights if present
        weights_path = SAVED_MODELS_DIR / "fedavg_model.pth"
        if weights_path.exists():
            try:
                self.model.load_state_dict(torch.load(weights_path, map_location=self.device))
                print(f"Loaded trained PyTorch weights from {weights_path}")
            except Exception as e:
                print(f"Error loading saved weights: {e}")

    def reset_weights(self):
        """Resets model to initial random state with seed 42."""
        torch.manual_seed(42)
        np.random.seed(42)
        self.model = MultiTaskModel(input_dim=12).to(self.device)
        self.model.eval()

    def predict(self, x_standardized: np.ndarray) -> Tuple[float, float]:
        """Runs forward pass on standardized features (1, 12). Returns (diabetes_prob, cvd_prob)."""
        self.model.eval()
        with torch.no_grad():
            tx = torch.tensor(x_standardized, dtype=torch.float32, device=self.device)
            diabetes_logits, cvd_logits = self.model(tx)
            diabetes_prob = float(torch.sigmoid(diabetes_logits).cpu().item())
            cvd_prob = float(torch.sigmoid(cvd_logits).cpu().item())
            return diabetes_prob, cvd_prob

engine = MultiTaskInferenceEngine()
