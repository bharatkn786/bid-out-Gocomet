from datetime import datetime
from pydantic import BaseModel, Field


class CreateBidRequest(BaseModel):
    rfq_id: int
    carrier_name: str = Field(min_length=2, max_length=255)
    freight_charges: float = Field(gt=0)
    origin_charges: float = Field(ge=0)
    destination_charges: float = Field(ge=0)
    transit_time: int = Field(gt=0, description="Transit time in days")
    quote_validity: int = Field(gt=0, description="Quote validity in days")


class BidResponse(BaseModel):
    id: int
    rfq_id: int
    supplier_id: int
    carrier_name: str
    freight_charges: float
    origin_charges: float
    destination_charges: float
    transit_time: int
    quote_validity: int
    submitted_at: datetime
    total_charges: float

    class Config:
        from_attributes = True
