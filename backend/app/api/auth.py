from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, UpdateProfileRequest, Token, UserResponse
from app.core.security import create_access_token
from app.core.deps import get_current_user
from app.services import auth_service

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_customer(reg_in: RegisterRequest, db: Session = Depends(get_db)):
    """
    Public endpoint: Registers a new customer account.
    """
    return auth_service.register_customer(db=db, reg_in=reg_in)


@router.post("/login", response_model=Token)
def login(login_in: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticates admin or customer credentials and returns a JWT Bearer access token.
    """
    user = auth_service.authenticate_user(
        db=db, username_or_email=login_in.username, password=login_in.password
    )
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.username})
    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Returns authenticated user profile.
    """
    return current_user


@router.put("/profile", response_model=UserResponse)
def update_profile(
    profile_in: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Updates authenticated user personal information or password.
    """
    return auth_service.update_user_profile(db=db, user=current_user, profile_in=profile_in)
