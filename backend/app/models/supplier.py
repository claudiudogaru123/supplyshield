from sqlalchemy import Column, String, Float, DateTime, Enum, Text, Integer
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class SupplierType(str, enum.Enum):
    IT = "IT"
    OT = "OT"
    HYBRID = "HYBRID"


class AccessType(str, enum.Enum):
    REMOTE = "REMOTE"
    PHYSICAL = "PHYSICAL"
    PRIVILEGED = "PRIVILEGED"
    NONE = "NONE"


class Criticality(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class RiskCategory(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    country = Column(String, nullable=False)
    sector = Column(String, nullable=False)
    supplier_type = Column(Enum(SupplierType), nullable=False)
    access_type = Column(Enum(AccessType), nullable=False)
    criticality = Column(Enum(Criticality), nullable=False)
    contact_name = Column(String)
    contact_email = Column(String)
    description = Column(Text)
    risk_score = Column(Float, default=0.0)
    risk_category = Column(Enum(RiskCategory), default=RiskCategory.LOW)
    inherent_risk = Column(Float, default=0.0)
    residual_risk = Column(Float, default=0.0)
    assessment_count = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())