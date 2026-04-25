from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.ws_manager import manager
from app.models.rfq import AuctionLog, Bid, RFQ, TriggerType
from app.models.user import UserRole, User
from app.schemas.bid import CreateBidRequest, BidResponse


def _get_l1_supplier_id(db: Session, rfq_id: int) -> int | None:
    """Returns the supplier_id of the current lowest (L1) bid."""
    bids = db.query(Bid).filter(Bid.rfq_id == rfq_id).all()
    if not bids:
        return None
    # Each supplier's best bid
    best: dict[int, float] = {}
    for b in bids:
        total = b.total_charges
        if b.supplier_id not in best or total < best[b.supplier_id]:
            best[b.supplier_id] = total
    return min(best, key=best.get)


def _try_extend(db: Session, rfq: RFQ, new_bid: Bid, old_l1_id: int | None):
    """Checks trigger conditions and extends auction if needed."""
    config = rfq.config
    if not config or datetime.now(timezone.utc) < rfq.bid_close_at - timedelta(minutes=config.trigger_window_minutes):
        return

    reason = ""
    if config.trigger_type == TriggerType.bid_received:
        reason = f"bid received in last {config.trigger_window_minutes} min"
    elif config.trigger_type == TriggerType.any_rank_change:
        reason = f"rank change in last {config.trigger_window_minutes} min"
    elif config.trigger_type == TriggerType.l1_rank_change and new_bid.supplier_id != old_l1_id:
        reason = f"L1 rank change in last {config.trigger_window_minutes} min"

    if reason:
        new_close = rfq.bid_close_at + timedelta(minutes=config.extension_duration_minutes)
        rfq.bid_close_at = min(new_close, rfq.forced_close_at)
        db.add(AuctionLog(
            rfq_id=rfq.id,
            event_type="time_extended",
            message=f"Auction extended by {config.extension_duration_minutes} min — {reason}"
        ))


async def place_bid(db: Session, payload: CreateBidRequest, user: User) -> BidResponse:
    if user.role == UserRole.buyer:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Buyers cannot place bids. Please create a seller account to place your bids."
        )

    rfq = db.query(RFQ).filter(RFQ.id == payload.rfq_id).first()
    if not rfq:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "RFQ not found")

    now = datetime.now(timezone.utc)
    if not (rfq.bid_start_at <= now <= rfq.bid_close_at):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "RFQ is not currently accepting bids")

    # Capture current L1 before saving the new bid (for l1_rank_change check)
    old_l1_id = _get_l1_supplier_id(db, rfq.id)

    bid = Bid(
        rfq_id=payload.rfq_id,
        supplier_id=user.id,
        carrier_name=payload.carrier_name,
        freight_charges=payload.freight_charges,
        origin_charges=payload.origin_charges,
        destination_charges=payload.destination_charges,
        transit_time=payload.transit_time,
        quote_validity=payload.quote_validity
    )
    db.add(bid)
    db.flush()  # Get bid.id without committing yet

    total = bid.total_charges
    db.add(AuctionLog(
        rfq_id=rfq.id,
        event_type="bid_placed",
        message=f"{user.full_name} placed a bid of ₹{total:,.0f} via {bid.carrier_name}"
    ))

    _try_extend(db, rfq, bid, old_l1_id)

    db.commit()
    db.refresh(bid)

    # Notify all connected clients for this RFQ
    await manager.broadcast(rfq.id, {"type": "new_bid"})

    return BidResponse.model_validate(bid)


def list_bids_for_rfq(db: Session, rfq_id: int) -> list[BidResponse]:
    bids = db.query(Bid).filter(Bid.rfq_id == rfq_id).order_by(Bid.submitted_at.desc()).all()
    return [BidResponse.model_validate(b) for b in bids]
