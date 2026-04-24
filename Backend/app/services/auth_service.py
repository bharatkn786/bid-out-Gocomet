import random
from fastapi import HTTPException, status
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.config import settings
from app.core.email import send_otp_email
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import LoginRequest, SignupRequest, TokenResponse, UserResponse

# Simple in-memory store for OTPs (email -> otp)
otp_store: dict[str, str] = {}

# 👉 payload is the data sent by the user (request body)
# 👉 payload.email is the email field inside that data
def signup(db: Session, payload: SignupRequest) -> TokenResponse:
    # Normalize email
    email = payload.email.lower()
    
    # Optional: Quick check before hitting DB unique constraint
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Email already registered")

    user = User(
        email=email,
        full_name=payload.full_name,
        role=payload.role,
        password_hash=hash_password(payload.password),
    )
    
    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Email already registered (race condition)")

    token = create_access_token(subject=str(user.id))
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


async def login(db: Session, payload: LoginRequest):
    # Normalize email for login too
    email = payload.email.lower()
    
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")

    # Generate a 6-digit OTP
    otp = str(random.randint(100000, 999999))
    otp_store[email] = otp
    print(f"--- OTP for {email} is: {otp} ---") # For easy testing
    
    try:
        await send_otp_email(email, otp)
    except Exception as e:
        print(f"Failed to send email: {e}")
        # In a real app, you might want to handle this better
        # For now, we still return success but maybe the user can check terminal

    return {"message": "OTP sent successfully", "email": email}

def verify_otp(db: Session, email: str, otp: str) -> TokenResponse:
    email = email.lower()
    if otp_store.get(email) != otp:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired OTP")

    # Clear OTP after successful use
    del otp_store[email]

    user = db.query(User).filter(User.email == email).first()
    if not user:
         raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")

    token = create_access_token(subject=str(user.id))
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


def get_user_by_token(db: Session, token: str) -> User:
    # If token starts with 'Bearer ', strip it
    if token.startswith("Bearer "):
        token = token[7:]
        
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise ValueError("Token missing user ID")
    except JWTError as e:
        # Better detail for debugging, but still secure
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, f"Invalid token: {str(e)}")
    except ValueError as e:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, str(e))

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User no longer exists")
        
    return user
