import re
import json
import uuid
import urllib.request
from typing import Dict, Any, List, Optional
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status

from app.models.delivery_location import DeliveryLocation
from app.schemas.delivery_location import (
    DeliveryLocationCreate,
    DeliveryLocationUpdate,
    ServiceabilityResponse,
)

PINCODE_REGEX = re.compile(r"^[1-9][0-9]{5}$")

POSTAL_FALLBACK_DB: Dict[str, Dict[str, str]] = {
    "560001": {"city": "Bengaluru", "state": "Karnataka", "district": "Bengaluru"},
    "560002": {"city": "Bengaluru", "state": "Karnataka", "district": "Bengaluru"},
    "560034": {"city": "Bengaluru", "state": "Karnataka", "district": "Bengaluru"},
    "560100": {"city": "Bengaluru", "state": "Karnataka", "district": "Bengaluru"},
    "110001": {"city": "New Delhi", "state": "Delhi", "district": "New Delhi"},
    "110020": {"city": "New Delhi", "state": "Delhi", "district": "South Delhi"},
    "400001": {"city": "Mumbai", "state": "Maharashtra", "district": "Mumbai"},
    "400050": {"city": "Mumbai", "state": "Maharashtra", "district": "Mumbai"},
    "600001": {"city": "Chennai", "state": "Tamil Nadu", "district": "Chennai"},
    "700001": {"city": "Kolkata", "state": "West Bengal", "district": "Kolkata"},
    "500001": {"city": "Hyderabad", "state": "Telangana", "district": "Hyderabad"},
    "380001": {"city": "Ahmedabad", "state": "Gujarat", "district": "Ahmedabad"},
    "411001": {"city": "Pune", "state": "Maharashtra", "district": "Pune"},
    "600028": {"city": "Chennai", "state": "Tamil Nadu", "district": "Chennai"},
    "682001": {"city": "Kochi", "state": "Kerala", "district": "Ernakulam"},
}


def is_valid_pincode_format(pincode: str) -> bool:
    if not pincode:
        return False
    return bool(PINCODE_REGEX.match(pincode.strip()))


def lookup_pincode(pincode: str) -> Dict[str, Any]:
    """
    Verifies Indian 6-digit PIN code and fetches City/State.
    1. Validates 6-digit regex format.
    2. Checks India Post public API (https://api.postalpincode.in/pincode/{pincode}).
    3. Falls back to curated postal dictionary if network is unavailable or offline.
    """
    clean_pin = pincode.strip() if pincode else ""

    if not is_valid_pincode_format(clean_pin):
        return {
            "valid": False,
            "pincode": clean_pin,
            "error": "PIN code must be a valid 6-digit Indian postal code starting with digits 1-9.",
        }

    # 1. Try Live India Post Postal API
    try:
        url = f"https://api.postalpincode.in/pincode/{clean_pin}"
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0 (PYHARA Eco-Marketplace Location Service)"},
        )
        with urllib.request.urlopen(req, timeout=3) as resp:
            if resp.status == 200:
                body = resp.read().decode("utf-8")
                data = json.loads(body)
                if isinstance(data, list) and len(data) > 0:
                    res_obj = data[0]
                    if res_obj.get("Status") == "Success" and res_obj.get("PostOffice"):
                        post_offices = res_obj["PostOffice"]
                        if len(post_offices) > 0:
                            po = post_offices[0]
                            city = po.get("District") or po.get("Division") or po.get("Name")
                            state = po.get("State")
                            if city and state:
                                return {
                                    "valid": True,
                                    "pincode": clean_pin,
                                    "city": city.strip(),
                                    "state": state.strip(),
                                    "district": po.get("District", "").strip(),
                                    "source": "api",
                                }
    except Exception:
        pass

    # 2. Check Local Fallback Dictionary
    if clean_pin in POSTAL_FALLBACK_DB:
        info = POSTAL_FALLBACK_DB[clean_pin]
        return {
            "valid": True,
            "pincode": clean_pin,
            "city": info["city"],
            "state": info["state"],
            "district": info["district"],
            "source": "fallback",
        }

    return {
        "valid": False,
        "pincode": clean_pin,
        "error": f"PIN code '{clean_pin}' could not be verified for Indian postal delivery.",
    }


# =========================================================================
# DATABASE-BACKED SERVICEABILITY & ADMIN MANAGEMENT
# =========================================================================

def seed_default_locations(db: Session) -> None:
    """Populates initial active delivery locations if DB table is empty."""
    count = db.query(DeliveryLocation).count()
    if count > 0:
        return

    defaults = [
        {"pincode": "560001", "city": "Bengaluru", "state": "Karnataka", "delivery_charge": Decimal("50.00"), "estimated_delivery_days": 2, "notes": "Central Bengaluru Metro Hub"},
        {"pincode": "560002", "city": "Bengaluru", "state": "Karnataka", "delivery_charge": Decimal("50.00"), "estimated_delivery_days": 2, "notes": "City Market Zone"},
        {"pincode": "560034", "city": "Bengaluru", "state": "Karnataka", "delivery_charge": Decimal("40.00"), "estimated_delivery_days": 2, "notes": "Koramangala Tech Corridor"},
        {"pincode": "110001", "city": "New Delhi", "state": "Delhi", "delivery_charge": Decimal("60.00"), "estimated_delivery_days": 3, "notes": "Connaught Place Hub"},
        {"pincode": "110020", "city": "New Delhi", "state": "Delhi", "delivery_charge": Decimal("60.00"), "estimated_delivery_days": 3, "notes": "Okhla Hub"},
        {"pincode": "400001", "city": "Mumbai", "state": "Maharashtra", "delivery_charge": Decimal("55.00"), "estimated_delivery_days": 3, "notes": "South Mumbai Zone"},
        {"pincode": "600001", "city": "Chennai", "state": "Tamil Nadu", "delivery_charge": Decimal("50.00"), "estimated_delivery_days": 3, "notes": "Parrys Zone"},
        {"pincode": "700001", "city": "Kolkata", "state": "West Bengal", "delivery_charge": Decimal("65.00"), "estimated_delivery_days": 4, "notes": "BBD Bagh Zone"},
        {"pincode": "500001", "city": "Hyderabad", "state": "Telangana", "delivery_charge": Decimal("50.00"), "estimated_delivery_days": 3, "notes": "Abids Zone"},
        {"pincode": "380001", "city": "Ahmedabad", "state": "Gujarat", "delivery_charge": Decimal("55.00"), "estimated_delivery_days": 3, "notes": "Bhadra Zone"},
        {"pincode": "411001", "city": "Pune", "state": "Maharashtra", "delivery_charge": Decimal("50.00"), "estimated_delivery_days": 3, "notes": "Camp Hub"},
    ]

    for item in defaults:
        loc = DeliveryLocation(
            id=str(uuid.uuid4()),
            pincode=item["pincode"],
            city=item["city"],
            state=item["state"],
            is_active=True,
            delivery_charge=item["delivery_charge"],
            estimated_delivery_days=item["estimated_delivery_days"],
            notes=item["notes"],
        )
        db.add(loc)
    db.commit()


def check_serviceability(db: Session, pincode: str) -> ServiceabilityResponse:
    """
    Checks customer checkout serviceability against admin-configured locations in DB.
    """
    clean_pin = pincode.strip() if pincode else ""

    if not is_valid_pincode_format(clean_pin):
        return ServiceabilityResponse(
            serviceable=False,
            pincode=clean_pin,
            reason="invalid_format",
            message="PIN code must be a valid 6-digit Indian postal code starting with digits 1-9.",
        )

    # First check DB delivery location record
    loc = db.query(DeliveryLocation).filter(DeliveryLocation.pincode == clean_pin).first()

    if loc:
        if loc.is_active:
            return ServiceabilityResponse(
                serviceable=True,
                pincode=loc.pincode,
                city=loc.city,
                state=loc.state,
                delivery_charge=loc.delivery_charge,
                estimated_delivery_days=loc.estimated_delivery_days,
                message=f"Delivery available ({loc.city}, {loc.state}). Estimated delivery: {loc.estimated_delivery_days} days.",
            )
        else:
            return ServiceabilityResponse(
                serviceable=False,
                pincode=clean_pin,
                city=loc.city,
                state=loc.state,
                reason="disabled",
                message="Delivery is currently unavailable for this location.",
            )

    # Location not found in admin-configured database
    return ServiceabilityResponse(
        serviceable=False,
        pincode=clean_pin,
        reason="unconfigured",
        message="We currently don't deliver to this location.",
    )


def get_active_delivery_locations(db: Session) -> List[DeliveryLocation]:
    """Returns only active customer-serviceable delivery locations."""
    return (
        db.query(DeliveryLocation)
        .filter(DeliveryLocation.is_active.is_(True))
        .order_by(DeliveryLocation.pincode.asc())
        .all()
    )


def get_delivery_locations(
    db: Session, search: Optional[str] = None, active_only: Optional[bool] = None
) -> List[DeliveryLocation]:
    query = db.query(DeliveryLocation)

    if active_only:
        query = query.filter(DeliveryLocation.is_active.is_(True))

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                DeliveryLocation.pincode.ilike(term),
                DeliveryLocation.city.ilike(term),
                DeliveryLocation.state.ilike(term),
            )
        )

    return query.order_by(DeliveryLocation.pincode.asc()).all()


def get_delivery_location_by_id(db: Session, location_id: str) -> Optional[DeliveryLocation]:
    return db.query(DeliveryLocation).filter(DeliveryLocation.id == location_id).first()


def get_delivery_location_by_pincode(db: Session, pincode: str) -> Optional[DeliveryLocation]:
    return db.query(DeliveryLocation).filter(DeliveryLocation.pincode == pincode.strip()).first()


def create_delivery_location(db: Session, loc_in: DeliveryLocationCreate) -> DeliveryLocation:
    clean_pin = loc_in.pincode.strip()

    if not is_valid_pincode_format(clean_pin):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid PIN code format '{clean_pin}'. Must be a 6-digit Indian PIN code starting with digits 1-9.",
        )

    # Check for duplicate PIN code
    existing = get_delivery_location_by_pincode(db, clean_pin)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Delivery location for PIN code '{clean_pin}' already exists in the system.",
        )

    # Optionally verify postal city/state if not supplied
    resolved_city = loc_in.city.strip()
    resolved_state = loc_in.state.strip()
    if not resolved_city or not resolved_state:
        lookup_info = lookup_pincode(clean_pin)
        if lookup_info["valid"]:
            resolved_city = resolved_city or lookup_info.get("city")
            resolved_state = resolved_state or lookup_info.get("state")

    new_loc = DeliveryLocation(
        id=str(uuid.uuid4()),
        pincode=clean_pin,
        city=resolved_city,
        state=resolved_state,
        is_active=loc_in.is_active,
        delivery_charge=loc_in.delivery_charge,
        estimated_delivery_days=loc_in.estimated_delivery_days,
        notes=loc_in.notes.strip() if loc_in.notes else None,
    )
    db.add(new_loc)
    db.commit()
    db.refresh(new_loc)
    return new_loc


def update_delivery_location(
    db: Session, location_id: str, loc_update: DeliveryLocationUpdate
) -> DeliveryLocation:
    loc = get_delivery_location_by_id(db, location_id)
    if not loc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Delivery location ID '{location_id}' not found.",
        )

    if loc_update.city is not None:
        loc.city = loc_update.city.strip()
    if loc_update.state is not None:
        loc.state = loc_update.state.strip()
    if loc_update.is_active is not None:
        loc.is_active = loc_update.is_active
    if loc_update.delivery_charge is not None:
        loc.delivery_charge = loc_update.delivery_charge
    if loc_update.estimated_delivery_days is not None:
        loc.estimated_delivery_days = loc_update.estimated_delivery_days
    if loc_update.notes is not None:
        loc.notes = loc_update.notes.strip() if loc_update.notes else None

    db.commit()
    db.refresh(loc)
    return loc


def delete_delivery_location(db: Session, location_id: str) -> None:
    loc = get_delivery_location_by_id(db, location_id)
    if not loc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Delivery location ID '{location_id}' not found.",
        )
    db.delete(loc)
    db.commit()
