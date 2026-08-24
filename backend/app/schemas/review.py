from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Rating between 1 and 5 stars")
    comment: str = Field(..., min_length=3, max_length=1000)


class ReviewResponse(BaseModel):
    id: str
    product_id: str
    user_id: str
    user_name: str
    rating: int
    comment: str
    is_verified_buyer: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
