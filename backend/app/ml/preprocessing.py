"""
Clinical Data Standardization and Feature Preprocessing.
Replicates SimpleImputer(strategy='median') and StandardScaler() from notebook cells 62-63.
"""

from typing import Dict, Any, List
import numpy as np
from ..config import (
    FEATURE_COLUMNS,
    FEATURE_MEDIANS,
    FEATURE_MEANS,
    FEATURE_STDS,
)

# Synonyms for frontend flexible field mapping
FIELD_ALIASES = {
    "age": "anchor_age",
    "sex": "gender",
    "trestbps": "systolic_bp",
    "blood_pressure": "systolic_bp",
    "resting_bp": "systolic_bp",
    "chol": "ldl",
    "cholesterol": "ldl",
    "fasting_glucose": "glucose",
    "blood_sugar": "glucose",
    "sugar": "glucose",
    "serum_creatinine": "creatinine",
    "k": "potassium",
}

def map_raw_features(raw: Dict[str, Any]) -> Dict[str, float]:
    """Map frontend shorthand keys (e.g. age, trestbps, chol) to MIMIC-IV clinical names."""
    normalized: Dict[str, float] = {}

    for k, v in raw.items():
        k_clean = str(k).lower().strip()
        standard_name = FIELD_ALIASES.get(k_clean, k_clean)
        try:
            val = float(v)
            normalized[standard_name] = val
        except (ValueError, TypeError):
            continue

    # Clinical range sanitization (from notebook cell 52)
    if "anchor_age" in normalized and not (18 <= normalized["anchor_age"] <= 100):
        normalized["anchor_age"] = FEATURE_MEDIANS["anchor_age"]
    if "bmi" in normalized and not (10 <= normalized["bmi"] <= 80):
        normalized["bmi"] = FEATURE_MEDIANS["bmi"]
    if "systolic_bp" in normalized and not (60 <= normalized["systolic_bp"] <= 300):
        normalized["systolic_bp"] = FEATURE_MEDIANS["systolic_bp"]
    if "glucose" in normalized and not (20 <= normalized["glucose"] <= 1000):
        normalized["glucose"] = FEATURE_MEDIANS["glucose"]

    return normalized

def standardize_features(raw_features: Dict[str, Any]) -> np.ndarray:
    """
    1. Imputes missing features with clinical medians.
    2. Centers and scales features with z-score standardization: z = (x - mean) / std.
    Returns: numpy array of shape (1, 12) with dtype float32.
    """
    mapped = map_raw_features(raw_features)
    vector = np.zeros(len(FEATURE_COLUMNS), dtype=np.float32)

    for i, col in enumerate(FEATURE_COLUMNS):
        # 1. Imputation step
        val = mapped.get(col, FEATURE_MEDIANS[col])

        # 2. Standardization step: z = (x - mean) / std
        mean = FEATURE_MEANS[col]
        std = FEATURE_STDS[col]
        z = (val - mean) / (std if std > 1e-6 else 1.0)
        vector[i] = z

    return np.expand_dims(vector, axis=0)

def generate_synthetic_hospital_batch(
    hospital_id: str,
    batch_size: int = 128
) -> Dict[str, np.ndarray]:
    """
    Generates synthetic client data tensors matching the exact statistical
    profiles of Hospital 1, 2, and 3 from notebook Cell 69.
    """
    # Profile shifts from notebook cell 69
    if "a" in hospital_id or "1" in hospital_id:
        age_shift, bp_shift, glucose_shift = -0.82, -0.48, -0.38
        diab_prev, cvd_prev = 0.0192, float("nan")
    elif "b" in hospital_id or "2" in hospital_id:
        age_shift, bp_shift, glucose_shift = 0.22, -0.04, -0.16
        diab_prev, cvd_prev = float("nan"), 0.1646
    else:
        age_shift, bp_shift, glucose_shift = 0.61, 0.52, 0.54
        diab_prev, cvd_prev = 0.1106, 0.2353

    # Generate standardized features around hospital means
    X = np.random.randn(batch_size, len(FEATURE_COLUMNS)).astype(np.float32)
    X[:, 0] += age_shift        # anchor_age
    X[:, 3] += bp_shift         # systolic_bp
    X[:, 5] += glucose_shift    # glucose

    y_diabetes = np.full(batch_size, np.nan, dtype=np.float32)
    if not np.isnan(diab_prev):
        y_diabetes = (np.random.rand(batch_size) < diab_prev).astype(np.float32)

    y_cvd = np.full(batch_size, np.nan, dtype=np.float32)
    if not np.isnan(cvd_prev):
        y_cvd = (np.random.rand(batch_size) < cvd_prev).astype(np.float32)

    return {"X": X, "y_diabetes": y_diabetes, "y_cvd": y_cvd}
