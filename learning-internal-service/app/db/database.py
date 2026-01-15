import os
import time
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError

from app.db.models import Base

DB_URL = os.getenv(
    "DB2_URL",
    "postgresql+psycopg2://postgres:postgres@db2:5432/learning_internal"
)

engine = create_engine(DB_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


def init_db():
    for _ in range(30):
        try:
            Base.metadata.create_all(bind=engine)
            return
        except OperationalError:
            time.sleep(1)

    raise RuntimeError("DB not ready after 30s")
