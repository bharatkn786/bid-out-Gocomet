from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import UserRole
from app.schemas.rfq import CreateRFQRequest, RFQResponse
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
