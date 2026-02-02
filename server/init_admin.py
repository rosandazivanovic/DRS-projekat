
from dotenv import load_dotenv
load_dotenv()

from app.database import SessionLocal
from app.models import User
from passlib.hash import pbkdf2_sha256

def create_initial_users():
    db = SessionLocal()
    
    try:
        existing_admin = db.query(User).filter(User.email == "admin@test.com").first()
        if existing_admin:
            print("⚠️  Admin korisnik već postoji")
        else:
            admin = User(
                first_name="Admin",
                last_name="Administrator",
                email="admin@test.com",
                birth_date="1990-01-01",
                gender="M",
                country="Srbija",
                street="Adminova ulica",
                number="1",
                role="ADMIN",
                password_hash=pbkdf2_sha256.hash("test1234")
            )
            db.add(admin)
            print("✅ Admin nalog kreiran: admin@test.com / test1234")

        existing_profesor = db.query(User).filter(User.email == "profesor@test.com").first()
        if existing_profesor:
            print("⚠️  Profesor korisnik već postoji")
        else:
            profesor = User(
                first_name="Marko",
                last_name="Marković",
                email="profesor@test.com",
                birth_date="1985-05-15",
                gender="M",
                country="Srbija",
                street="Profesorska ulica",
                number="10",
                role="PROFESOR",
                password_hash=pbkdf2_sha256.hash("test1234")
            )
            db.add(profesor)
            print("✅ Profesor nalog kreiran: profesor@test.com / test1234")

        existing_student = db.query(User).filter(User.email == "student@test.com").first()
        if existing_student:
            print("⚠️  Student korisnik već postoji")
        else:
            student = User(
                first_name="Ana",
                last_name="Anić",
                email="student@test.com",
                birth_date="2000-08-20",
                gender="F",
                country="Srbija",
                street="Studentska ulica",
                number="5",
                role="STUDENT",
                password_hash=pbkdf2_sha256.hash("test1234")
            )
            db.add(student)
            print("✅ Student nalog kreiran: student@test.com / test1234")

        db.commit()
        print("\n🎉 Inicijalni korisnici su uspešno kreirani!")
        print("\nPristup:")
        print("  Admin:    admin@test.com    / test1234")
        print("  Profesor: profesor@test.com / test1234")
        print("  Student:  student@test.com  / test1234")

    except Exception as e:
        db.rollback()
        print(f"❌ Greška pri kreiranju korisnika: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    create_initial_users()