import uuid

from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey

from app.database import Base
from sqlalchemy.orm import relationship


class KPIData(Base):
    __tablename__ = "kpi_data"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    otb_id = Column(String, ForeignKey("otb_versions.id"), nullable=False, index=True)
    kpi_name = Column(String, nullable=False, index=True)
    week_number = Column(Integer, nullable=False)
    month = Column(String, nullable=True)
    period_type = Column(String, nullable=False)  # actual | projected
    value = Column(Float, default=0.0)
    is_editable = Column(Boolean, default=False)

    otb_version = relationship("OTBVersion", back_populates="kpi_data")
