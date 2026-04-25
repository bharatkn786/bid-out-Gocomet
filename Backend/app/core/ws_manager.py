from typing import Iterable

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.connections: dict[int, list[WebSocket]] = {}

    def get_connections(self, rfq_id: int) -> Iterable[WebSocket]:
        return self.connections.get(rfq_id, [])

    async def connect(self, rfq_id: int, ws: WebSocket):
        await ws.accept()
        self.connections.setdefault(rfq_id, []).append(ws)

    def disconnect(self, rfq_id: int, ws: WebSocket):
        conns = self.connections.get(rfq_id, [])
        if ws in conns:
            conns.remove(ws)

    async def broadcast(self, rfq_id: int, message: dict):
        for ws in self.get_connections(rfq_id):
            try:
                await ws.send_json(message)
            except Exception:
                pass


manager = ConnectionManager()
