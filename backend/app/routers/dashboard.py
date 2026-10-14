from fastapi import APIRouter, Query
from ..state import state_manager
from ..schemas import DashboardData, PredictionTask
from ..ml.model import TORCH_AVAILABLE, DEVICE

router = APIRouter(prefix="/api", tags=["dashboard"])

@router.get("/health")
def get_health():
    return {
        "status": "ok",
        "torch_available": TORCH_AVAILABLE,
        "device": str(DEVICE) if DEVICE else "numpy_cpu",
        "service": "HealthSync Federated Learning Backend"
    }

@router.get("/dashboard", response_model=DashboardData)
def get_dashboard(task: PredictionTask = Query(default="heart")):
    return state_manager.get_dashboard_data(task)
