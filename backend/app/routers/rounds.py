import asyncio
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from ..state import state_manager
from ..schemas import RoundRecord, StartRoundRequest, PredictionTask
from ..ml.fl_orchestrator import run_federated_round

router = APIRouter(prefix="/api/rounds", tags=["rounds"])

@router.get("", response_model=List[RoundRecord])
def get_rounds(task: Optional[PredictionTask] = Query(default=None)):
    """
    Returns all federated training rounds.
    Because every round simultaneously trains both Diabetes and CVD tasks,
    all rounds are returned. If a task query param is provided, the evaluation
    metrics and task field in the response correspond to that specific task's dual head.
    """
    if not task:
        return state_manager.rounds

    result = []
    for r in state_manager.rounds:
        if r.task_evaluations and task in r.task_evaluations:
            r_copy = r.model_copy(update={
                "task": task,
                "evaluation": r.task_evaluations[task]
            })
            result.append(r_copy)
        else:
            r_copy = r.model_copy(update={"task": task})
            result.append(r_copy)
    return result

@router.get("/{round_id}", response_model=RoundRecord)
def get_round(round_id: str, task: Optional[PredictionTask] = Query(default=None)):
    for r in state_manager.rounds:
        if r.round_id.lower() == round_id.lower():
            if task and r.task_evaluations and task in r.task_evaluations:
                return r.model_copy(update={
                    "task": task,
                    "evaluation": r.task_evaluations[task]
                })
            return r
    raise HTTPException(status_code=404, detail=f"Round {round_id} not found")

@router.post("")
async def start_round(body: StartRoundRequest):
    if state_manager.is_training_active:
        raise HTTPException(
            status_code=400,
            detail=f"Round {state_manager.active_round_id} is already in progress. Please wait for completion."
        )

    task = body.task or "heart"
    method = body.method or "FedAvg"
    round_id = f"ROUND-{state_manager.current_round:03d}"

    state_manager.is_training_active = True
    state_manager.active_round_id = round_id

    # Launch federated training asynchronously
    asyncio.create_task(run_federated_round(task=task, method=method))

    return {
        "round_id": round_id,
        "status": "started",
        "message": f"Federated {method} round {round_id} started for task '{task}'."
    }

@router.post("/reset")
def reset_rounds():
    """Resets all training data, rounds history, and model versions to v1.0.0."""
    from ..ml.model import engine
    state_manager.reset_state()
    engine.reset_weights()
    return {
        "status": "reset",
        "message": "All training rounds cleared. Model versions reset to v1.0.0.",
        "current_round": state_manager.current_round,
        "completed_rounds": state_manager.completed_rounds
    }
