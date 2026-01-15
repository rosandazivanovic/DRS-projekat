import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from app.auth import auth_bp
from app.db import db
from app.routes_users import users_bp
from app.routes_admin import admin_bp
from app.routes_courses import courses_bp
from app.routes_tasks import tasks_bp
from app.socketio_app import socketio, register_ws_handlers
from app.redis_client import init_redis

load_dotenv()


def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev")

    CORS(app)

    db_url = os.getenv("DATABASE_URL", "sqlite:///learning_platform.sqlite3")
    app.config["SQLALCHEMY_DATABASE_URI"] = db_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    init_redis()

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(courses_bp, url_prefix="/api/courses")
    app.register_blueprint(tasks_bp, url_prefix="/api/tasks")

    @app.get("/health")
    def health():
        return jsonify({"status": "server ok"})

    with app.app_context():
        db.create_all()

    socketio.init_app(app, cors_allowed_origins="*")
    register_ws_handlers()

    return app


app = create_app()

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)