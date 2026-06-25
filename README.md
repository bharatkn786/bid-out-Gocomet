# Bid Out - Logistics Auction Platform

A full-stack RFQ and bidding platform for logistics auctions. Buyers publish RFQs, sellers place bids in real time, and auctions extend automatically based on configurable rules.

## Project Box

| Layer | Stack Used |
|---|---|
| Frontend | React (Vite), Tailwind CSS |
| Backend | FastAPI, SQLAlchemy |
| Database | PostgreSQL |
| Realtime | WebSocket |
| Authentication | JWT + OTP (Email SMTP) |
| API Style | REST |

## Highlights
- Buyer and seller roles with OTP-based login
- RFQ creation with British auction extensions
- Live bid updates with WebSocket events
- Auction ranking, activity logs, and winner view

## Tech Stack
- Backend: FastAPI, SQLAlchemy, PostgreSQL
- Frontend: React (Vite), Tailwind CSS

## Project Structure
```
Bid-out-Gocomet/
|-- Backend/
|   |-- .env.example
|   |-- fix_db.py
|   |-- requirements.txt
|   `-- app/
|       |-- main.py
|       |-- controllers/
|       |   |-- auth_controller.py
|       |   |-- bid_controller.py
|       |   `-- rfq_controller.py
|       |-- core/
|       |   |-- config.py
|       |   |-- email.py
|       |   |-- security.py
|       |   `-- ws_manager.py
|       |-- database/
|       |   |-- base.py
|       |   `-- session.py
|       |-- models/
|       |   |-- __init__.py
|       |   |-- rfq.py
|       |   `-- user.py
|       |-- schemas/
|       |   |-- auth.py
|       |   |-- bid.py
|       |   `-- rfq.py
|       `-- services/
|           |-- auth_service.py
|           |-- bid_service.py
|           `-- rfq_service.py
|-- Frontend/
|   |-- .gitignore
|   |-- eslint.config.js
|   |-- index.html
|   |-- package-lock.json
|   |-- package.json
|   |-- vite.config.js
|   |-- public/
|   `-- src/
|       |-- App.jsx
|       |-- index.css
|       |-- main.jsx
|       |-- assets/
|       |-- components/
|       |   |-- AuctionCard.jsx
|       |   |-- AuthModal.jsx
|       |   |-- Navbar.jsx
|       |   `-- Toast.jsx
|       |-- hooks/
|       |   `-- useAuth.js
|       |-- pages/
|       |   |-- CreateRFQ.jsx
|       |   |-- Home.jsx
|       |   |-- Login.jsx
|       |   |-- RFQAuction.jsx
|       |   `-- Signup.jsx
|       |-- services/
|       |   |-- api.js
|       |   |-- authApi.js
|       |   |-- bidApi.js
|       |   `-- rfqApi.js
|       `-- utils/
|-- .gitignore
|-- HLD.md
`-- README.md
```

## Architecture (HLD)
```mermaid
flowchart LR
  U[User Browser] -->|HTTP| FE[Frontend: React/Vite]
  FE -->|REST API| BE[Backend: FastAPI]
  FE -->|WebSocket| WS[Realtime RFQ Updates]
  BE --> DB[(PostgreSQL)]
  BE --> MAIL[SMTP Provider]
  WS --> BE
```

## Interactive Database Schema
```mermaid
erDiagram
   USERS {
      int id PK
      string email UK
      string full_name
      string role
      string password_hash
      datetime created_at
   }

   RFQS {
      int id PK
      string name
      string description
      string reference_id UK
      int created_by FK
      datetime bid_start_at
      datetime bid_close_at
      datetime forced_close_at
      datetime pickup_date
      string status
      datetime created_at
   }

   AUCTION_CONFIGS {
      int id PK
      int rfq_id FK "unique"
      int trigger_window_minutes
      int extension_duration_minutes
      string trigger_type
   }

   BIDS {
      int id PK
      int rfq_id FK
      int supplier_id FK
      string carrier_name
      float freight_charges
      float origin_charges
      float destination_charges
      int transit_time
      int quote_validity
      datetime submitted_at
   }

   AUCTION_LOGS {
      int id PK
      int rfq_id FK
      string event_type
      text message
      datetime created_at
   }

   USERS ||--o{ RFQS : creates
   USERS ||--o{ BIDS : places
   RFQS ||--|| AUCTION_CONFIGS : has
   RFQS ||--o{ BIDS : receives
   RFQS ||--o{ AUCTION_LOGS : records
```

## Workflow Diagram
```mermaid
sequenceDiagram
  participant Buyer
  participant Seller
  participant FE as Frontend
  participant BE as Backend
  participant DB as Database
  participant SMTP as Email

  Buyer->>FE: Sign up / Login
  FE->>BE: /auth/login
  BE->>SMTP: Send OTP
  Seller->>FE: Enter OTP
  FE->>BE: /auth/verify-otp
  BE->>DB: Validate user
  BE-->>FE: Access token

  Buyer->>FE: Create RFQ
  FE->>BE: /rfq/create
  BE->>DB: Save RFQ + config
  BE-->>FE: RFQ created

  Seller->>FE: Place bid
  FE->>BE: /bid/place
  BE->>DB: Save bid + log
  BE-->>FE: Bid saved
  BE-->>FE: WebSocket event
```

## Setup

### Backend
1. Create environment file from example:
   - Copy `Backend/.env.example` to `Backend/.env`
2. Install dependencies:
   - `pip install -r Backend/requirements.txt`
3. Run the API:
   - `uvicorn app.main:app --reload --app-dir Backend`

### Frontend
1. Install dependencies:
   - `cd Frontend`
   - `npm install`
2. Start the dev server:
   - `npm run dev`

## Environment Variables
Backend uses `Backend/.env` (see `Backend/.env.example`).

Key values:
- `DATABASE_URL` - Postgres connection string
- `SECRET_KEY` - JWT signing key
- `MAIL_*` - SMTP config for OTP

Frontend API base is currently set in `Frontend/src/services/api.js`.

## API Overview
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/verify-otp`
- `GET /api/auth/me`
- `POST /api/rfq/create`
- `GET /api/rfq/list`
- `GET /api/rfq/{id}`
- `GET /api/rfq/{id}/detail`
- `POST /api/bid/place`
- `GET /api/bid/list/{rfq_id}`
- `GET /api/bid/my-rfqs`

## Notes
- Real-time updates use Socket.IO rooms (default `/socket.io` endpoint)
- OTP is sent via configured SMTP settings

## License
MIT



