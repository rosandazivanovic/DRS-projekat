from flask import Blueprint, request, jsonify
from app.db import db
from app.models import CourseRequest, Course, User
from app.auth import session_required, role_required
from app.socketio_app import socketio
from app.email_utils import send_email
from datetime import datetime

bp = Blueprint("learning_api", __name__, url_prefix="/api")

@bp.post("/courses/request")
@session_required
@role_required("PROFESOR")
def create_course_request():
    """
    PROFESOR kreira zahtev za novi kurs (payload: name, description).
    Ruta odgovara /api/courses/request
    """
    data = request.get_json(force=True) or {}
    name = (data.get("name") or "").strip()
    description = (data.get("description") or "").strip()

    if not name or not description:
        return jsonify({"error": "name and description are required"}), 400

    professor_id = request.user.get("user_id")

    course_req = CourseRequest(
        professor_id=professor_id,
        name=name,
        description=description,
        status="PENDING"
    )

    db.session.add(course_req)
    db.session.commit()

    socketio.emit("course_request.created", course_req.to_dict(), room="admins")

    return jsonify(course_req.to_dict()), 201


@bp.post("/admin/course-requests/<int:request_id>/approve")
@session_required
@role_required("ADMIN")
def admin_approve_request(request_id: int):
    """
    ADMIN odobrava zahtev za kurs.
    Ruta odgovara /api/admin/course-requests/<id>/approve
    """
    course_req = CourseRequest.query.get(request_id)
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
    db.session.add(course)

    course_req.status = "APPROVED"
    db.session.commit()

    professor = User.query.get(course_req.professor_id)
    if professor:
        try:
            send_email(
                to=professor.email,
                subject="Zahtev za kurs odobren",
                body=f"Vaš zahtev za kurs '{course.name}' je odobren!"
            )
        except Exception:
            pass
        socketio.emit("course_request.approved", course_req.to_dict(), room=f"user:{professor.id}")

    socketio.emit("course_request.approved", course_req.to_dict(), room="admins")

    return jsonify(course_req.to_dict()), 200


@bp.post("/admin/course-requests/<int:request_id>/reject")
@session_required
@role_required("ADMIN")
def admin_reject_request(request_id: int):
    """
    ADMIN odbija zahtev za kurs.
    Ruta odgovara /api/admin/course-requests/<id>/reject
    Body zahteva treba da sadrži 'reason'.
    """
    course_req = CourseRequest.query.get(request_id)
    if not course_req:
        return jsonify({"error": "Request not found"}), 404

    if course_req.status != "PENDING":
        return jsonify({"error": "Request is not pending"}), 409

    data = request.get_json(force=True) or {}
    reason = (data.get("reason") or "").strip()
    if not reason:
        return jsonify({"error": "Reason is required"}), 400

    course_req.status = "REJECTED"
    db.session.commit()

    professor = User.query.get(course_req.professor_id)
    if professor:
        try:
            send_email(
                to=professor.email,
                subject="Zahtev za kurs odbijen",
                body=f"Vaš zahtev za kurs '{course_req.name}' je odbijen.\nRazlog: {reason}"
            )
        except Exception:
            pass
        socketio.emit("course_request.rejected", course_req.to_dict(), room=f"user:{professor.id}")

    socketio.emit("course_request.rejected", course_req.to_dict(), room="admins")

    return jsonify(course_req.to_dict()), 200
