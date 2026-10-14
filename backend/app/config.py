"""
Application Configuration and Clinical Metadata.
Derived directly from the MIMIC-IV multi-task federated learning notebook.
"""

from pathlib import Path
from typing import List, Dict, Any

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
SAVED_MODELS_DIR = BASE_DIR / "saved_models"

DATA_DIR.mkdir(parents=True, exist_ok=True)
SAVED_MODELS_DIR.mkdir(parents=True, exist_ok=True)

# 12 MIMIC-IV Clinical Features used in MultiTaskModel
FEATURE_COLUMNS: List[str] = [
    "anchor_age",
    "gender",
    "bmi",
    "systolic_bp",
    "diastolic_bp",
    "glucose",
    "hba1c",
    "ldl",
    "hdl",
    "triglycerides",
    "creatinine",
    "potassium",
]

# Imputation medians derived from training population
FEATURE_MEDIANS: Dict[str, float] = {
    "anchor_age": 57.0,
    "gender": 0.0,       # 0: Male, 1: Female
    "bmi": 27.7,
    "systolic_bp": 127.0,
    "diastolic_bp": 74.0,
    "glucose": 107.0,
    "hba1c": 6.0,
    "ldl": 101.0,
    "hdl": 51.0,
    "triglycerides": 118.0,
    "creatinine": 0.90,
    "potassium": 4.10,
}

# StandardScaler parameters (mean and standard deviation) from training set
FEATURE_MEANS: Dict[str, float] = {
    "anchor_age": 55.62,
    "gender": 0.48,
    "bmi": 28.50,
    "systolic_bp": 128.29,
    "diastolic_bp": 74.75,
    "glucose": 124.43,
    "hba1c": 6.50,
    "ldl": 104.88,
    "hdl": 54.35,
    "triglycerides": 159.24,
    "creatinine": 1.09,
    "potassium": 4.20,
}

FEATURE_STDS: Dict[str, float] = {
    "anchor_age": 20.24,
    "gender": 0.50,
    "bmi": 6.20,
    "systolic_bp": 17.72,
    "diastolic_bp": 10.91,
    "glucose": 62.57,
    "hba1c": 1.65,
    "ldl": 39.22,
    "hdl": 18.72,
    "triglycerides": 95.50,
    "creatinine": 1.43,
    "potassium": 0.61,
}

# Optimal decision thresholds tuned on validation split (Notebook Cell 74, 82, 104)
THRESHOLDS: Dict[str, float] = {
    "diabetes": 0.15,
    "cvd": 0.20,
    "heart": 0.20,
}

# 3 Hospital Client Simulation Configurations
HOSPITALS_CONFIG: List[Dict[str, Any]] = [
    {
        "id": "hospital_a",
        "alt_id": "hospital_1",
        "name": "Hospital North (Hospital A)",
        "location": "Hyderabad, Telangana",
        "facility": "Cardiology Research Center",
        "ehr": "Epic Systems / FHIR R4",
        "cohort": "Urban multi-specialty clinical population",
        "records": 42868,
        "labels": ["diabetes"],
        "missing_labels": ["cvd"],
        "updateSizeMb": 1.42,
    },
    {
        "id": "hospital_b",
        "alt_id": "hospital_2",
        "name": "Hospital Central (Hospital B)",
        "location": "New Delhi, NCR",
        "facility": "Metabolic & Endocrine Institute",
        "ehr": "Cerner Millennium / HL7 v2",
        "cohort": "High-density tertiary referral cohort",
        "records": 42868,
        "labels": ["cvd"],
        "missing_labels": ["diabetes"],
        "updateSizeMb": 1.42,
    },
    {
        "id": "hospital_c",
        "alt_id": "hospital_3",
        "name": "Hospital South (Hospital C)",
        "location": "Chennai, Tamil Nadu",
        "facility": "Preventive Healthcare Network",
        "ehr": "Allscripts / OpenEHR",
        "cohort": "Community screening & preventive care cohort",
        "records": 42868,
        "labels": ["diabetes", "cvd"],
        "missing_labels": [],
        "updateSizeMb": 1.42,
    },
]

# Total training patient population across simulated federated network
TOTAL_NETWORK_SAMPLES = sum(h["records"] for h in HOSPITALS_CONFIG)

DEFAULT_HYPERPARAMETERS = {
    "learning_rate": 0.001,
    "batch_size": 256,
    "local_epochs": 10,
    "fedprox_mu": 0.01,
    "differential_privacy": False,
    "epsilon": 1.2,
    "clip_norm": 1.0,
}
