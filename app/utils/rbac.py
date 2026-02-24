from fastapi import Depends, HTTPException, Header, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.brand import UserBrandRole
from app.utils.security import get_current_user


def _get_brand_id(x_brand_id: str = Header(..., description="Active brand ID")) -> str:
    return x_brand_id


def _get_user_role(
    brand_id: str = Depends(_get_brand_id),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserBrandRole:
    role = (
        db.query(UserBrandRole)
        .filter(
            UserBrandRole.user_id == current_user.id,
            UserBrandRole.brand_id == brand_id,
        )
        .first()
    )
    if not role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this brand",
        )
    return role


def require_role(*allowed_roles: str):
    """Dependency factory that restricts access to specific roles."""
    def checker(user_role: UserBrandRole = Depends(_get_user_role)) -> UserBrandRole:
        if user_role.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This action requires one of: {', '.join(allowed_roles)}",
            )
        return user_role
    return checker


require_maker = require_role("maker")
require_checker = require_role("checker")
require_approver = require_role("approver")
