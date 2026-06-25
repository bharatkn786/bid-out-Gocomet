import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.controllers.auth_controller import auth_router
from app.controllers.bid_controller import bid_router
from app.controllers.rfq_controller import rfq_router
from app.core.config import settings
from app.core.socket_manager import sio
from app.database.base import Base
from app.database.session import engine
# Import models so SQLAlchemy registers tables.
from app.models.rfq import AuctionConfig, AuctionLog, Bid, RFQ  # noqa: F401
from app.models.user import User  # noqa: F401

fastapi_app = FastAPI(title=settings.app_name)

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@fastapi_app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)


@fastapi_app.get("/health")
def health():
    return {"status": "ok"}


fastapi_app.include_router(auth_router, prefix="/api")
fastapi_app.include_router(rfq_router, prefix="/api")
fastapi_app.include_router(bid_router, prefix="/api")

app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app)
