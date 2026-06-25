import socketio


sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")


@sio.event
async def join_room(sid, data):
    rfq_id = int(data.get("rfq_id"))
    await sio.enter_room(sid, f"rfq:{rfq_id}")


@sio.event
async def leave_room(sid, data):
    rfq_id = int(data.get("rfq_id"))
    await sio.leave_room(sid, f"rfq:{rfq_id}")
