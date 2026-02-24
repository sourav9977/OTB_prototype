import uuid

from sqlalchemy import Column, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Brand(Base):
    __tablename__ = "brands"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True, nullable=False)
    is_active = Column(Boolean, default=True)

    user_roles = relationship("UserBrandRole", back_populates="brand")
    projects = relationship("Project", back_populates="brand")


class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    brand_id = Column(String, ForeignKey("brands.id"), nullable=False)
    name = Column(String, nullable=False)

    brand = relationship("Brand", back_populates="projects")
    otb_versions = relationship("OTBVersion", back_populates="project")


class UserBrandRole(Base):
    __tablename__ = "user_brand_roles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    brand_id = Column(String, ForeignKey("brands.id"), nullable=False, index=True)
    role = Column(String, nullable=False)  # maker | checker | approver

    user = relationship("User", back_populates="brand_roles")
    brand = relationship("Brand", back_populates="user_roles")
