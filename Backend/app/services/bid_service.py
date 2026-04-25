from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.rfq import RFQ, Bid, RFQStatus
from app.models.user import UserRole, User
from app.schemas.bid import CreateBidRequest, BidResponse


def place_bid(db: Session, payload: CreateBidRequest, user: User) -> BidResponse:
    # Requirement: Buyer cannot place bids
    if user.role == UserRole.buyer:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="buyer himself cannot place bid for placing bid make a slller accounnt and place your bids"
        )

    # Check if RFQ exists and is active
    rfq = db.query(RFQ).filter(RFQ.id == payload.rfq_id).first()
    if not rfq:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "RFQ not found")
    
    # Simple check for active status (can be expanded with time checks)
    if rfq.status != RFQStatus.active:
        # For the sake of this task, we'll assume it needs to be active
        # but let's check the time as well
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        if not (rfq.bid_start_at <= now <= rfq.bid_close_at):
             raise HTTPException(status.HTTP_400_BAD_REQUEST, "RFQ is not currently accepting bids")

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
    db.commit()
    db.refresh(bid)

    return BidResponse.model_validate(bid)


def list_bids_for_rfq(db: Session, rfq_id: int) -> list[BidResponse]:
    bids = db.query(Bid).filter(Bid.rfq_id == rfq_id).order_by(Bid.submitted_at.desc()).all()
    return [BidResponse.model_validate(b) for b in bids]
