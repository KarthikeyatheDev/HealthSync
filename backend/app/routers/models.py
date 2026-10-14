from fastapi import APIRouter, Query
from typing import Optional
from ..schemas import PredictionTask

router = APIRouter(prefix="/api/models", tags=["models"])

@router.get("/comparison")
def get_model_comparison(task: Optional[PredictionTask] = Query(default="heart")):
    """
    Returns comparative evaluation metrics between FedAvg and FedProx
    extracted from Cell 95 of FL_backend.ipynb.
    """
    return {
        "active_task": task,
        "diabetes_metrics": [
            {"metric": "AUROC", "fedavg": 0.7882, "fedprox": 0.7885, "best": "FedProx"},
            {"metric": "AUPRC", "fedavg": 0.1883, "fedprox": 0.1837, "best": "FedAvg"},
            {"metric": "F1 Score", "fedavg": 0.2814, "fedprox": 0.2835, "best": "FedProx"},
            {"metric": "Recall", "fedavg": 0.4707, "fedprox": 0.4189, "best": "FedAvg"},
            {"metric": "Brier Score", "fedavg": 0.0502, "fedprox": 0.0502, "best": "Tie"}
        ],
        "cvd_metrics": [
            {"metric": "AUROC", "fedavg": 0.6953, "fedprox": 0.6913, "best": "FedAvg"},
            {"metric": "AUPRC", "fedavg": 0.2779, "fedprox": 0.2709, "best": "FedAvg"},
            {"metric": "F1 Score", "fedavg": 0.3614, "fedprox": 0.3571, "best": "FedAvg"},
            {"metric": "Recall", "fedavg": 0.6985, "fedprox": 0.6188, "best": "FedAvg"},
            {"metric": "Brier Score", "fedavg": 0.1274, "fedprox": 0.1279, "best": "FedAvg"}
        ],
        "hospital_baselines": [
            {"name": "Hospital North (Hospital A)", "isolated_acc": 0.895, "samples": 42868},
            {"name": "Hospital Central (Hospital B)", "isolated_acc": 0.908, "samples": 42868},
            {"name": "Hospital South (Hospital C)", "isolated_acc": 0.886, "samples": 42868},
            {"name": "Federated Global Model (Consensus)", "isolated_acc": 0.924, "samples": 128604, "gain": 0.029}
        ],
        "summary": {
            "average_fedavg": 0.3939,
            "average_fedprox": 0.3791,
            "recommended": "FedAvg"
        }
    }
