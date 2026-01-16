from flask import Flask
#from .config import Config
#from .extensions import init_extensions
#from .factory import create_app
#from .settings import Config

def init_app():
    app = create_app()
    return app