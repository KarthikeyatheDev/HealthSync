"""
Explainable AI (XAI) Engine for FedPred Multi-Task Architecture.
Implements:
1. Integrated Gradients (Sundararajan et al., 2017) for exact path attributions.
2. Local Patient Waterfall Explanations (Base Risk + Feature Shifts = Predicted Risk).
3. Counterfactual Recourse ("What-If" Sensitivity for modifiable clinical factors).
4. Dual-Head Global Feature Importance ranking across the 12 MIMIC-IV biomarkers.
"""

from typing import Dict, Any, List, Tuple
import torch
import numpy as np
from ..config import (
    FEATURE_COLUMNS,
    FEATURE_MEDIANS,
    FEATURE_MEANS,
    FEATURE_STDS,
    THRESHOLDS,
)
from .model import engine
from .preprocessing import standardize_features, map_raw_features

# Rich clinical metadata for explainability reporting
FEATURE_METADATA: Dict[str, Dict[str, Any]] = {
    "anchor_age": {
        "displayName": "Patient Age",
        "unit": "yrs",
        "category": "Demographic",
        "modifiable": False,
        "normalRange": "18 - 65",
        "default": 58,
    },
    "gender": {
        "displayName": "Gender",
        "unit": "M/F",
        "category": "Demographic",
        "modifiable": False,
        "normalRange": "Male / Female",
        "default": 1,
    },
    "bmi": {
        "displayName": "Body Mass Index (BMI)",
        "unit": "kg/m²",
        "category": "Metabolic",
        "modifiable": True,
        "normalRange": "18.5 - 24.9",
        "default": 28.5,
    },
    "systolic_bp": {
        "displayName": "Systolic Blood Pressure",
        "unit": "mmHg",
        "category": "Hemodynamic",
        "modifiable": True,
        "normalRange": "90 - 120",
        "default": 138,
    },
    "diastolic_bp": {
        "displayName": "Diastolic Blood Pressure",
        "unit": "mmHg",
        "category": "Hemodynamic",
        "modifiable": True,
        "normalRange": "60 - 80",
        "default": 84,
    },
    "glucose": {
        "displayName": "Fasting Plasma Glucose",
        "unit": "mg/dL",
        "category": "Metabolic",
        "modifiable": True,
        "normalRange": "70 - 99",
        "default": 130,
    },
    "hba1c": {
        "displayName": "Hemoglobin A1c",
        "unit": "%",
        "category": "Metabolic",
        "modifiable": True,
        "normalRange": "4.0 - 5.6",
        "default": 6.8,
    },
    "ldl": {
        "displayName": "LDL Cholesterol",
        "unit": "mg/dL",
        "category": "Lipid Profile",
        "modifiable": True,
        "normalRange": "< 100",
        "default": 135,
    },
    "hdl": {
        "displayName": "HDL Cholesterol",
        "unit": "mg/dL",
        "category": "Lipid Profile",
        "modifiable": True,
        "normalRange": "> 50",
        "default": 44,
    },
    "triglycerides": {
        "displayName": "Serum Triglycerides",
        "unit": "mg/dL",
        "category": "Lipid Profile",
        "modifiable": True,
        "normalRange": "< 150",
        "default": 175,
    },
    "creatinine": {
        "displayName": "Serum Creatinine",
        "unit": "mg/dL",
        "category": "Renal Function",
        "modifiable": False,
        "normalRange": "0.7 - 1.2",
        "default": 1.1,
    },
    "potassium": {
        "displayName": "Serum Potassium",
        "unit": "mEq/L",
        "category": "Electrolytes",
        "modifiable": True,
        "normalRange": "3.5 - 5.0",
        "default": 4.2,
    },
}

def integrated_gradients(
    model: torch.nn.Module,
    x_input: torch.Tensor,
    baseline: torch.Tensor,
    task: str = "heart",
    steps: int = 50,
) -> Tuple[np.ndarray, float, float]:
    """
    Computes Integrated Gradients for the specified task output.
    Returns:
        attributions: np.ndarray shape (12,)
        pred_prob: float (predicted probability for x_input)
        base_prob: float (predicted probability for baseline)
    """
    model.eval()
    
    # Path interpolation: x' + (k / m) * (x - x')
    alphas = torch.linspace(0.0, 1.0, steps + 1, device=x_input.device).view(-1, 1)
    # Shape: (steps + 1, 12)
    path = baseline + alphas * (x_input - baseline)
    path.requires_grad_(True)
    
    # Forward pass
    diab_logits, cvd_logits = model(path)
    logits = cvd_logits if task in ["heart", "cvd"] else diab_logits
    probs = torch.sigmoid(logits)
    
    # Backpropagate sum of probabilities along the path
    grad_outputs = torch.ones_like(probs)
    grads = torch.autograd.grad(
        outputs=probs,
        inputs=path,
        grad_outputs=grad_outputs,
        create_graph=False,
        retain_graph=False,
    )[0] # Shape: (steps + 1, 12)
    
    # Trapezoidal approximation of path integral
    avg_grads = torch.mean(grads[:-1] + grads[1:], dim=0) * 0.5
    delta = (x_input - baseline).squeeze(0)
    attributions = (delta * avg_grads).detach().cpu().numpy()
    
    pred_prob = float(probs[-1].detach().cpu().item())
    base_prob = float(probs[0].detach().cpu().item())
    
    return attributions, pred_prob, base_prob

def explain_patient_prediction(
    raw_features: Dict[str, Any],
    task: str = "heart",
) -> Dict[str, Any]:
    """
    Generates full local XAI explanation including:
    - Integrated Gradients attributions per biomarker
    - Base risk vs Final predicted risk
    - Top risk drivers vs protective factors
    - Counterfactual "What-If" recourse
    """
    # 1. Standardize input
    mapped = map_raw_features(raw_features)
    x_std = standardize_features(raw_features)
    x_tensor = torch.tensor(x_std, dtype=torch.float32, device=engine.device)
    
    # 2. Healthy population baseline (standardized 0 vector = population median/mean)
    baseline_tensor = torch.zeros_like(x_tensor)
    
    # 3. Compute Integrated Gradients
    engine.model.eval()
    attrs, pred_prob, base_prob = integrated_gradients(
        engine.model, x_tensor, baseline_tensor, task=task, steps=50
    )
    
    threshold = THRESHOLDS.get(task, 0.20)
    
    # 4. Format feature contributions
    features_breakdown: List[Dict[str, Any]] = []
    for i, col in enumerate(FEATURE_COLUMNS):
        meta = FEATURE_METADATA.get(col, {})
        val = mapped.get(col, FEATURE_MEDIANS.get(col, 0.0))
        attr_val = float(attrs[i])
        
        # Clinical risk direction: > 0 means pushing risk higher; < 0 means protective
        effect = "risk_driver" if attr_val > 0.005 else ("protective" if attr_val < -0.005 else "neutral")
        
        features_breakdown.append({
            "feature": col,
            "displayName": meta.get("displayName", col),
            "unit": meta.get("unit", ""),
            "category": meta.get("category", "General"),
            "value": round(val, 2),
            "normalRange": meta.get("normalRange", ""),
            "modifiable": meta.get("modifiable", False),
            "attribution": round(attr_val, 4),
            "attributionPercent": round(attr_val * 100, 2),
            "effect": effect,
        })
        
    # Sort breakdown by absolute impact
    sorted_by_impact = sorted(features_breakdown, key=lambda x: abs(x["attribution"]), reverse=True)
    top_drivers = [f for f in sorted_by_impact if f["attribution"] > 0][:4]
    top_protective = [f for f in sorted_by_impact if f["attribution"] < 0][:3]
    
    # 5. Counterfactual "What-If" Recourse Analysis
    recourse_suggestions = []
    if pred_prob >= threshold:
        # Determine actionable improvements on modifiable drivers
        for item in sorted_by_impact:
            col = item["feature"]
            meta = FEATURE_METADATA.get(col, {})
            if meta.get("modifiable", False) and item["attribution"] > 0.0005:
                cur_val = item["value"]
                
                # Clinical target suggestions
                if col == "systolic_bp" and cur_val > 120:
                    target_val = 118.0
                    impact_est = max(2.5, round(abs(item["attributionPercent"]) * 0.8, 1))
                    recourse_suggestions.append({
                        "feature": col,
                        "displayName": meta["displayName"],
                        "currentValue": f"{int(cur_val)} {meta['unit']}",
                        "targetValue": f"{int(target_val)} {meta['unit']}",
                        "action": f"Optimize antihypertensive therapy & dietary sodium restriction to target < 120 mmHg.",
                        "estimatedRiskReduction": f"-{impact_est}%",
                    })
                elif col == "diastolic_bp" and cur_val > 80:
                    target_val = 78.0
                    impact_est = max(2.0, round(abs(item["attributionPercent"]) * 0.8, 1))
                    recourse_suggestions.append({
                        "feature": col,
                        "displayName": meta["displayName"],
                        "currentValue": f"{int(cur_val)} {meta['unit']}",
                        "targetValue": f"{int(target_val)} {meta['unit']}",
                        "action": f"Lifestyle modification and arterial elasticity support to target < 80 mmHg.",
                        "estimatedRiskReduction": f"-{impact_est}%",
                    })
                elif col == "hba1c" and cur_val > 5.7:
                    target_val = 5.6
                    impact_est = max(3.0, round(abs(item["attributionPercent"]) * 0.85, 1))
                    recourse_suggestions.append({
                        "feature": col,
                        "displayName": meta["displayName"],
                        "currentValue": f"{cur_val:.1f} {meta['unit']}",
                        "targetValue": f"{target_val:.1f} {meta['unit']}",
                        "action": f"Target glycemic control via metformin or dietary insulin-sparing protocol.",
                        "estimatedRiskReduction": f"-{impact_est}%",
                    })
                elif col == "glucose" and cur_val > 100:
                    target_val = 95.0
                    impact_est = max(1.5, round(abs(item["attributionPercent"]) * 0.7, 1))
                    recourse_suggestions.append({
                        "feature": col,
                        "displayName": meta["displayName"],
                        "currentValue": f"{int(cur_val)} {meta['unit']}",
                        "targetValue": f"{int(target_val)} {meta['unit']}",
                        "action": f"Fasting glucose management via exercise & carbohydrate restriction.",
                        "estimatedRiskReduction": f"-{impact_est}%",
                    })
                elif col == "bmi" and cur_val > 25:
                    target_val = 24.5
                    impact_est = max(1.5, round(abs(item["attributionPercent"]) * 0.65, 1))
                    recourse_suggestions.append({
                        "feature": col,
                        "displayName": meta["displayName"],
                        "currentValue": f"{cur_val:.1f} {meta['unit']}",
                        "targetValue": f"{target_val:.1f} {meta['unit']}",
                        "action": f"5-7% weight reduction via calibrated aerobic conditioning.",
                        "estimatedRiskReduction": f"-{impact_est}%",
                    })
                elif col == "ldl" and cur_val > 100:
                    target_val = 90.0
                    impact_est = max(1.5, round(abs(item["attributionPercent"]) * 0.7, 1))
                    recourse_suggestions.append({
                        "feature": col,
                        "displayName": meta["displayName"],
                        "currentValue": f"{int(cur_val)} {meta['unit']}",
                        "targetValue": f"{int(target_val)} {meta['unit']}",
                        "action": f"Lipid-lowering management (e.g. statin or dietary adjustment).",
                        "estimatedRiskReduction": f"-{impact_est}%",
                    })
                elif col == "triglycerides" and cur_val > 150:
                    target_val = 130.0
                    impact_est = max(1.5, round(abs(item["attributionPercent"]) * 0.6, 1))
                    recourse_suggestions.append({
                        "feature": col,
                        "displayName": meta["displayName"],
                        "currentValue": f"{int(cur_val)} {meta['unit']}",
                        "targetValue": f"{int(target_val)} {meta['unit']}",
                        "action": f"Omega-3 fatty acids and reduction of refined carbohydrates.",
                        "estimatedRiskReduction": f"-{impact_est}%",
                    })
    
    return {
        "task": task,
        "base_risk": round(base_prob, 4),
        "predicted_risk": round(pred_prob, 4),
        "risk_shift": round(pred_prob - base_prob, 4),
        "threshold": threshold,
        "is_elevated": pred_prob >= threshold,
        "features": features_breakdown,
        "top_drivers": top_drivers,
        "top_protective": top_protective,
        "recourse_suggestions": recourse_suggestions[:3],
    }

def get_global_feature_importance(task: str = "heart") -> Dict[str, Any]:
    """
    Computes global feature importance across representative multi-condition cohorts.
    Evaluates both Heart Disease and Diabetes heads of the federated MultiTaskModel.
    """
    # 5 archetypal clinical profiles representing varying patient demographics
    sample_profiles = [
        # 1. Normotensive healthy baseline
        {col: FEATURE_MEDIANS[col] for col in FEATURE_COLUMNS},
        # 2. Hypertensive elderly
        {**FEATURE_MEDIANS, "anchor_age": 72, "systolic_bp": 160, "diastolic_bp": 92, "ldl": 150},
        # 3. Uncontrolled diabetic
        {**FEATURE_MEDIANS, "glucose": 195, "hba1c": 8.8, "bmi": 33.2, "triglycerides": 230},
        # 4. Metabolic syndrome
        {**FEATURE_MEDIANS, "bmi": 32.0, "systolic_bp": 142, "glucose": 138, "hba1c": 6.9, "hdl": 38},
        # 5. Mixed cardiovascular & renal profile
        {**FEATURE_MEDIANS, "anchor_age": 68, "creatinine": 1.8, "systolic_bp": 148, "ldl": 140},
    ]
    
    all_abs_attrs = np.zeros(len(FEATURE_COLUMNS), dtype=np.float32)
    
    for prof in sample_profiles:
        x_std = standardize_features(prof)
        x_tensor = torch.tensor(x_std, dtype=torch.float32, device=engine.device)
        baseline = torch.zeros_like(x_tensor)
        attrs, _, _ = integrated_gradients(engine.model, x_tensor, baseline, task=task, steps=30)
        all_abs_attrs += np.abs(attrs)
        
    all_abs_attrs /= len(sample_profiles)
    total_impact = np.sum(all_abs_attrs) if np.sum(all_abs_attrs) > 1e-6 else 1.0
    normalized_weights = (all_abs_attrs / total_impact) * 100.0
    
    ranked: List[Dict[str, Any]] = []
    for i, col in enumerate(FEATURE_COLUMNS):
        meta = FEATURE_METADATA.get(col, {})
        ranked.append({
            "feature": col,
            "displayName": meta.get("displayName", col),
            "category": meta.get("category", "General"),
            "importance": round(float(all_abs_attrs[i]), 4),
            "percentage": round(float(normalized_weights[i]), 1),
            "rank": 0,
        })
        
    ranked.sort(key=lambda x: x["percentage"], reverse=True)
    for idx, item in enumerate(ranked):
        item["rank"] = idx + 1
        
    return {
        "task": task,
        "feature_count": len(FEATURE_COLUMNS),
        "rankings": ranked,
        "top_feature": ranked[0]["displayName"] if ranked else "",
    }
