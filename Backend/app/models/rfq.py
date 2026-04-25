import enum
from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.database.base import Base


# -------- ENUMS --------
class RFQStatus(enum.Enum):
    draft = "draft"
    active = "active"
    closed = "closed"
    force_closed = "force_closed"


class TriggerType(enum.Enum):
    bid_received = "bid_received"
    any_rank_change = "any_rank_change"
    l1_rank_change = "l1_rank_change"


# -------- RFQ TABLE --------
class RFQ(Base):
    __tablename__ = "rfqs"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=False)
    reference_id = Column(String(100), unique=True)

    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    bid_start_at = Column(DateTime, nullable=False)
    bid_close_at = Column(DateTime, nullable=False)
    forced_close_at = Column(DateTime, nullable=False)
    pickup_date = Column(DateTime, nullable=False)

    status = Column(Enum(RFQStatus), default=RFQStatus.draft)
    created_at = Column(DateTime, default=datetime.utcnow)

    # relationships
    creator = relationship("User")
    config = relationship("AuctionConfig", back_populates="rfq", uselist=False)
    bids = relationship("Bid", back_populates="rfq")
    logs = relationship("AuctionLog", back_populates="rfq")


# -------- AUCTION CONFIG --------
class AuctionConfig(Base):
    __tablename__ = "auction_configs"

    id = Column(Integer, primary_key=True)
    rfq_id = Column(Integer, ForeignKey("rfqs.id"), unique=True, nullable=False)

    trigger_window_minutes = Column(Integer, nullable=False)
    extension_duration_minutes = Column(Integer, nullable=False)
    trigger_type = Column(Enum(TriggerType), nullable=False)

    rfq = relationship("RFQ", back_populates="config")


# -------- BID --------
class Bid(Base):
    __tablename__ = "bids"

    id = Column(Integer, primary_key=True)
    rfq_id = Column(Integer, ForeignKey("rfqs.id"), nullable=False)
    supplier_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    carrier_name = Column(String(255), nullable=False)

    freight_charges = Column(Float, nullable=False)
    origin_charges = Column(Float, nullable=False)
    destination_charges = Column(Float, nullable=False)

    transit_time = Column(Integer, nullable=False)
    quote_validity = Column(Integer, nullable=False)

    submitted_at = Column(DateTime, default=datetime.utcnow)

    rfq = relationship("RFQ", back_populates="bids")
    supplier = relationship("User")

    @property
    def total_charges(self) -> float:
        return self.freight_charges + self.origin_charges + self.destination_charges


# -------- AUCTION LOG --------
class AuctionLog(Base):
    __tablename__ = "auction_logs"

    id = Column(Integer, primary_key=True)
    rfq_id = Column(Integer, ForeignKey("rfqs.id"), nullable=False)

    event_type = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    rfq = relationship("RFQ", back_populates="logs")