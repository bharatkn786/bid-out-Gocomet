import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class RFQStatus(str, enum.Enum):
    draft = "draft"
    active = "active"
    closed = "closed"
    force_closed = "force_closed"


class TriggerType(str, enum.Enum):
    bid_received = "bid_received"
    any_rank_change = "any_rank_change"
    l1_rank_change = "l1_rank_change"


class RFQ(Base):
    __tablename__ = "rfqs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(String(1000), nullable=False)
    reference_id: Mapped[str | None] = mapped_column(String(100), unique=True, nullable=True)
    created_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    bid_start_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    bid_close_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    forced_close_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    pickup_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[RFQStatus] = mapped_column(Enum(RFQStatus, name="rfq_status"), default=RFQStatus.draft, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    creator = relationship("User", foreign_keys=[created_by])
    config = relationship("AuctionConfig", back_populates="rfq", uselist=False)
    bids = relationship("Bid", back_populates="rfq")
    logs = relationship("AuctionLog", back_populates="rfq", order_by="AuctionLog.created_at")


class AuctionConfig(Base):
    __tablename__ = "auction_configs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    rfq_id: Mapped[int] = mapped_column(Integer, ForeignKey("rfqs.id"), nullable=False, unique=True)
    trigger_window_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    extension_duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    trigger_type: Mapped[TriggerType] = mapped_column(Enum(TriggerType, name="trigger_type"), nullable=False)

    rfq = relationship("RFQ", back_populates="config")


class Bid(Base):
    __tablename__ = "bids"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    rfq_id: Mapped[int] = mapped_column(Integer, ForeignKey("rfqs.id"), nullable=False)
    supplier_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    carrier_name: Mapped[str] = mapped_column(String(255), nullable=False)
    freight_charges: Mapped[float] = mapped_column(Float, nullable=False)
    origin_charges: Mapped[float] = mapped_column(Float, nullable=False)
    destination_charges: Mapped[float] = mapped_column(Float, nullable=False)
    transit_time: Mapped[int] = mapped_column(Integer, nullable=False)
    quote_validity: Mapped[int] = mapped_column(Integer, nullable=False)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    rfq = relationship("RFQ", back_populates="bids")
    supplier = relationship("User", foreign_keys=[supplier_id])

    @property
    def total_charges(self) -> float:
        return self.freight_charges + self.origin_charges + self.destination_charges


class AuctionLog(Base):
    __tablename__ = "auction_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    rfq_id: Mapped[int] = mapped_column(Integer, ForeignKey("rfqs.id"), nullable=False)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)  # "bid_placed" | "time_extended"
    message: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    rfq = relationship("RFQ", back_populates="logs")
