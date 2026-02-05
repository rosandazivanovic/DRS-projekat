import os
from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from dotenv import load_dotenv

from app.auth import auth_bp
from app.routes.users import users_bp
from app.routes.admin import admin_bp
from app.routes.courses import courses_bp
from app.routes.tasks import tasks_bp
from app.routes.reports import reports_bp
from app.socketio_app import socketio, register_ws_handlers
from app.redis_client import init_redis
from app.database import init_db

load_dotenv()


def create_app():
    app = Flask(__name__)

    app.config["SECRET_KEY"] = os.getenv(
        "SECRET_KEY", "dev-secret-key-change-in-production"
    )

    CORS(
        app,
        origins="*",  
        supports_credentials=True,
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "X-Session-ID"],
    )

    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            response = make_response("", 204)
            response.headers["Access-Control-Allow-Origin"] = request.headers.get("Origin", "*")  
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, X-Session-ID"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            return response

    try:
        init_redis()
        print("✅ Redis initialized")
    except Exception as e:
        print(f"⚠️ Redis initialization failed: {e}")

    try:
        init_db()
        print("✅ Database initialized")
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        raise

    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(courses_bp)
    app.register_blueprint(tasks_bp)
    app.register_blueprint(reports_bp)

    @app.get("/health")
    def health():
        return jsonify({"status": "ok"})

    @app.get("/")
    def root():
        return jsonify({"message": "Learning Platform API"})

    socketio.init_app(
        app,
        cors_allowed_origins="*", 
        async_mode="threading",
        ping_timeout=60,
        ping_interval=25,
        logger=True,  
        engineio_logger=True
    )
    register_ws_handlers()

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    
    import socket
    hostname = socket.gethostname()
    try:
        server_ip = socket.gethostbyname(hostname)
    except:
        server_ip = "Unable to detect IP"
    
    print("\n" + "="*60)
    print("🚀 LEARNING PLATFORM SERVER")
    print("="*60)
    print(f"📍 Server IP Address: {server_ip}")
    print(f"🔗 Local Access:      http://localhost:{port}")
    print(f"🌐 Network Access:    http://{server_ip}:{port}")
    print(f"📡 CORS:              Enabled for all origins (*)")
    print(f"🔌 WebSocket:         Enabled on ws://{server_ip}:{port}")
    print("="*60)
    print(f"\n💡 Other devices can access at: http://{server_ip}:{port}")
    print("="*60 + "\n")
    
    socketio.run(
        app,
        host="0.0.0.0",  
        port=port,
        debug=True,
        allow_unsafe_werkzeug=True,
        use_reloader=False,  
        log_output=True
    )