import os
from flask import Flask, request
from multiprocessing import Process

from app.api.routes import bp as internal_learning_bp
from app.db.database import engine, SessionLocal, init_db


def create_app() -> Flask:
    app = Flask(__name__)

    @app.get("/health")
    def health():
        return {"status": "learning-internal-service ok"}

    init_db()

    @app.before_request
    def open_db_session():
        request.environ["db"] = SessionLocal()

    @app.teardown_request
    def close_db_session(exc):
        db = request.environ.get("db")
        if db:
            if exc:
                db.rollback()
            db.close()

    app.register_blueprint(internal_learning_bp)

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
