from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.score import Score
from app.models.supplier import Supplier

router = APIRouter()


@router.get("/{supplier_id}")
async def get_supplier_scores(supplier_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Score).where(Score.supplier_id == supplier_id)
        .order_by(Score.created_at.desc())
    )
    scores = result.scalars().all()
    return [s.__dict__ for s in scores]


@router.get("/{supplier_id}/latest")
async def get_latest_score(supplier_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Score).where(Score.supplier_id == supplier_id)
        .order_by(Score.created_at.desc()).limit(1)
    )
    score = result.scalar_one_or_none()
    if not score:
        raise HTTPException(status_code=404, detail="No score found")
    return score.__dict__