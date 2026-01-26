# server/app/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from app.models import Base

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://postgres:postgres@localhost:5432/learning_platform"
)

if "postgresql" not in DATABASE_URL and "postgres" not in DATABASE_URL:
    raise ValueError(
        "❌ SQLite nije dozvoljen! Koristi PostgreSQL.\n"
        f"Trenutni DATABASE_URL: {DATABASE_URL}"
    )

print(f"✅ Connecting to PostgreSQL: {DATABASE_URL}")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=False 
)

SessionLocal = scoped_session(
    sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine
    )
)


def init_db():
    print("🔧 Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()