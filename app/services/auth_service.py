from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.models.brand import Brand, UserBrandRole
from app.utils.security import verify_password, create_access_token


def authenticate_user(db: Session, email: str, password: str) -> User:
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    return user


def generate_token(user: User) -> dict:
    access_token = create_access_token(data={"sub": user.id, "email": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


def get_user_brands(db: Session, user_id: str) -> list[dict]:
    roles = (
        db.query(UserBrandRole, Brand)
        .join(Brand, UserBrandRole.brand_id == Brand.id)
        .filter(UserBrandRole.user_id == user_id)
        .all()
    )
    return [
        {
            "brand_id": brand.id,
            "brand_name": brand.name,
            "role": role.role,
        }
        for role, brand in roles
    ]
