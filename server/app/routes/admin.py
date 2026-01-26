from flask import Blueprint, request, jsonify
from passlib.hash import pbkdf2_sha256

from .db import db
from .models import User, CourseRequest, Course
from .auth import session_required, role_required
from .socketio_app import socketio
from .email_utils import send_email

admin_bp = Blueprint("admin_bp", __name__)

@admin_bp.post("/users")
@session_required
@role_required("ADMIN")
def create_user():
    """ADMIN kreira novog korisnika (PROFESOR ili STUDENT)"""
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

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 409

    password = str(data["password"])
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

    db.session.add(user)
    db.session.commit()

    return jsonify(user.to_dict()), 201


@admin_bp.get("/users")
@session_required
@role_required("ADMIN")
def list_users():
    """ADMIN listuje sve korisnike"""
    users = User.query.all()
    return jsonify([u.to_dict() for u in users]), 200


@admin_bp.delete("/users/<int:user_id>")
@session_required
@role_required("ADMIN")
def delete_user(user_id):
    """ADMIN briše korisnika"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({"status": "deleted"}), 200


@admin_bp.get("/course-requests")
@session_required
@role_required("ADMIN")
def list_course_requests():
    """ADMIN vidi sve zahteve za kurseve"""
    requests = CourseRequest.query.all()
    return jsonify([r.to_dict() for r in requests]), 200


@admin_bp.post("/course-requests/<int:request_id>/approve")
@session_required
@role_required("ADMIN")
def approve_course_request(request_id):
    """ADMIN odobrava zahtev za kurs"""
    course_req = CourseRequest.query.get(request_id)
    if not course_req:
        return jsonify({"error": "Request not found"}), 404

    if course_req.status != "PENDING":
        return jsonify({"error": "Request is not pending"}), 409

    course = Course(
        professor_id=course_req.professor_id,
        name=course_req.name,
        description=course_req.description
    )
    db.session.add(course)
    
    course_req.status = "APPROVED"
    db.session.commit()

    professor = User.query.get(course_req.professor_id)
    send_email(
        to=professor.email,
        subject="Zahtev za kurs odobren",
        body=f"Vaš zahtev za kurs '{course.name}' je odobren!"
    )

    socketio.emit("course_request.approved", course_req.to_dict(), room=f"user:{professor.id}")

    return jsonify(course_req.to_dict()), 200


@admin_bp.post("/course-requests/<int:request_id>/reject")
@session_required
@role_required("ADMIN")
def reject_course_request(request_id):
    """ADMIN odbija zahtev za kurs"""
    course_req = CourseRequest.query.get(request_id)
    if not course_req:
        return jsonify({"error": "Request not found"}), 404

    if course_req.status != "PENDING":
        return jsonify({"error": "Request is not pending"}), 409

    course_req.status = "REJECTED"
    db.session.commit()

    professor = User.query.get(course_req.professor_id)
    send_email(
        to=professor.email,
        subject="Zahtev za kurs odbijen",
        body=f"Vaš zahtev za kurs '{course_req.name}' je odbijen."
    )

    socketio.emit("course_request.rejected", course_req.to_dict(), room=f"user:{professor.id}")

    return jsonify(course_req.to_dict()), 200