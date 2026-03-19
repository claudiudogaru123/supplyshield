from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.supplier import Supplier
from app.models.assessment import Assessment, AssessmentStatus
from app.models.score import Score
from app.services.assessment_engine import get_questions_for_supplier
from app.services.scoring_engine import (
    calculate_inherent_risk, calculate_control_maturity,
    calculate_exposure, calculate_final_score
)
from app.services.recommendation_engine import generate_recommendations
from pydantic import BaseModel
from typing import Dict, Any
from datetime import datetime
import uuid

router = APIRouter()


@router.post("/{supplier_id}/start")
async def start_assessment(supplier_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Supplier).where(Supplier.id == supplier_id))
    supplier = result.scalar_one_or_none()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    questions = get_questions_for_supplier(supplier.supplier_type, supplier.access_type)
    assessment = Assessment(
        id=str(uuid.uuid4()),
        supplier_id=supplier_id,
        status=AssessmentStatus.IN_PROGRESS,
        questions=questions,
        answers={},
    )
    db.add(assessment)
    await db.commit()
    await db.refresh(assessment)
    return assessment.__dict__


@router.get("/{supplier_id}/list")
async def list_assessments(supplier_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Assessment).where(Assessment.supplier_id == supplier_id)
        .order_by(Assessment.created_at.desc())
    )
    assessments = result.scalars().all()
    return [a.__dict__ for a in assessments]


@router.get("/detail/{assessment_id}")
async def get_assessment(assessment_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Assessment).where(Assessment.id == assessment_id))
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment.__dict__


class AnswerSubmit(BaseModel):
    answers: Dict[str, Any]


@router.put("/{assessment_id}/answers")
async def submit_answers(assessment_id: str, data: AnswerSubmit, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Assessment).where(Assessment.id == assessment_id))
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    assessment.answers = data.answers
    answered = len(data.answers)
    total = len(assessment.questions)
    assessment.completion_percentage = round((answered / total) * 100, 1) if total > 0 else 0
    await db.commit()
    return {"message": "Answers saved", "completion": assessment.completion_percentage}


@router.post("/{assessment_id}/complete")
async def complete_assessment(assessment_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Assessment).where(Assessment.id == assessment_id))
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    sup_result = await db.execute(select(Supplier).where(Supplier.id == assessment.supplier_id))
    supplier = sup_result.scalar_one_or_none()

    questions = assessment.questions or []
    answers = assessment.answers or {}

    inherent = calculate_inherent_risk(supplier.supplier_type, supplier.access_type, supplier.criticality)
    maturity = calculate_control_maturity(answers, questions)
    exposure = calculate_exposure(supplier.supplier_type, supplier.access_type)
    score_data = calculate_final_score(inherent, maturity, exposure, supplier.criticality)
    recommendations = generate_recommendations(answers, questions, score_data["risk_category"])

    assessment.status = AssessmentStatus.COMPLETED
    assessment.score = score_data["final_score"]
    assessment.completion_percentage = 100.0
    assessment.completed_at = datetime.utcnow()

    supplier.risk_score = score_data["final_score"]
    supplier.risk_category = score_data["risk_category"]
    supplier.inherent_risk = score_data["inherent_risk"]
    supplier.residual_risk = score_data["residual_risk"]
    supplier.assessment_count = (supplier.assessment_count or 0) + 1

    score_record = Score(
        id=str(uuid.uuid4()),
        supplier_id=supplier.id,
        assessment_id=assessment_id,
        inherent_risk=score_data["inherent_risk"],
        control_maturity=score_data["control_maturity"],
        exposure=score_data["exposure"],
        criticality_factor=score_data["criticality_factor"],
        final_score=score_data["final_score"],
        risk_category=score_data["risk_category"],
        breakdown=score_data["breakdown"],
    )
    db.add(score_record)
    await db.commit()

    return {
        "score": score_data,
        "recommendations": recommendations,
        "assessment_id": assessment_id,
    }