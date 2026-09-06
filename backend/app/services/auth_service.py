import os
import uuid
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.auth import RegisterRequest, UpdateProfileRequest
from app.core.security import get_password_hash, verify_password


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    if not username:
        return None
    return db.query(User).filter(User.username == username.strip().lower()).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    if not email:
        return None
    return db.query(User).filter(User.email == email.strip().lower()).first()


def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    if not user_id:
        return None
    return db.query(User).filter(User.id == user_id).first()


def authenticate_user(db: Session, username_or_email: str, password: str) -> Optional[User]:
    clean_identifier = username_or_email.strip().lower()
    user = get_user_by_username(db, username=clean_identifier) or get_user_by_email(db, email=clean_identifier)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def register_customer(db: Session, reg_in: RegisterRequest) -> User:
    email_clean = reg_in.email.strip().lower()
    if get_user_by_email(db, email=email_clean):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    # Determine username
    username_val = reg_in.username.strip().lower() if reg_in.username else email_clean.split("@")[0]
    if get_user_by_username(db, username=username_val):
        username_val = f"{username_val}_{uuid.uuid4().hex[:4]}"

    customer_user = User(
        id=str(uuid.uuid4()),
        username=username_val,
        email=email_clean,
        full_name=reg_in.full_name.strip(),
        phone=reg_in.phone.strip(),
        hashed_password=get_password_hash(reg_in.password),
        is_active=True,
        is_admin=False,
    )
    db.add(customer_user)
    db.commit()
    db.refresh(customer_user)
    return customer_user


def update_user_profile(db: Session, user: User, profile_in: UpdateProfileRequest) -> User:
    if profile_in.full_name is not None:
        user.full_name = profile_in.full_name.strip()
    if profile_in.phone is not None:
        user.phone = profile_in.phone.strip()

    if profile_in.new_password:
        if not profile_in.current_password or not verify_password(profile_in.current_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password verification failed.",
            )
        if len(profile_in.new_password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be at least 6 characters long.",
            )
        user.hashed_password = get_password_hash(profile_in.new_password)

    db.commit()
    db.refresh(user)
    return user


def init_default_admin(db: Session) -> Optional[User]:
    admin_username = os.getenv("ADMIN_USERNAME", "").strip().lower()
    admin_email = os.getenv("ADMIN_EMAIL", "").strip().lower()
    admin_password = os.getenv("ADMIN_PASSWORD", "")

    if not admin_username or not admin_email or not admin_password:
        print("Notice: Initial admin credentials not set in environment. Skipping admin bootstrap.")
        return None

    # Check by email first because email has a unique database constraint.
    existing_user = get_user_by_email(db, email=admin_email)

    # If no user exists with that email, check by username.
    if not existing_user:
        existing_user = get_user_by_username(db, username=admin_username)

    if existing_user:
        # Make sure the existing account is the configured admin account.
        existing_user.is_admin = True
        existing_user.is_active = True

        # Keep the configured username if it is available.
        if existing_user.username != admin_username:
            username_owner = get_user_by_username(db, username=admin_username)

            if not username_owner or username_owner.id == existing_user.id:
                existing_user.username = admin_username

        # Synchronize the password with ADMIN_PASSWORD.
        if not verify_password(admin_password, existing_user.hashed_password):
            existing_user.hashed_password = get_password_hash(admin_password)
            print(f"Synchronized admin password for account '{existing_user.username}'.")

        db.commit()
        db.refresh(existing_user)

        print(f"Using existing admin account: '{existing_user.username}'")
        return existing_user

    # No existing account by email or username, so create one.
    admin_user = User(
        id=str(uuid.uuid4()),
        username=admin_username,
        email=admin_email,
        full_name="Marketplace Administrator",
        phone="0000000000",
        hashed_password=get_password_hash(admin_password),
        is_active=True,
        is_admin=True,
    )

    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)

    print(f"Initialized admin account: '{admin_username}'")
    return admin_user