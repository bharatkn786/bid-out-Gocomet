from datetime import datetime
from pydantic import BaseModel, Field
from app.models.rfq import RFQStatus, TriggerType


class AuctionConfigInput(BaseModel):
    trigger_window_minutes: int = Field(gt=0)
    extension_duration_minutes: int = Field(gt=0)
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


class AuctionConfigResponse(BaseModel):
    trigger_window_minutes: int
    extension_duration_minutes: int
    trigger_type: TriggerType

    class Config:
        from_attributes = True


class BidRankItem(BaseModel):
    rank: int
    supplier_name: str
    carrier_name: str
    freight_charges: float
    origin_charges: float
    destination_charges: float
    total_charges: float
    transit_time: int
    quote_validity: int
    submitted_at: datetime


class LogItem(BaseModel):
    event_type: str
    message: str
    created_at: datetime

    class Config:
        from_attributes = True


class AuctionDetailResponse(BaseModel):
    rfq: RFQResponse
    config: AuctionConfigResponse | None
    bids: list[BidRankItem]
    logs: list[LogItem]
