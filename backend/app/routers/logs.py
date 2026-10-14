from fastapi import APIRouter
from typing import List
from ..state import state_manager
from ..schemas import ActivityLog

router = APIRouter(prefix="/api/logs", tags=["logs"])

@router.get("", response_model=List[ActivityLog])
def get_logs():
    return state_manager.logs
