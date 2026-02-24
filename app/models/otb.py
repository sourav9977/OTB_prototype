import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base

VALID_STATUSES = [
    "in_progress",
    "in_review",
    "change_requested",
    "pending_approval",
    "approved",
    "expired",
]

WORKFLOW_TRANSITIONS = {
    "in_progress": {"in_review": "maker"},
    "in_review": {"pending_approval": "checker", "change_requested": "checker"},
    "change_requested": {"in_review": "maker"},
    "pending_approval": {"approved": "approver"},
}


class OTBVersion(Base):
    __tablename__ = "otb_versions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id"), nullable=False, index=True)
    created_by = Column(String, ForeignKey("users.id"), nullable=False)
    version_name = Column(String, nullable=False)
    hit = Column(String, nullable=False)
    drop_month = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    status = Column(String, default="in_progress", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("Project", back_populates="otb_versions")
    creator = relationship("User", back_populates="otb_versions")
    kpi_data = relationship("KPIData", back_populates="otb_version", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="otb_version", cascade="all, delete-orphan")
    history = relationship("OTBStatusHistory", back_populates="otb_version", cascade="all, delete-orphan")


class OTBStatusHistory(Base):
    __tablename__ = "otb_status_history"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    otb_id = Column(String, ForeignKey("otb_versions.id"), nullable=False, index=True)
    from_status = Column(String, nullable=False)
    to_status = Column(String, nullable=False)
    changed_by = Column(String, ForeignKey("users.id"), nullable=False)
    changed_at = Column(DateTime, default=datetime.utcnow)

    otb_version = relationship("OTBVersion", back_populates="history")
