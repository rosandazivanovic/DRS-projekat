from app.database import engine
from app.models import Base

print("🛠️  Kreiram tabele u PostgreSQL bazi...")
Base.metadata.create_all(bind=engine)
print("✅ Sve tabele su uspješno kreirane!")