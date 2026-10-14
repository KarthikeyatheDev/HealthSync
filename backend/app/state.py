"""
Central State Manager & Event Broadcaster for HealthSync Federated Dashboard.
Pre-populated with authoritative Round 1-5 data from notebook cells 94-95.
"""

import asyncio
from datetime import datetime
from typing import List, Dict, Any, Optional
from .schemas import (
    DashboardData,
    HospitalSite,
    GlobalModelInfo,
    RoundRecord,
    ActivityLog,
    SSEEvent,
    PredictionTask,
    SettingsUpdateRequest
)
from .config import HOSPITALS_CONFIG, TOTAL_NETWORK_SAMPLES

class AppStateManager:
    def __init__(self):
        self._subscribers: List[asyncio.Queue] = []
        self._lock = asyncio.Lock()

        self.project_name = "HealthSync Federated Healthcare Intelligence"
        self.network_status = "online"
        self.completed_rounds = 0
        self.current_round = 1
        self.active_task: PredictionTask = "heart"

        self.is_training_active = False
        self.active_round_id: Optional[str] = None
        self.aggregation_step = "idle"

        # Settings matching FL_backend.ipynb Cell 74 & 86
        self.settings = {
            "learningRate": "0.001",
            "batchSize": "256",
            "localEpochs": "10",
            "differentialPrivacy": False,
            "epsilon": "1.2"
        }

        # Initialize Hospital Sites with clean initial state v1.0.0
        self.sites: List[HospitalSite] = [
            HospitalSite(
                id=h["id"],
                name=h["name"],
                location=h["location"],
                records=h["records"],
                status="ready",
                version="v1.0.0",
                updateSizeMb=h["updateSizeMb"],
                progressPercent=0,
                lastMetrics=None
            )
            for i, h in enumerate(HOSPITALS_CONFIG)
        ]

        # Initial Global Model Performance (clean baseline v1.0.0)
        self.global_models: Dict[PredictionTask, GlobalModelInfo] = {
            "heart": GlobalModelInfo(
                version="v1.0.0",
                task="heart",
                lastUpdated="Initialized",
                accuracy=0.500,
                prevAccuracy=0.500,
                delta=0.0,
                loss=0.6931,
                precision=0.0,
                recall=0.0,
                f1=0.0,
                auroc=0.500
            ),
            "diabetes": GlobalModelInfo(
                version="v1.0.0",
                task="diabetes",
                lastUpdated="Initialized",
                accuracy=0.500,
                prevAccuracy=0.500,
                delta=0.0,
                loss=0.6931,
                precision=0.0,
                recall=0.0,
                f1=0.0,
                auroc=0.500
            )
        }

        # Historical Rounds: Fresh slate, 0 rounds completed
        self.rounds: List[RoundRecord] = []

        # Activity Logs
        now = datetime.now()
        time_str = now.strftime("%H:%M")
        self.logs: List[ActivityLog] = [
            ActivityLog(
                id="log_init_1",
                timestamp=now.isoformat(),
                timeFormatted=time_str,
                type="network_ready",
                message="Federated Learning orchestrator initialized. 3 hospital nodes online. Global model v1.0.0 ready.",
                level="success"
            )
        ]

    def reset_state(self):
        """Clears all training rounds and resets model versions to v1.0.0."""
        self.completed_rounds = 0
        self.current_round = 1
        self.is_training_active = False
        self.active_round_id = None
        self.aggregation_step = "idle"
        self.rounds = []
        for site in self.sites:
            site.status = "ready"
            site.version = "v1.0.0"
            site.progressPercent = 0
            site.lastMetrics = None

        self.global_models["heart"] = GlobalModelInfo(
            version="v1.0.0",
            task="heart",
            lastUpdated="Initialized",
            accuracy=0.500,
            prevAccuracy=0.500,
            delta=0.0,
            loss=0.6931,
            precision=0.0,
            recall=0.0,
            f1=0.0,
            auroc=0.500
        )
        self.global_models["diabetes"] = GlobalModelInfo(
            version="v1.0.0",
            task="diabetes",
            lastUpdated="Initialized",
            accuracy=0.500,
            prevAccuracy=0.500,
            delta=0.0,
            loss=0.6931,
            precision=0.0,
            recall=0.0,
            f1=0.0,
            auroc=0.500
        )
        now = datetime.now()
        self.logs.insert(0, ActivityLog(
            id=f"log_{int(now.timestamp()*1000)}",
            timestamp=now.isoformat(),
            timeFormatted=now.strftime("%H:%M"),
            type="network_ready",
            message="Training data and model versions reset to v1.0.0.",
            level="info"
        ))


    # Subscriber Management for SSE
    async def subscribe(self) -> asyncio.Queue:
        q = asyncio.Queue()
        async with self._lock:
            self._subscribers.append(q)
        return q

    async def unsubscribe(self, q: asyncio.Queue):
        async with self._lock:
            if q in self._subscribers:
                self._subscribers.remove(q)

    async def broadcast_event(self, event: SSEEvent):
        """Pushes event to all active SSE subscribers."""
        async with self._lock:
            for q in list(self._subscribers):
                try:
                    await q.put(event)
                except Exception as e:
                    print(f"Error putting event to queue: {e}")

        # Also append to local activity logs if message provided
        if event.message:
            now = datetime.now()
            time_formatted = now.strftime("%H:%M")
            is_error = "fail" in event.type
            is_success = "complete" in event.type or "update" in event.type
            self.logs.insert(
                0,
                ActivityLog(
                    id=f"log_{int(now.timestamp()*1000)}",
                    timestamp=now.isoformat(),
                    timeFormatted=time_formatted,
                    type=event.type,
                    message=event.message,
                    level="error" if is_error else "success" if is_success else "info",
                    site_id=event.site_id,
                    round_id=event.round_id
                )
            )

    def get_dashboard_data(self, task: PredictionTask) -> DashboardData:
        active_task = task if task in ["heart", "diabetes"] else self.active_task
        global_info = self.global_models.get(active_task, self.global_models["heart"])

        return DashboardData(
            project=self.project_name,
            network_status=self.network_status,
            sites_count=len(self.sites),
            completed_rounds=self.completed_rounds,
            current_round=self.current_round,
            active_task=active_task,
            global_model=global_info,
            sites=self.sites,
            is_training_active=self.is_training_active,
            active_round_id=self.active_round_id,
            aggregation_step=self.aggregation_step
        )

# Global singleton
state_manager = AppStateManager()
