from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.ws_manager import manager
from app.database.session import get_db
from app.models.rfq import Bid, RFQ
from app.models.user import UserRole
from app.schemas.rfq import AuctionDetailResponse, AuctionConfigResponse, BidRankItem, CreateRFQRequest, LogItem, RFQResponse
from app.services import auth_service, rfq_service

rfq_router = APIRouter(prefix="/rfq", tags=["RFQ"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_buyer(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user = auth_service.get_user_by_token(db, token)
    if user.role != UserRole.buyer:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Only buyers can perform this action")
    return user


@rfq_router.post("/create", response_model=RFQResponse)
def create_rfq(payload: CreateRFQRequest, buyer=Depends(get_current_buyer), db: Session = Depends(get_db)):
    return rfq_service.create_rfq(db, payload, buyer_id=buyer.id)


@rfq_router.get("/list", response_model=list[RFQResponse])
def list_rfqs(db: Session = Depends(get_db)):
    return rfq_service.list_rfqs(db)


@rfq_router.get("/{rfq_id}", response_model=RFQResponse)
def get_rfq(rfq_id: int, db: Session = Depends(get_db)):
    rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
    if not rfq:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "RFQ not found")
    return RFQResponse.model_validate(rfq)


@rfq_router.get("/{rfq_id}/detail", response_model=AuctionDetailResponse)
def get_rfq_detail(rfq_id: int, db: Session = Depends(get_db)):
    rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
    if not rfq:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "RFQ not found")

    # Build ranked bids: best bid per supplier, sorted by total_charges
    all_bids = db.query(Bid).filter(Bid.rfq_id == rfq_id).all()
    best: dict[int, Bid] = {}
    for bid in all_bids:
        if bid.supplier_id not in best or bid.total_charges < best[bid.supplier_id].total_charges:
            best[bid.supplier_id] = bid

    ranked = sorted(best.values(), key=lambda b: b.total_charges)
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
        )
        for i, bid in enumerate(ranked)
    ]

    return AuctionDetailResponse(
        rfq=RFQResponse.model_validate(rfq),
        config=AuctionConfigResponse.model_validate(rfq.config) if rfq.config else None,
        bids=bid_items,
        logs=[LogItem.model_validate(log) for log in rfq.logs],
    )


@rfq_router.websocket("/ws/{rfq_id}")
async def websocket_endpoint(websocket: WebSocket, rfq_id: int):
    await manager.connect(rfq_id, websocket)
    try:
        while True:
            await websocket.receive_text()  # Keep connection alive
    except WebSocketDisconnect:
        manager.disconnect(rfq_id, websocket)
