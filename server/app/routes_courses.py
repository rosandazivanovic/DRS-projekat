from flask import Blueprint, request, jsonify

from .db import db
from .models import User, Course, CourseRequest, CourseEnrollment
from .auth import session_required, role_required
from .socketio_app import socketio

courses_bp = Blueprint("courses_bp", __name__)

@courses_bp.post("/request")
@session_required
@role_required("PROFESOR")
def create_course_request():
    """PROFESOR kreira zahtev za novi kurs"""
    data = request.get_json() or {}
    
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


@courses_bp.get("/my-requests")
@session_required
@role_required("PROFESOR")
def get_my_course_requests():
    """PROFESOR vidi svoje zahteve za kurseve"""
    professor_id = request.user.get("user_id")
    requests = CourseRequest.query.filter_by(professor_id=professor_id).all()
    return jsonify([r.to_dict() for r in requests]), 200


@courses_bp.get("/")
@session_required
def list_courses():
    """Svi korisnici mogu da vide odobrene kurseve"""
    courses = Course.query.all()
    return jsonify([c.to_dict() for c in courses]), 200


@courses_bp.get("/<int:course_id>")
@session_required
def get_course(course_id):
    """Detalji kursa"""
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"error": "Course not found"}), 404
    
    return jsonify(course.to_dict()), 200


@courses_bp.patch("/<int:course_id>")
@session_required
@role_required("PROFESOR")
def update_course(course_id):
    """PROFESOR ažurira svoj kurs"""
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"error": "Course not found"}), 404
    
    professor_id = request.user.get("user_id")
    if course.professor_id != professor_id:
        return jsonify({"error": "You are not the owner of this course"}), 403
    
    data = request.get_json() or {}
    
    if "name" in data:
        course.name = data["name"].strip()
    if "description" in data:
        course.description = data["description"].strip()
    
    db.session.commit()
    return jsonify(course.to_dict()), 200


@courses_bp.delete("/<int:course_id>")
@session_required
@role_required("PROFESOR")
def delete_course(course_id):
    """PROFESOR briše svoj kurs"""
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"error": "Course not found"}), 404
    
    professor_id = request.user.get("user_id")
    if course.professor_id != professor_id:
        return jsonify({"error": "You are not the owner of this course"}), 403
    
    db.session.delete(course)
    db.session.commit()
    return jsonify({"status": "deleted"}), 200


@courses_bp.post("/<int:course_id>/material")
@session_required
@role_required("PROFESOR")
def upload_course_material(course_id):
    """PROFESOR okači materijal za učenje (PDF)"""
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"error": "Course not found"}), 404
    
    professor_id = request.user.get("user_id")
    if course.professor_id != professor_id:
        return jsonify({"error": "You are not the owner of this course"}), 403
    
    data = request.get_json() or {}
    material_path = data.get("materialPath")
    
    if not material_path:
        return jsonify({"error": "materialPath is required"}), 400
    
    course.material_path = material_path
    db.session.commit()
    
    return jsonify(course.to_dict()), 200


@courses_bp.post("/<int:course_id>/enroll")
@session_required
@role_required("PROFESOR")
def enroll_student(course_id):
    """PROFESOR dodaje studenta na kurs"""
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"error": "Course not found"}), 404
    
    professor_id = request.user.get("user_id")
    if course.professor_id != professor_id:
        return jsonify({"error": "You are not the owner of this course"}), 403
    
    data = request.get_json() or {}
    student_id = data.get("studentId")
    
    if not student_id:
        return jsonify({"error": "studentId is required"}), 400
    
    student = User.query.get(student_id)
    if not student or student.role != "STUDENT":
        return jsonify({"error": "Invalid student"}), 400
    
    existing = CourseEnrollment.query.filter_by(
        course_id=course_id, 
        student_id=student_id
    ).first()
    
    if existing:
        return jsonify({"error": "Student already enrolled"}), 409
    
    enrollment = CourseEnrollment(
        course_id=course_id,
        student_id=student_id
    )
    db.session.add(enrollment)
    db.session.commit()
    
    return jsonify(enrollment.to_dict()), 201


@courses_bp.get("/<int:course_id>/students")
@session_required
@role_required("PROFESOR")
def list_course_students(course_id):
    """PROFESOR vidi studente na kursu"""
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"error": "Course not found"}), 404
    
    professor_id = request.user.get("user_id")
    if course.professor_id != professor_id:
        return jsonify({"error": "You are not the owner of this course"}), 403
    
    enrollments = CourseEnrollment.query.filter_by(course_id=course_id).all()
    return jsonify([e.to_dict() for e in enrollments]), 200


@courses_bp.get("/my-courses")
@session_required
@role_required("STUDENT")
def get_my_courses():
    """STUDENT vidi kurseve na koje je upisan"""
    student_id = request.user.get("user_id")
    enrollments = CourseEnrollment.query.filter_by(student_id=student_id).all()
    
    courses = [e.course.to_dict() for e in enrollments]
    return jsonify(courses), 200