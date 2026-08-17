import os
import uuid
from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import get_password_hash, verify_password


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    if not username:
        return None
    return db.query(User).filter(User.username == username.strip().lower()).first()


def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    if not user_id:
        return None
    return db.query(User).filter(User.id == user_id).first()


def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    user = get_user_by_username(db, username=username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def init_default_admin(db: Session) -> Optional[User]:
    admin_username = os.getenv("ADMIN_USERNAME", "").strip().lower()
    admin_email = os.getenv("ADMIN_EMAIL", "").strip().lower()
    admin_password = os.getenv("ADMIN_PASSWORD", "")

    if not admin_username or not admin_email or not admin_password:
        print("Notice: Initial admin credentials (ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD) not set in environment. Skipping admin bootstrap.")
        return None

    existing_user = get_user_by_username(db, username=admin_username)
    if existing_user:
        return existing_user

    admin_user = User(
        id=str(uuid.uuid4()),
        username=admin_username,
        email=admin_email,
        hashed_password=get_password_hash(admin_password),
        is_active=True,
        is_admin=True,
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    print(f"Initialized admin account: '{admin_username}'")
    return admin_user
