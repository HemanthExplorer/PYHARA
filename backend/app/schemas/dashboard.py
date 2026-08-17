from decimal import Decimal
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class RecentOrderSummary(BaseModel):
    id: str
    order_number: str
    customer_name: str
    total_amount: Optional[Decimal] = None
    payment_status: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DashboardResponse(BaseModel):
    total_orders: int
    pending_orders: int
    paid_orders: int
    total_revenue: Optional[Decimal] = Decimal("0.00")
    low_stock_count: int
    out_of_stock_count: int
    recent_orders: List[RecentOrderSummary]
