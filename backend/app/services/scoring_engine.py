from typing import Dict, Any
from app.models.supplier import SupplierType, AccessType, Criticality


CRITICALITY_WEIGHTS = {
    Criticality.LOW: 0.2,
    Criticality.MEDIUM: 0.4,
    Criticality.HIGH: 0.7,
    Criticality.CRITICAL: 1.0
}

ACCESS_WEIGHTS = {
    AccessType.NONE: 0.1,
    AccessType.PHYSICAL: 0.4,
    AccessType.REMOTE: 0.6,
    AccessType.PRIVILEGED: 1.0
}

TYPE_WEIGHTS = {
    SupplierType.IT: 0.5,
    SupplierType.OT: 0.8,
    SupplierType.HYBRID: 1.0
}


def calculate_inherent_risk(
    supplier_type: str,
    access_type: str,
    criticality: str
) -> float:
    type_w = TYPE_WEIGHTS.get(SupplierType(supplier_type), 0.5)
    access_w = ACCESS_WEIGHTS.get(AccessType(access_type), 0.5)
    crit_w = CRITICALITY_WEIGHTS.get(Criticality(criticality), 0.5)
    inherent = (type_w * 0.3 + access_w * 0.4 + crit_w * 0.3) * 100
    return round(inherent, 2)


def calculate_control_maturity(answers: Dict[str, Any], questions: list) -> float:
    if not answers or not questions:
        return 0.0
    total_weight = 0.0
    achieved_weight = 0.0
    for q in questions:
        qid = q.get("id")
        weight = q.get("weight", 1.0)
        max_score = q.get("max_score", 4)
        answer = answers.get(qid)
        if answer is not None:
            total_weight += weight * max_score
            achieved_weight += weight * float(answer)
    if total_weight == 0:
        return 0.0
    maturity_pct = (achieved_weight / total_weight) * 100
    return round(maturity_pct, 2)


def calculate_exposure(supplier_type: str, access_type: str) -> float:
    type_w = TYPE_WEIGHTS.get(SupplierType(supplier_type), 0.5)
    access_w = ACCESS_WEIGHTS.get(AccessType(access_type), 0.5)
    exposure = (type_w * 0.4 + access_w * 0.6) * 100
    return round(exposure, 2)


def calculate_final_score(
    inherent_risk: float,
    control_maturity: float,
    exposure: float,
    criticality: str
) -> Dict[str, Any]:
    crit_factor = CRITICALITY_WEIGHTS.get(Criticality(criticality), 0.5)
    # Residual risk = inherent risk reduced by control maturity
    maturity_reduction = (control_maturity / 100) * 0.6
    residual = inherent_risk * (1 - maturity_reduction)
    # Final score formula
    final = (residual * 0.5 + exposure * 0.3 + inherent_risk * crit_factor * 0.2)
    final = min(round(final, 2), 100.0)

    if final < 25:
        category = "LOW"
    elif final < 50:
        category = "MEDIUM"
    elif final < 75:
        category = "HIGH"
    else:
        category = "CRITICAL"

    return {
        "inherent_risk": round(inherent_risk, 2),
        "control_maturity": round(control_maturity, 2),
        "exposure": round(exposure, 2),
        "criticality_factor": round(crit_factor * 100, 2),
        "residual_risk": round(residual, 2),
        "final_score": final,
        "risk_category": category,
        "breakdown": {
            "inherent_risk_contribution": round(inherent_risk * crit_factor * 0.2, 2),
            "residual_contribution": round(residual * 0.5, 2),
            "exposure_contribution": round(exposure * 0.3, 2),
        }
    }