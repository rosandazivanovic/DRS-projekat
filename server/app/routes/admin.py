from flask import Blueprint, request, jsonify
from passlib.hash import pbkdf2_sha256
from sqlalchemy.orm import Session
from datetime import datetime

from app.models import User, CourseRequest, Course
from app.auth import session_required, role_required
from app.socketio_app import socketio
from app.email_utils import send_email
from app.database import SessionLocal

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@admin_bp.post("/users")
@session_required
@role_required("ADMIN")
def create_user():
    """ADMIN kreira novog korisnika (PROFESOR ili STUDENT)"""
    db: Session = SessionLocal()
    try:
        data = request.get_json() or {}

        required_fields = [
            "firstName", "lastName", "email", "password",
            "birthDate", "gender", "country", "street", "number", "role"
        ]

        missing = [f for f in required_fields if f not in data or str(data[f]).strip() == ""]
        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

        email = data["email"].strip().lower()
        role = data["role"].strip().upper()

        if role not in ["STUDENT", "PROFESOR"]:
            return jsonify({"error": "Role must be STUDENT or PROFESOR"}), 400

        if db.query(User).filter(User.email == email).first():
            return jsonify({"error": "Email already exists"}), 409

        password = str(data["password"])
        if len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters"}), 400

        password_hash = pbkdf2_sha256.hash(password)

        user = User(
            first_name=data["firstName"].strip(),
            last_name=data["lastName"].strip(),
            email=email,
            birth_date=str(data["birthDate"]).strip(),
            gender=str(data["gender"]).strip(),
            country=data["country"].strip(),
            street=data["street"].strip(),
            number=str(data["number"]).strip(),
            role=role,
            password_hash=password_hash
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return jsonify(user.to_dict()), 201

    except Exception as e:
        db.rollback()
        return jsonify({"error": "Failed to create user", "detail": str(e)}), 500
    finally:
        db.close()


@admin_bp.get("/users")
@session_required
@role_required("ADMIN")
def list_users():
    """ADMIN listuje sve korisnike"""
    db: Session = SessionLocal()
    try:
        users = db.query(User).all()
        return jsonify([u.to_dict() for u in users]), 200
    finally:
        db.close()


@admin_bp.delete("/users/<int:user_id>")
@session_required
@role_required("ADMIN")
def delete_user(user_id):
    """ADMIN briše korisnika"""
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        if user.role == "ADMIN":
            return jsonify({"error": "Cannot delete admin account"}), 403

        db.delete(user)
        db.commit()
        
        return jsonify({"status": "deleted", "message": "User deleted successfully"}), 200

    except Exception as e:
        db.rollback()
        return jsonify({"error": "Failed to delete user", "detail": str(e)}), 500
    finally:
        db.close()


@admin_bp.get("/course-requests")
@session_required
@role_required("ADMIN")
def list_course_requests():
    """ADMIN vidi sve zahteve za kurseve"""
    db: Session = SessionLocal()
    try:
        requests = db.query(CourseRequest).order_by(CourseRequest.created_at.desc()).all()
        return jsonify([r.to_dict() for r in requests]), 200
    finally:
        db.close()


@admin_bp.post("/course-requests/<int:request_id>/approve")
@session_required
@role_required("ADMIN")
def approve_course_request(request_id):
    """ADMIN odobrava zahtev za kurs - automatski kreira aktivan kurs"""
    db: Session = SessionLocal()
    try:
        course_req = db.query(CourseRequest).filter(CourseRequest.id == request_id).first()
        if not course_req:
            return jsonify({"error": "Request not found"}), 404

        if course_req.status != "PENDING":
            return jsonify({"error": "Request is not pending"}), 409

        course = Course(
            professor_id=course_req.professor_id,
            name=course_req.name,
            description=course_req.description,
            created_at=datetime.utcnow()
        )
        db.add(course)
        
        course_req.status = "APPROVED"
        db.commit()
        db.refresh(course_req)
        db.refresh(course)

        professor = db.query(User).filter(User.id == course_req.professor_id).first()
        if professor:
            try:
                send_email(
                    to=professor.email,
                    subject="✅ Zahtev za kurs odobren",
                    body=f"""
Poštovani/a {professor.first_name},

Vaš zahtev za kurs '{course.name}' je odobren!

Kurs je sada aktivan i možete:
- Dodavati materijale za učenje
- Kreirati zadatke
- Upravljati studentima

Prijavite se na platformu kako biste počeli.

Srdačan pozdrav,
Learning Platform
                    """
                )
            except Exception as e:
                print(f"Failed to send email: {e}")

            socketio.emit(
                "course_request.approved",
                {
                    **course_req.to_dict(),
                    "courseId": course.id  
                },
                room=f"user:{professor.id}"
            )

        socketio.emit(
            "course_request.approved",
            course_req.to_dict(),
            room="admins"
        )

        return jsonify({
            **course_req.to_dict(),
            "courseId": course.id  
        }), 200

    except Exception as e:
        db.rollback()
        return jsonify({"error": "Failed to approve request", "detail": str(e)}), 500
    finally:
        db.close()

@admin_bp.post("/course-requests/<int:request_id>/reject")
@session_required
@role_required("ADMIN")
def reject_course_request(request_id):
    """ADMIN odbija zahtev za kurs"""
    db: Session = SessionLocal()
    try:
        course_req = db.query(CourseRequest).filter(CourseRequest.id == request_id).first()
        if not course_req:
            return jsonify({"error": "Request not found"}), 404

        if course_req.status != "PENDING":
            return jsonify({"error": "Request is not pending"}), 409

        data = request.get_json(force=True) or {}
        reason = (data.get("reason") or "").strip()
        
        if not reason:
            return jsonify({"error": "Rejection reason is required"}), 400

        course_req.status = "REJECTED"
        course_req.rejection_reason = reason
        db.commit()
        db.refresh(course_req)

        professor = db.query(User).filter(User.id == course_req.professor_id).first()
        if professor:
            try:
                send_email(
                    to=professor.email,
                    subject="Zahtev za kurs odbijen",
                    body=f"Vaš zahtev za kurs '{course_req.name}' je odbijen.\n\nRazlog: {reason}"
                )
            except Exception as e:
                print(f"Failed to send email: {e}")

            socketio.emit(
                "course_request.rejected",
                course_req.to_dict(),
                room=f"user:{professor.id}"
            )

        socketio.emit(
            "course_request.rejected",
            course_req.to_dict(),
            room="admins"
        )

        return jsonify(course_req.to_dict()), 200

    except Exception as e:
        db.rollback()
        return jsonify({"error": "Failed to reject request", "detail": str(e)}), 500
    finally:
        db.close()