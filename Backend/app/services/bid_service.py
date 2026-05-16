from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.ws_manager import manager
from app.models.rfq import AuctionLog, Bid, RFQ, TriggerType
from app.models.user import UserRole, User
from app.schemas.bid import CreateBidRequest, BidResponse
from app.schemas.rfq import AuctionConfigResponse, BidRankItem, LogItem, RFQResponse


def _build_detail_payload(db: Session, rfq: RFQ) -> dict:
    # Build ranked bids: best bid per supplier, sorted by total_charges.
    ranked = _get_best_bids(db, rfq.id)
    bid_items = [
        BidRankItem(
            rank=i + 1,
            supplier_name=bid.supplier.full_name,
            carrier_name=bid.carrier_name,
            freight_charges=bid.freight_charges,
            origin_charges=bid.origin_charges,
            destination_charges=bid.destination_charges,
            total_charges=bid.total_charges,
            transit_time=bid.transit_time,
            quote_validity=bid.quote_validity,
            submitted_at=bid.submitted_at,
        ).model_dump()
        for i, bid in enumerate(ranked)
    ]

    return {
        "rfq": RFQResponse.model_validate(rfq).model_dump(),
        "config": AuctionConfigResponse.model_validate(rfq.config).model_dump() if rfq.config else None,
        "bids": bid_items,
        "logs": [LogItem.model_validate(log).model_dump() for log in rfq.logs],
    }


def _get_best_bids(db: Session, rfq_id: int) -> list[Bid]:
    all_bids = db.query(Bid).filter(Bid.rfq_id == rfq_id).all()
    best: dict[int, Bid] = {}
    for bid in all_bids:
        if bid.supplier_id not in best or bid.total_charges < best[bid.supplier_id].total_charges:
            best[bid.supplier_id] = bid
    return sorted(best.values(), key=lambda b: b.total_charges)


def _get_rankings(db: Session, rfq_id: int) -> list[int]:
    ranked = _get_best_bids(db, rfq_id)
    return [bid.supplier_id for bid in ranked]

def _get_l1_supplier_id(db: Session, rfq_id: int) -> int | None:
    """Returns the supplier_id of the current lowest (L1) bid."""
    ranked = _get_best_bids(db, rfq_id)
    return ranked[0].supplier_id if ranked else None


def _try_extend(db: Session,rfq: RFQ,new_bid: Bid,old_l1_id: int | None,old_rankings: list[int],new_rankings: list[int],):
    """Checks trigger conditions and extends auction if needed."""
    config = rfq.config
    if not config or datetime.now(timezone.utc) < rfq.bid_close_at - timedelta(minutes=config.trigger_window_minutes):
        return

    reason = ""
    if config.trigger_type == TriggerType.bid_received:
        reason = f"bid received in last {config.trigger_window_minutes} min"

    elif config.trigger_type == TriggerType.any_rank_change:
        if old_rankings != new_rankings:
            reason = f"rank change in last {config.trigger_window_minutes} min"

    elif config.trigger_type == TriggerType.l1_rank_change:
        new_l1_id = new_rankings[0] if new_rankings else None
        if old_l1_id != new_l1_id:
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

    old_rankings = _get_rankings(db, rfq.id)
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
    new_rankings = _get_rankings(db, rfq.id)

    total = bid.total_charges
    db.add(AuctionLog(
        rfq_id=rfq.id,
        event_type="bid_placed",
        message=f"{user.full_name} placed a bid of ₹{total:,.0f} via {bid.carrier_name}"
    ))

    _try_extend(db, rfq, bid, old_l1_id,old_rankings,new_rankings)

    db.commit()
    db.refresh(bid)

    # Notify all connected clients for this RFQ with full detail
    await manager.broadcast(rfq.id, {
        "type": "detail_update",
        "data": _build_detail_payload(db, rfq),
    })

    return BidResponse.model_validate(bid)


def list_bids_for_rfq(db: Session, rfq_id: int) -> list[BidResponse]:
    bids = db.query(Bid).filter(Bid.rfq_id == rfq_id).order_by(Bid.submitted_at.desc()).all()
    return [BidResponse.model_validate(b) for b in bids]
