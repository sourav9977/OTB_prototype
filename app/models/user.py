import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    brand_roles = relationship("UserBrandRole", back_populates="user")
    otb_versions = relationship("OTBVersion", back_populates="creator")
    comments = relationship("Comment", back_populates="author")
