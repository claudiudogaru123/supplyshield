from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.models.supplier import Supplier
from app.models.assessment import Assessment, AssessmentStatus

router = APIRouter()


@router.get("/stats")
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    total = await db.execute(select(func.count(Supplier.id)))
    total_count = total.scalar()

    by_risk = await db.execute(
        select(Supplier.risk_category, func.count(Supplier.id))
        .group_by(Supplier.risk_category)
    )
    risk_distribution = {row[0]: row[1] for row in by_risk.fetchall() if row[0]}

    by_type = await db.execute(
        select(Supplier.supplier_type, func.count(Supplier.id))
        .group_by(Supplier.supplier_type)
    )
    type_distribution = {row[0]: row[1] for row in by_type.fetchall() if row[0]}

    high_risk = await db.execute(
        select(Supplier).where(Supplier.risk_category.in_(["HIGH", "CRITICAL"]))
        .order_by(Supplier.risk_score.desc()).limit(5)
    )
    top_risk_suppliers = [s.__dict__ for s in high_risk.scalars().all()]

    completed = await db.execute(
        select(func.count(Assessment.id))
        .where(Assessment.status == AssessmentStatus.COMPLETED)
    )
    completed_count = completed.scalar()

    avg_score = await db.execute(select(func.avg(Supplier.risk_score)))
    avg = avg_score.scalar() or 0.0

    return {
        "total_suppliers": total_count,
        "completed_assessments": completed_count,
        "average_risk_score": round(float(avg), 2),
        "risk_distribution": risk_distribution,
        "type_distribution": type_distribution,
        "top_risk_suppliers": top_risk_suppliers,
    }


@router.get("/heatmap")
async def get_heatmap(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Supplier).order_by(Supplier.risk_score.desc())
    )
    suppliers = result.scalars().all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "risk_score": s.risk_score,
            "risk_category": s.risk_category,
            "supplier_type": s.supplier_type,
            "criticality": s.criticality,
            "sector": s.sector,
        }
        for s in suppliers
    ]