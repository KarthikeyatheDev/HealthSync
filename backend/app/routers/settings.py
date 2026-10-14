from fastapi import APIRouter
from ..state import state_manager
from ..schemas import SettingsUpdateRequest

router = APIRouter(prefix="/api/settings", tags=["settings"])

@router.get("")
def get_settings():
    return state_manager.settings

@router.post("")
def update_settings(body: SettingsUpdateRequest):
    if body.learningRate is not None:
        state_manager.settings["learningRate"] = body.learningRate
    if body.batchSize is not None:
        state_manager.settings["batchSize"] = body.batchSize
    if body.localEpochs is not None:
        state_manager.settings["localEpochs"] = body.localEpochs
    if body.differentialPrivacy is not None:
        state_manager.settings["differentialPrivacy"] = body.differentialPrivacy
    if body.epsilon is not None:
        state_manager.settings["epsilon"] = body.epsilon

    return {
        "status": "success",
        "message": "Federated settings updated successfully.",
        "settings": state_manager.settings
    }
