from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.rfq import AuctionConfig, RFQ, RFQStatus
from app.schemas.rfq import CreateRFQRequest, RFQResponse


def create_rfq(db: Session, payload: CreateRFQRequest, buyer_id: int) -> RFQResponse:
    # Validation: forced close must be after bid close
    if payload.forced_close_at <= payload.bid_close_at:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Forced close time must be after bid close time")

    # Validation: bid close must be after bid start
    if payload.bid_close_at <= payload.bid_start_at:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Bid close time must be after bid start time")

    rfq = RFQ(
        name=payload.name,
        description=payload.description,
        created_by=buyer_id,
        bid_start_at=payload.bid_start_at,
        bid_close_at=payload.bid_close_at,
        forced_close_at=payload.forced_close_at,
        pickup_date=payload.pickup_date,
        status=RFQStatus.draft,
    )
    db.add(rfq)
    db.flush()  # Get rfq.id

    # Auto-generate reference_id based on incrementing ID
    rfq.reference_id = f"RFQ-{rfq.id:04d}"

    config = AuctionConfig(
        rfq_id=rfq.id,
        trigger_window_minutes=payload.auction_config.trigger_window_minutes,
        extension_duration_minutes=payload.auction_config.extension_duration_minutes,
        trigger_type=payload.auction_config.trigger_type,
    )
    db.add(config)
    db.commit()
    db.refresh(rfq)

    return RFQResponse.model_validate(rfq)


def list_rfqs(db: Session) -> list[RFQResponse]:
    rfqs = db.query(RFQ).order_by(RFQ.created_at.desc()).all()
    results = []
    for r in rfqs:
        resp = RFQResponse.model_validate(r)
        if r.bids:
            resp.current_lowest_bid = min(b.total_charges for b in r.bids)
        results.append(resp)
    return results
