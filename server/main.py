import os
from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from dotenv import load_dotenv
from .create_test_data import seed


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
        origins=["http://localhost:5173"], 
        supports_credentials=True,
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "X-Session-ID"],
    )

    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            response = make_response("", 204)
            response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
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
        cors_allowed_origins=["http://localhost:5173"],  
        async_mode="threading"
    )
    register_ws_handlers()

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    print(f"\n🚀 Starting server on port {port}...")
    print(f"📡 CORS enabled for: http://localhost:5173")
    print(f"🔗 API URL: http://localhost:{port}")
    
    socketio.run(
        app,
        host="0.0.0.0",
        port=port,
        debug=True,
        allow_unsafe_werkzeug=True,
    )