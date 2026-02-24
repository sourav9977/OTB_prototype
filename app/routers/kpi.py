from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.brand import UserBrandRole
from app.schemas.kpi import KPIDataResponse, KPIBulkUpdateRequest, KPIReviewRequest, KPIReviewResponse
from app.services.kpi_service import get_kpi_data, update_projected_kpis, preview_change
from app.utils.security import get_current_user
from app.utils.rbac import require_maker

router = APIRouter()


@router.get("/", response_model=list[KPIDataResponse])
def list_kpi_data(
    otb_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_kpi_data(db, otb_id)


@router.patch("/projected", response_model=list[KPIDataResponse])
def update_projected(
    otb_id: str,
    payload: KPIBulkUpdateRequest,
    current_user: User = Depends(get_current_user),
    _role: UserBrandRole = Depends(require_maker),
    db: Session = Depends(get_db),
):
    updates = [item.model_dump() for item in payload.updates]
    return update_projected_kpis(db, otb_id, updates)


@router.post("/review", response_model=KPIReviewResponse)
def review_kpi_change(
    otb_id: str,
    payload: KPIReviewRequest,
    current_user: User = Depends(get_current_user),
):
    return preview_change(payload.model_dump())
