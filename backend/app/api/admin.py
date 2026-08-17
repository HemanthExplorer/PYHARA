from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.deps import get_current_admin
from app.models.user import User
from app.schemas.dashboard import DashboardResponse
from app.services import admin_service

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/dashboard", response_model=DashboardResponse)
def get_admin_dashboard(
    db: Session = Depends(get_db), admin: User = Depends(get_current_admin)
):
    """
    Admin protected: Returns real calculated dashboard statistics and recent orders.
    """
    return admin_service.get_dashboard_stats(db=db)
