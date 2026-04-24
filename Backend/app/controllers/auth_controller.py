from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.auth import LoginRequest, SignupRequest, TokenResponse, UserResponse, VerifyOtpRequest
from app.services import auth_service

auth_router = APIRouter(prefix="/auth", tags=["Auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


@auth_router.post("/signup", response_model=TokenResponse)
def signup_route(payload: SignupRequest, db: Session = Depends(get_db)):
    return auth_service.signup(db, payload)


@auth_router.post("/login")
async def login_route(payload: LoginRequest, db: Session = Depends(get_db)):
    return await auth_service.login(db, payload)


@auth_router.post("/verify-otp", response_model=TokenResponse)
def verify_otp_route(payload: VerifyOtpRequest, db: Session = Depends(get_db)):
    return auth_service.verify_otp(db, payload.email, payload.otp)


@auth_router.get("/me", response_model=UserResponse)
def me_route(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user = auth_service.get_user_by_token(db, token)
    return UserResponse.model_validate(user)
