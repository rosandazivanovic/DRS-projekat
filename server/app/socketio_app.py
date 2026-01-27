from flask_socketio import SocketIO, join_room, emit
from flask import request

socketio = SocketIO(
    cors_allowed_origins="*",
    async_mode="threading",
    logger=True,
    engineio_logger=False
)


def register_ws_handlers():
    
    @socketio.on("connect")
    def on_connect():
        user_id = request.args.get("user_id")
        role = request.args.get("role")

        print(f"[WebSocket] Client connected: user_id={user_id}, role={role}")

        if role == "ADMIN":
            join_room("admins")
            print(f"[WebSocket] User {user_id} joined 'admins' room")

        if user_id:
            join_room(f"user:{user_id}")
            print(f"[WebSocket] User {user_id} joined personal room")

        emit("connected", {
            "message": "Successfully connected to WebSocket server",
            "userId": user_id,
            "role": role
        })

    @socketio.on("disconnect")
    def on_disconnect():
        print("[WebSocket] Client disconnected")

    @socketio.on("ping")
    def on_ping(data):
        """Test event za proveru konekcije"""
        print(f"[WebSocket] Ping received: {data}")
        emit("pong", {"received": data, "ok": True})