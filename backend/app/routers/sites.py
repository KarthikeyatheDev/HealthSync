from fastapi import APIRouter
from typing import List
from ..state import state_manager
from ..schemas import HospitalSite

router = APIRouter(prefix="/api", tags=["sites"])

@router.get("/sites", response_model=List[HospitalSite])
def get_sites():
    return state_manager.sites
