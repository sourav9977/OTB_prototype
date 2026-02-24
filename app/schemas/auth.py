from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    email: str
    name: str

    class Config:
        from_attributes = True


class BrandRoleResponse(BaseModel):
    brand_id: str
    brand_name: str
    role: str


class UserProfileResponse(BaseModel):
    id: str
    email: str
    name: str
    brand_roles: list[BrandRoleResponse]
