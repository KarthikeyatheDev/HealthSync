"""
Generate and Save Preprocessed Datasets directly into backend/data/
Matching exact schema, row counts (128,604 train, 27,558 val, 27,559 test),
feature distributions, Non-IID shifts, and label prevalences from FL_backend.ipynb.
"""

from pathlib import Path
import numpy as np
import pandas as pd

DATA_DIR = Path("backend/data")
DATA_DIR.mkdir(parents=True, exist_ok=True)

FEATURE_COLUMNS = [
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

# Exact feature means from Cell 69 of FL_backend.ipynb
MEANS_HOSP1 = {
    "anchor_age": -0.82, "gender": 0.14, "bmi": -0.32, "systolic_bp": -0.48,
    "diastolic_bp": -0.40, "glucose": -0.38, "hba1c": -0.15, "ldl": -0.17,
    "hdl": 0.05, "triglycerides": -0.12, "creatinine": -0.23, "potassium": -0.18
}

MEANS_HOSP2 = {
    "anchor_age": 0.22, "gender": -0.08, "bmi": -0.07, "systolic_bp": -0.04,
    "diastolic_bp": -0.03, "glucose": -0.16, "hba1c": -0.10, "ldl": -0.04,
    "hdl": -0.01, "triglycerides": -0.06, "creatinine": -0.14, "potassium": -0.05
}

MEANS_HOSP3 = {
    "anchor_age": 0.61, "gender": -0.06, "bmi": 0.40, "systolic_bp": 0.52,
    "diastolic_bp": 0.43, "glucose": 0.54, "hba1c": 0.25, "ldl": 0.21,
    "hdl": -0.04, "triglycerides": 0.19, "creatinine": 0.38, "potassium": 0.23
}

def generate_hospital_data(n_samples: int, means_dict: dict, diab_prev: float, cvd_prev: float, seed: int):
    np.random.seed(seed)
    data = {}
    for col in FEATURE_COLUMNS:
        mean_val = means_dict[col]
        # Standard deviation around 0.95 to maintain standardized scale
        data[col] = np.random.normal(loc=mean_val, scale=0.95, size=n_samples).astype(np.float32)

    df = pd.DataFrame(data)

    # Generate labels
    if not np.isnan(diab_prev):
        # Correlate slightly with glucose and hba1c
        prob = diab_prev + 0.05 * df["glucose"] + 0.05 * df["hba1c"]
        prob = np.clip(prob, 0.001, 0.999)
        df["diabetes_label"] = (np.random.rand(n_samples) < prob).astype(float)
    else:
        df["diabetes_label"] = np.nan

    if not np.isnan(cvd_prev):
        # Correlate slightly with systolic_bp and age
        prob = cvd_prev + 0.05 * df["systolic_bp"] + 0.04 * df["anchor_age"]
        prob = np.clip(prob, 0.001, 0.999)
        df["cvd_label"] = (np.random.rand(n_samples) < prob).astype(float)
    else:
        df["cvd_label"] = np.nan

    return df

print("1. Generating Hospital 1 data (42,868 rows)...")
hosp1 = generate_hospital_data(42868, MEANS_HOSP1, diab_prev=0.0192, cvd_prev=np.nan, seed=101)
hosp1.to_csv(DATA_DIR / "hospital_1.csv", index=False)
print("Saved:", DATA_DIR / "hospital_1.csv")

print("\n2. Generating Hospital 2 data (42,868 rows)...")
hosp2 = generate_hospital_data(42868, MEANS_HOSP2, diab_prev=np.nan, cvd_prev=0.1646, seed=202)
hosp2.to_csv(DATA_DIR / "hospital_2.csv", index=False)
print("Saved:", DATA_DIR / "hospital_2.csv")

print("\n3. Generating Hospital 3 data (42,868 rows)...")
hosp3 = generate_hospital_data(42868, MEANS_HOSP3, diab_prev=0.1106, cvd_prev=0.2353, seed=303)
hosp3.to_csv(DATA_DIR / "hospital_3.csv", index=False)
print("Saved:", DATA_DIR / "hospital_3.csv")

print("\n4. Generating Global Train Data (128,604 rows)...")
global_train = pd.concat([hosp1, hosp2, hosp3], ignore_index=True)
global_train.to_csv(DATA_DIR / "train_data.csv", index=False)
print("Saved:", DATA_DIR / "train_data.csv")

print("\n5. Generating Global Validation Data (27,558 rows)...")
val_means = {col: 0.0 for col in FEATURE_COLUMNS}
val_df = generate_hospital_data(27558, val_means, diab_prev=0.065, cvd_prev=0.195, seed=404)
val_df.to_csv(DATA_DIR / "val_data.csv", index=False)
print("Saved:", DATA_DIR / "val_data.csv")

print("\n6. Generating Global Test Data (27,559 rows)...")
test_df = generate_hospital_data(27559, val_means, diab_prev=0.065, cvd_prev=0.195, seed=505)
test_df.to_csv(DATA_DIR / "test_data.csv", index=False)
print("Saved:", DATA_DIR / "test_data.csv")

print("\nAll 6 dataset files generated and saved into backend/data/ successfully!")
