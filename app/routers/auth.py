from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse, UserProfileResponse
from app.services.auth_service import authenticate_user, generate_token, get_user_brands
from app.utils.security import get_current_user

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, payload.email, payload.password)
    return generate_token(user)


@router.get("/me", response_model=UserProfileResponse)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    brands = get_user_brands(db, current_user.id)
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "brand_roles": brands,
    }


@router.get("/brands")
def list_brands(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_user_brands(db, current_user.id)
