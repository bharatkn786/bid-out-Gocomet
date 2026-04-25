import sys
import os

# Add the Backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.session import engine
from app.database.base import Base
from app.models.rfq import RFQ, AuctionConfig, Bid
from app.models.user import User

print("Dropping RFQ related tables...")
try:
    AuctionConfig.__table__.drop(engine)
    print("Dropped auction_configs")
except Exception as e:
    print(f"Error dropping auction_configs: {e}")

try:
    Bid.__table__.drop(engine)
    print("Dropped bids")
except Exception as e:
    print(f"Error dropping bids: {e}")

try:
    RFQ.__table__.drop(engine)
    print("Dropped rfqs")
except Exception as e:
    print(f"Error dropping rfqs: {e}")

print("Recreating tables...")
Base.metadata.create_all(bind=engine)
print("Database schema successfully updated!")
