"""
Pydantic Schemas matching the Frontend TypeScript Interfaces.
"""

from typing import List, Dict, Optional, Literal, Any
from pydantic import BaseModel, Field

PredictionTask = Literal["heart", "diabetes"]
SiteStatus = Literal["ready", "training", "update_ready", "aggregated", "error"]
AggregationStep = Literal["idle", "local_training", "updates_received", "aggregating", "completed"]
LogLevel = Literal["info", "success", "warning", "error"]
RoundStatus = Literal["completed", "failed", "in_progress"]

class HospitalMetrics(BaseModel):
    accuracy: float
    loss: float
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1: Optional[float] = None

class HospitalSite(BaseModel):
    id: str
    name: str
    location: str
    records: int
    status: SiteStatus
    version: str
    updateSizeMb: Optional[float] = 1.4
    progressPercent: Optional[int] = 0
    lastMetrics: Optional[HospitalMetrics] = None

class GlobalModelInfo(BaseModel):
    version: str
    task: PredictionTask
    lastUpdated: str
    accuracy: float
    prevAccuracy: Optional[float] = None
    delta: Optional[float] = None
    loss: float
    precision: float
    recall: float
    f1: float
    auroc: float

class DashboardData(BaseModel):
    project: str
    network_status: str
    sites_count: int
    completed_rounds: int
    current_round: int
    active_task: PredictionTask
    global_model: GlobalModelInfo
    sites: List[HospitalSite]
    is_training_active: bool
    active_round_id: Optional[str] = None
    aggregation_step: AggregationStep

class ParticipatingSiteRecord(BaseModel):
    site_id: str
    site_name: str
    location: Optional[str] = None
    sample_count: int
    local_accuracy: float
    local_loss: float
    update_size_mb: float

class RoundEvaluation(BaseModel):
    accuracy: float
    loss: float
    precision: float
    recall: float
    f1: float
    auroc: float
    confusion_matrix: Optional[List[List[int]]] = None
    test_samples: int

class RoundRecord(BaseModel):
    round_id: str
    task: PredictionTask
    round_number: Optional[int] = None
    start_time: str
    finish_time: str
    status: RoundStatus
    global_model_version: str
    participating_sites: List[ParticipatingSiteRecord]
    evaluation: RoundEvaluation
    task_evaluations: Optional[Dict[str, RoundEvaluation]] = None
    duration_seconds: float
    total_samples: Optional[int] = None
    method: Optional[str] = "FedAvg"
    hyperparameters: Optional[Dict[str, Any]] = None

class ActivityLog(BaseModel):
    id: str
    timestamp: str
    timeFormatted: str
    type: str
    message: str
    level: LogLevel
    site_id: Optional[str] = None
    round_id: Optional[str] = None

class SSEEvent(BaseModel):
    type: str
    round_id: Optional[str] = None
    task: Optional[PredictionTask] = None
    site_id: Optional[str] = None
    site_name: Optional[str] = None
    progress: Optional[int] = None
    version: Optional[str] = None
    metrics: Optional[Dict[str, float]] = None
    message: Optional[str] = None
    timestamp: Optional[str] = None

class PredictionResult(BaseModel):
    task: PredictionTask
    risk_score: float
    risk_level: Literal["Low Risk", "Medium Risk", "High Risk"]
    confidence: float
    model_version: str
    recommendations: List[str]

class PredictRequest(BaseModel):
    task: PredictionTask
    features: Dict[str, Any]

class StartRoundRequest(BaseModel):
    task: Optional[PredictionTask] = "heart"
    method: Optional[str] = "FedAvg"

class SettingsUpdateRequest(BaseModel):
    learningRate: Optional[str] = None
    batchSize: Optional[str] = None
    localEpochs: Optional[str] = None
    differentialPrivacy: Optional[bool] = None
    epsilon: Optional[str] = None
