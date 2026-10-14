from fastapi import APIRouter, HTTPException
from ..schemas import PredictRequest, PredictionResult
from ..ml.preprocessing import standardize_features
from ..ml.model import engine
from ..config import THRESHOLDS
from ..state import state_manager

router = APIRouter(prefix="/api", tags=["prediction"])

@router.post("/predict", response_model=PredictionResult)
def predict(request: PredictRequest):
    try:
        x_std = standardize_features(request.features)
        diab_prob, cvd_prob = engine.predict(x_std)

        task = request.task
        model_version = state_manager.global_models[task].version

        if task == "heart":
            risk_score = round(cvd_prob, 4)
            threshold = THRESHOLDS["cvd"]
            if risk_score >= 0.45:
                risk_level = "High Risk"
                recommendations = [
                    "Urgent comprehensive cardiovascular consultation indicated.",
                    "Initiate intensive ambulatory blood pressure and ECG telemetry.",
                    "Evaluate coronary artery calcium (CAC) scoring and statin therapy."
                ]
            elif risk_score >= threshold:
                risk_level = "Medium Risk"
                recommendations = [
                    "Schedule routine cardiology screening and lipid panel within 60 days.",
                    "Recommend aerobic conditioning and sodium-restricted dietary modification.",
                    "Monitor resting blood pressure bi-weekly."
                ]
            else:
                risk_level = "Low Risk"
                recommendations = [
                    "Cardiovascular markers within normal clinical baseline.",
                    "Continue routine annual health screenings.",
                    "Maintain active physical fitness and balanced nutrition."
                ]
        else: # diabetes
            risk_score = round(diab_prob, 4)
            threshold = THRESHOLDS["diabetes"]
            if risk_score >= 0.40:
                risk_level = "High Risk"
                recommendations = [
                    "High probability of impaired glucose tolerance or undiagnosed T2D.",
                    "Order fasting plasma glucose (FPG) and confirmatory HbA1c screening.",
                    "Endocrine referral for medical nutrition therapy."
                ]
            elif risk_score >= threshold:
                risk_level = "Medium Risk"
                recommendations = [
                    "Mildly elevated glycemic risk markers observed.",
                    "Initiate lifestyle and dietary modification to improve insulin sensitivity.",
                    "Re-evaluate HbA1c in 3 to 6 months."
                ]
            else:
                risk_level = "Low Risk"
                recommendations = [
                    "Metabolic and glycemic indices within healthy physiological limits.",
                    "Routine preventive screening recommended at regular checkup."
                ]

        confidence = round(0.85 + (abs(risk_score - threshold) * 0.25), 2)
        confidence = min(0.98, max(0.70, confidence))

        return PredictionResult(
            task=task,
            risk_score=risk_score,
            risk_level=risk_level,
            confidence=confidence,
            model_version=f"{model_version} (FedAvg Consensus)",
            recommendations=recommendations
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")
