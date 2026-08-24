from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, EmailStr


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, description="Username or email address")
    password: str = Field(..., min_length=1)


class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    username: Optional[str] = None  # If omitted, defaults to email username
    password: str = Field(..., min_length=6)


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool
    is_admin: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
