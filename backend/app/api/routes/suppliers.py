from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.core.database import get_db
from app.models.supplier import Supplier
from app.services.scoring_engine import calculate_inherent_risk
from pydantic import BaseModel
from typing import Optional
import uuid

router = APIRouter()


class SupplierCreate(BaseModel):
    name: str
    country: str
    sector: str
    supplier_type: str
    access_type: str
    criticality: str
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    description: Optional[str] = None


class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    country: Optional[str] = None
    sector: Optional[str] = None
    supplier_type: Optional[str] = None
    access_type: Optional[str] = None
    criticality: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    description: Optional[str] = None


@router.get("/")
async def get_suppliers(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Supplier).order_by(Supplier.created_at.desc()))
    suppliers = result.scalars().all()
    return [s.__dict__ for s in suppliers]


@router.get("/{supplier_id}")
async def get_supplier(supplier_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Supplier).where(Supplier.id == supplier_id))
    supplier = result.scalar_one_or_none()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier.__dict__


@router.post("/")
async def create_supplier(data: SupplierCreate, db: AsyncSession = Depends(get_db)):
    inherent = calculate_inherent_risk(data.supplier_type, data.access_type, data.criticality)
    supplier = Supplier(
        id=str(uuid.uuid4()),
        name=data.name,
        country=data.country,
        sector=data.sector,
        supplier_type=data.supplier_type,
        access_type=data.access_type,
        criticality=data.criticality,
        contact_name=data.contact_name,
        contact_email=data.contact_email,
        description=data.description,
        inherent_risk=inherent,
    )
    db.add(supplier)
    await db.commit()
    await db.refresh(supplier)
    return supplier.__dict__


@router.put("/{supplier_id}")
async def update_supplier(supplier_id: str, data: SupplierUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Supplier).where(Supplier.id == supplier_id))
    supplier = result.scalar_one_or_none()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(supplier, field, value)
    await db.commit()
    await db.refresh(supplier)
    return supplier.__dict__


@router.delete("/{supplier_id}")
async def delete_supplier(supplier_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Supplier).where(Supplier.id == supplier_id))
    supplier = result.scalar_one_or_none()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    await db.execute(delete(Supplier).where(Supplier.id == supplier_id))
    await db.commit()
    return {"message": "Supplier deleted"}