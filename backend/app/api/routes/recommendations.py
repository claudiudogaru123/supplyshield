from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.assessment import Assessment, AssessmentStatus
from app.models.supplier import Supplier
from app.services.recommendation_engine import generate_recommendations

router = APIRouter()


@router.get("/{supplier_id}")
async def get_recommendations(supplier_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Assessment)
        .where(Assessment.supplier_id == supplier_id)
        .where(Assessment.status == AssessmentStatus.COMPLETED)
        .order_by(Assessment.completed_at.desc())
        .limit(1)
    )
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="No completed assessment found")

    sup_result = await db.execute(select(Supplier).where(Supplier.id == supplier_id))
    supplier = sup_result.scalar_one_or_none()

    recommendations = generate_recommendations(
        assessment.answers or {},
        assessment.questions or [],
        supplier.risk_category or "LOW"
    )
    return recommendations

    from pydantic import BaseModel

class RemediationUpdate(BaseModel):
    action_id: str
    status: str  # 'pending' | 'in_progress' | 'done' | 'rejected'

# In-memory store pentru demo
remediation_status: dict = {}

@router.post("/{supplier_id}/remediation")
async def update_remediation(supplier_id: str, data: RemediationUpdate):
    key = f"{supplier_id}:{data.action_id}"
    remediation_status[key] = data.status
    return {"message": "Updated", "status": data.status}

@router.get("/{supplier_id}/remediation")
async def get_remediation_status(supplier_id: str):
    prefix = f"{supplier_id}:"
    return {k.replace(prefix, ""): v for k, v in remediation_status.items() if k.startswith(prefix)}