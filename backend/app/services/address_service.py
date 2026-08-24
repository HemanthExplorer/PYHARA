import uuid
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.address import Address
from app.schemas.address import AddressCreate, AddressUpdate


def get_user_addresses(db: Session, user_id: str) -> List[Address]:
    return db.query(Address).filter(Address.user_id == user_id).order_by(Address.is_default.desc(), Address.created_at.desc()).all()


def get_address_by_id(db: Session, address_id: str, user_id: str) -> Optional[Address]:
    return db.query(Address).filter(Address.id == address_id, Address.user_id == user_id).first()


def create_address(db: Session, user_id: str, address_in: AddressCreate) -> Address:
    user_addrs = get_user_addresses(db, user_id=user_id)
    is_first = len(user_addrs) == 0
    should_be_default = address_in.is_default or is_first

    if should_be_default and not is_first:
        # Clear default flag on existing addresses
        db.query(Address).filter(Address.user_id == user_id).update({"is_default": False})

    addr = Address(
        id=str(uuid.uuid4()),
        user_id=user_id,
        full_name=address_in.full_name.strip(),
        phone=address_in.phone.strip(),
        address_line=address_in.address_line.strip(),
        city=address_in.city.strip(),
        state=address_in.state.strip(),
        pincode=address_in.pincode.strip(),
        country=address_in.country.strip(),
        label=address_in.label.strip(),
        is_default=should_be_default,
    )
    db.add(addr)
    db.commit()
    db.refresh(addr)
    return addr


def update_address(db: Session, address_id: str, user_id: str, address_update: AddressUpdate) -> Address:
    addr = get_address_by_id(db, address_id=address_id, user_id=user_id)
    if not addr:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found or unauthorized.",
        )

    update_data = address_update.model_dump(exclude_unset=True)
    if update_data.get("is_default") is True:
        db.query(Address).filter(Address.user_id == user_id).update({"is_default": False})

    for field, value in update_data.items():
        if value is not None:
            setattr(addr, field, value.strip() if isinstance(value, str) else value)

    db.commit()
    db.refresh(addr)
    return addr


def delete_address(db: Session, address_id: str, user_id: str) -> bool:
    addr = get_address_by_id(db, address_id=address_id, user_id=user_id)
    if not addr:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found or unauthorized.",
        )

    was_default = addr.is_default
    db.delete(addr)
    db.commit()

    if was_default:
        next_addr = db.query(Address).filter(Address.user_id == user_id).first()
        if next_addr:
            next_addr.is_default = True
            db.commit()

    return True


def set_default_address(db: Session, address_id: str, user_id: str) -> Address:
    addr = get_address_by_id(db, address_id=address_id, user_id=user_id)
    if not addr:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found or unauthorized.",
        )

    db.query(Address).filter(Address.user_id == user_id).update({"is_default": False})
    addr.is_default = True
    db.commit()
    db.refresh(addr)
    return addr
