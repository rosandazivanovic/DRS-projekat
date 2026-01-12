from flask import Flask
from .config import Config
from .extensions import init_extensions
from .features.users.routes import user_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    init_extensions(app)

    app.register_blueprint(user_bp, url_prefix="/api/users")

    return app