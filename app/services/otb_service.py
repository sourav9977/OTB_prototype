from datetime import datetime

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.otb import OTBVersion, OTBStatusHistory, WORKFLOW_TRANSITIONS
from app.models.user import User


def list_otbs(
    db: Session,
    project_id: str | None = None,
    otb_status: str | None = None,
) -> list[OTBVersion]:
    query = db.query(OTBVersion)
    if project_id:
        query = query.filter(OTBVersion.project_id == project_id)
    if otb_status:
        query = query.filter(OTBVersion.status == otb_status)
    return query.order_by(OTBVersion.created_at.desc()).all()


def get_otb(db: Session, otb_id: str) -> OTBVersion:
    otb = db.query(OTBVersion).filter(OTBVersion.id == otb_id).first()
    if not otb:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="OTB not found")
    return otb


def create_otb(db: Session, user: User, data: dict) -> OTBVersion:
    otb = OTBVersion(
        project_id=data["project_id"],
        created_by=user.id,
        version_name=data["version_name"],
        hit=data["hit"],
        drop_month=data["drop_month"],
        year=data["year"],
        status="in_progress",
    )
    db.add(otb)
    db.commit()
    db.refresh(otb)
    return otb


def transition_status(
    db: Session,
    otb_id: str,
    new_status: str,
    user: User,
    user_role: str,
) -> OTBVersion:
    otb = get_otb(db, otb_id)
    current_status = otb.status

    allowed = WORKFLOW_TRANSITIONS.get(current_status, {})
    required_role = allowed.get(new_status)

    if required_role is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot transition from '{current_status}' to '{new_status}'",
        )

    if user_role != required_role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"This transition requires the '{required_role}' role",
        )

    history = OTBStatusHistory(
        otb_id=otb.id,
        from_status=current_status,
        to_status=new_status,
        changed_by=user.id,
    )
    db.add(history)

    otb.status = new_status
    otb.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(otb)
    return otb


def get_status_history(db: Session, otb_id: str) -> list[OTBStatusHistory]:
    return (
        db.query(OTBStatusHistory)
        .filter(OTBStatusHistory.otb_id == otb_id)
        .order_by(OTBStatusHistory.changed_at.desc())
        .all()
    )
