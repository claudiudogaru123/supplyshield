from sqlalchemy import Column, String, Float, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base


class Score(Base):
    __tablename__ = "scores"

    id = Column(String, primary_key=True)
    supplier_id = Column(String, ForeignKey("suppliers.id"), nullable=False)
    assessment_id = Column(String, ForeignKey("assessments.id"), nullable=False)
    inherent_risk = Column(Float, default=0.0)
    control_maturity = Column(Float, default=0.0)
    exposure = Column(Float, default=0.0)
    criticality_factor = Column(Float, default=0.0)
    final_score = Column(Float, default=0.0)
    risk_category = Column(String, default="LOW")
    breakdown = Column(JSON, default={})
    created_at = Column(DateTime, server_default=func.now())