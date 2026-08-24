from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.product import Product


class WishlistCreate(BaseModel):
    product_id: str


class WishlistResponse(BaseModel):
    id: str
    user_id: str
    product_id: str
    product: Product
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
