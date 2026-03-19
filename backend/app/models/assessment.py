from sqlalchemy import Column, String, Float, DateTime, Enum, Text, JSON, ForeignKey, Integer
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class AssessmentStatus(str, enum.Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(String, primary_key=True)
    supplier_id = Column(String, ForeignKey("suppliers.id"), nullable=False)
    status = Column(Enum(AssessmentStatus), default=AssessmentStatus.PENDING)
    questions = Column(JSON, default=[])
    answers = Column(JSON, default={})
    score = Column(Float, default=0.0)
    max_score = Column(Float, default=0.0)
    completion_percentage = Column(Float, default=0.0)
    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    completed_at = Column(DateTime, nullable=True)