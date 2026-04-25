from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.rfq import Bid
from app.schemas.bid import CreateBidRequest, BidResponse
from app.services import auth_service, bid_service

bid_router = APIRouter(prefix="/bid", tags=["Bid"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    return auth_service.get_user_by_token(db, token)


@bid_router.post("/place", response_model=BidResponse)
async def place_bid(payload: CreateBidRequest, user=Depends(get_current_user), db: Session = Depends(get_db)):
    return await bid_service.place_bid(db, payload, user)


@bid_router.get("/list/{rfq_id}", response_model=list[BidResponse])
def list_bids(rfq_id: int, db: Session = Depends(get_db)):
    return bid_service.list_bids_for_rfq(db, rfq_id)

@bid_router.get("/my-rfqs", response_model=list[int])
def get_my_bidded_rfqs(user=Depends(get_current_user), db: Session = Depends(get_db)):
    bids = db.query(Bid.rfq_id).filter(Bid.supplier_id == user.id).distinct().all()
    return [b[0] for b in bids]

