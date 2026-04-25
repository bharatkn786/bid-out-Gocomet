from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.connections: dict[int, list[WebSocket]] = {}

    async def connect(self, rfq_id: int, ws: WebSocket):
        await ws.accept()
        self.connections.setdefault(rfq_id, []).append(ws)

    def disconnect(self, rfq_id: int, ws: WebSocket):
        conns = self.connections.get(rfq_id, [])
        if ws in conns:
            conns.remove(ws)

    async def broadcast(self, rfq_id: int, message: dict):
        for ws in self.connections.get(rfq_id, []):
            try:
                await ws.send_json(message)
            except Exception:
                pass


manager = ConnectionManager()
