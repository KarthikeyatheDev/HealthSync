"""
XAI (Explainable AI) API Router.
Provides endpoints for:
1. Local patient-level feature attributions via Integrated Gradients.
2. Global feature importance rankings for MultiTaskModel heads.
3. Clinical counterfactual recourse ('What-If' sensitivity).
4. Archetypal patient profiles for interactive exploration.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, Optional
from pydantic import BaseModel
from ..ml.xai import (
    explain_patient_prediction,
    get_global_feature_importance,
    FEATURE_METADATA,
)
from ..config import FEATURE_MEDIANS

router = APIRouter(prefix="/api/xai", tags=["xai"])

class ExplainRequest(BaseModel):
    task: str = "heart"
    features: Dict[str, Any]

@router.get("/global")
def get_global_importance(task: str = Query("heart", description="Prediction task: 'heart' or 'diabetes'")):
    try:
        normalized_task = "diabetes" if "diab" in task.lower() else "heart"
        return get_global_feature_importance(task=normalized_task)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Global XAI computation error: {str(e)}")

@router.post("/explain")
def explain_prediction(req: ExplainRequest):
    try:
        normalized_task = "diabetes" if "diab" in req.task.lower() else "heart"
        return explain_patient_prediction(raw_features=req.features, task=normalized_task)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Patient XAI explanation error: {str(e)}")

@router.get("/presets")
def get_patient_presets():
    """Returns curated clinical patient profiles for instant interactive explainability testing."""
    return [
        {
            "id": "cvd_high",
            "name": "Hypertensive & Dyslipidemia (High CVD Risk)",
            "task": "heart",
            "description": "68-year-old patient with Stage 2 hypertension, elevated LDL, and moderate triglycerides.",
            "features": {
                **FEATURE_MEDIANS,
                "anchor_age": 68,
                "systolic_bp": 158,
                "diastolic_bp": 94,
                "ldl": 155,
                "hdl": 38,
                "triglycerides": 210,
                "bmi": 29.8,
            }
        },
        {
            "id": "diabetes_high",
            "name": "Impaired Glycemia (High Diabetes Risk)",
            "task": "diabetes",
            "description": "54-year-old patient presenting with elevated HbA1c (7.9%), high fasting glucose, and elevated BMI.",
            "features": {
                **FEATURE_MEDIANS,
                "anchor_age": 54,
                "glucose": 178,
                "hba1c": 7.9,
                "bmi": 33.4,
                "triglycerides": 225,
                "systolic_bp": 136,
            }
        },
        {
            "id": "metabolic_syndrome",
            "name": "Metabolic Syndrome (Dual Risk)",
            "task": "heart",
            "description": "61-year-old patient showing combined metabolic risk factors across both disease heads.",
            "features": {
                **FEATURE_MEDIANS,
                "anchor_age": 61,
                "systolic_bp": 142,
                "diastolic_bp": 88,
                "glucose": 140,
                "hba1c": 6.8,
                "bmi": 31.5,
                "ldl": 132,
                "hdl": 41,
                "triglycerides": 195,
            }
        },
        {
            "id": "healthy_norm",
            "name": "Healthy Baseline Reference",
            "task": "heart",
            "description": "48-year-old patient with physiological values within standard clinical limits.",
            "features": {
                **FEATURE_MEDIANS,
                "anchor_age": 48,
                "systolic_bp": 116,
                "diastolic_bp": 74,
                "glucose": 88,
                "hba1c": 5.1,
                "bmi": 23.2,
                "ldl": 88,
                "hdl": 62,
                "triglycerides": 105,
            }
        }
    ]

@router.get("/metadata")
def get_features_metadata():
    """Returns clinical definitions, units, normal reference ranges, and modifiability flags."""
    return FEATURE_METADATA
