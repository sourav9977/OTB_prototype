import uuid
from datetime import datetime

from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Comment(Base):
    __tablename__ = "comments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    otb_id = Column(String, ForeignKey("otb_versions.id"), nullable=False, index=True)
    author_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    cell_id = Column(String, nullable=False, index=True)
    cell_label = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    parent_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    otb_version = relationship("OTBVersion", back_populates="comments")
    author = relationship("User", back_populates="comments")
