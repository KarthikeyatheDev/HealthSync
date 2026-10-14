"""
Client Dataset Loader for Simulated Hospitals.
Seamlessly loads preprocessed CSVs from backend/data/ or synthesizes
matching tensors using notebook Cell 69 statistics.
"""

from pathlib import Path
from typing import Dict, Optional, Tuple
import numpy as np
import pandas as pd
from ..config import DATA_DIR, FEATURE_COLUMNS
from .preprocessing import generate_synthetic_hospital_batch

try:
    import torch
    from torch.utils.data import Dataset, DataLoader
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    Dataset = object
    DataLoader = None

if TORCH_AVAILABLE:
    class HospitalDataset(Dataset):
        def __init__(self, df: pd.DataFrame):
            self.X = torch.tensor(df[FEATURE_COLUMNS].values, dtype=torch.float32)
            self.y_diabetes = torch.tensor(df["diabetes_label"].values, dtype=torch.float32)
            self.y_cvd = torch.tensor(df["cvd_label"].values, dtype=torch.float32)

        def __len__(self):
            return len(self.X)

        def __getitem__(self, index):
            return self.X[index], self.y_diabetes[index], self.y_cvd[index]

def get_hospital_data(hospital_key: str, batch_size: int = 256):
    """
    Returns DataLoader (or raw tensor batches) for a given hospital.
    First checks if backend/data/{hospital_key}.csv exists.
    If not, uses statistical distribution from Cell 69.
    """
    csv_file = DATA_DIR / f"{hospital_key}.csv"

    if csv_file.exists():
        try:
            df = pd.read_csv(csv_file)
            if TORCH_AVAILABLE:
                dataset = HospitalDataset(df)
                return DataLoader(dataset, batch_size=batch_size, shuffle=True)
            return df
        except Exception as e:
            print(f"Error loading {csv_file}: {e}")

    # Fallback: statistical batch generator matching cell 69
    batch = generate_synthetic_hospital_batch(hospital_key, batch_size=batch_size)
    return batch
