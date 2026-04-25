from datetime import datetime
from pydantic import BaseModel, Field
from app.models.rfq import RFQStatus, TriggerType


class AuctionConfigInput(BaseModel):
    trigger_window_minutes: int = Field(gt=0, description="How many minutes before close to watch for bids")
    extension_duration_minutes: int = Field(gt=0, description="How many minutes to extend if triggered")
    trigger_type: TriggerType


class CreateRFQRequest(BaseModel):
    name: str = Field(min_length=3, max_length=255)
    description: str = Field(max_length=1000)
    bid_start_at: datetime
    bid_close_at: datetime
    forced_close_at: datetime
    pickup_date: datetime
    auction_config: AuctionConfigInput


class RFQResponse(BaseModel):
    id: int
    name: str
    description: str
    reference_id: str | None
    created_by: int
    bid_start_at: datetime
    bid_close_at: datetime
    forced_close_at: datetime
    pickup_date: datetime
    status: RFQStatus
    created_at: datetime

    class Config:
        from_attributes = True
