from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.brand import UserBrandRole
from app.schemas.otb import (
    OTBCreateRequest,
    OTBStatusUpdateRequest,
    OTBResponse,
    OTBListResponse,
    StatusHistoryEntry,
)
from app.services.otb_service import list_otbs, get_otb, create_otb, transition_status, get_status_history
from app.utils.security import get_current_user
from app.utils.rbac import require_maker, _get_user_role

router = APIRouter()


@router.get("/", response_model=OTBListResponse)
def list_all_otbs(
    project_id: str | None = Query(None),
    status: str | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items = list_otbs(db, project_id=project_id, otb_status=status)
    results = []
    for otb in items:
        creator = db.query(User).filter(User.id == otb.created_by).first()
        results.append(OTBResponse(
            id=otb.id,
            project_id=otb.project_id,
            created_by=otb.created_by,
            creator_name=creator.name if creator else None,
            version_name=otb.version_name,
            hit=otb.hit,
            drop_month=otb.drop_month,
            year=otb.year,
            status=otb.status,
            created_at=otb.created_at,
            updated_at=otb.updated_at,
        ))
    return {"items": results, "total": len(results)}


@router.post("/", response_model=OTBResponse)
def create_new_otb(
    payload: OTBCreateRequest,
    current_user: User = Depends(get_current_user),
    _role: UserBrandRole = Depends(require_maker),
    db: Session = Depends(get_db),
):
    otb = create_otb(db, current_user, payload.model_dump())
    creator = db.query(User).filter(User.id == otb.created_by).first()
    return OTBResponse(
        id=otb.id,
        project_id=otb.project_id,
        created_by=otb.created_by,
        creator_name=creator.name if creator else None,
        version_name=otb.version_name,
        hit=otb.hit,
        drop_month=otb.drop_month,
        year=otb.year,
        status=otb.status,
        created_at=otb.created_at,
        updated_at=otb.updated_at,
    )


@router.get("/{otb_id}", response_model=OTBResponse)
def get_otb_detail(
    otb_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    otb = get_otb(db, otb_id)
    creator = db.query(User).filter(User.id == otb.created_by).first()
    return OTBResponse(
        id=otb.id,
        project_id=otb.project_id,
        created_by=otb.created_by,
        creator_name=creator.name if creator else None,
        version_name=otb.version_name,
        hit=otb.hit,
        drop_month=otb.drop_month,
        year=otb.year,
        status=otb.status,
        created_at=otb.created_at,
        updated_at=otb.updated_at,
    )


@router.patch("/{otb_id}/status", response_model=OTBResponse)
def update_otb_status(
    otb_id: str,
    payload: OTBStatusUpdateRequest,
    current_user: User = Depends(get_current_user),
    user_role: UserBrandRole = Depends(_get_user_role),
    db: Session = Depends(get_db),
):
    otb = transition_status(db, otb_id, payload.new_status, current_user, user_role.role)
    creator = db.query(User).filter(User.id == otb.created_by).first()
    return OTBResponse(
        id=otb.id,
        project_id=otb.project_id,
        created_by=otb.created_by,
        creator_name=creator.name if creator else None,
        version_name=otb.version_name,
        hit=otb.hit,
        drop_month=otb.drop_month,
        year=otb.year,
        status=otb.status,
        created_at=otb.created_at,
        updated_at=otb.updated_at,
    )


@router.get("/{otb_id}/history", response_model=list[StatusHistoryEntry])
def get_otb_history(
    otb_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entries = get_status_history(db, otb_id)
    results = []
    for entry in entries:
        changer = db.query(User).filter(User.id == entry.changed_by).first()
        results.append(StatusHistoryEntry(
            id=entry.id,
            from_status=entry.from_status,
            to_status=entry.to_status,
            changed_by=entry.changed_by,
            changer_name=changer.name if changer else None,
            changed_at=entry.changed_at,
        ))
    return results
