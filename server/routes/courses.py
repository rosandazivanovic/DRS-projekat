from flask import Blueprint, request, jsonify
from sqlalchemy.orm import Session

from app.models import User, Course, CourseRequest, CourseEnrollment
from app.auth import session_required, role_required
from app.socketio_app import socketio
from app.email_utils import send_email
from app.database import SessionLocal

courses_bp = Blueprint("courses", __name__, url_prefix="/api/courses")


@courses_bp.post("/request")
@session_required
@role_required("PROFESOR")
def create_course_request():
    """PROFESOR kreira zahtev za novi kurs"""
    db: Session = SessionLocal()
    try:
        data = request.get_json() or {}
        
        name = (data.get("name") or "").strip()
        description = (data.get("description") or "").strip()
        
        if not name or not description:
            return jsonify({"error": "Name and description are required"}), 400

        professor_id = request.user.get("user_id")
        
        course_req = CourseRequest(
            professor_id=professor_id,
            name=name,
            description=description,
            status="PENDING"
        )
        
        db.add(course_req)
        db.commit()
        db.refresh(course_req)
        
        socketio.emit(
            "course_request.created",
            course_req.to_dict(),
            room="admins"
        )
        
        return jsonify(course_req.to_dict()), 201

    except Exception as e:
        db.rollback()
        return jsonify({"error": "Failed to create request", "detail": str(e)}), 500
    finally:
        db.close()


@courses_bp.get("/my-requests")
@session_required
@role_required("PROFESOR")
def get_my_course_requests():
    """PROFESOR vidi svoje zahteve za kurseve"""
    db: Session = SessionLocal()
    try:
        professor_id = request.user.get("user_id")
        requests = db.query(CourseRequest).filter(
            CourseRequest.professor_id == professor_id
        ).order_by(CourseRequest.created_at.desc()).all()
        
        return jsonify([r.to_dict() for r in requests]), 200
    finally:
        db.close()


@courses_bp.get("/")
@session_required
def list_courses():
    """Svi korisnici mogu da vide odobrene kurseve"""
    db: Session = SessionLocal()
    try:
        courses = db.query(Course).order_by(Course.created_at.desc()).all()
        return jsonify([c.to_dict() for c in courses]), 200
    finally:
        db.close()


@courses_bp.get("/<int:course_id>")
@session_required
def get_course(course_id):
    """Detalji kursa"""
    db: Session = SessionLocal()
    try:
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            return jsonify({"error": "Course not found"}), 404
        
        return jsonify(course.to_dict()), 200
    finally:
        db.close()


@courses_bp.patch("/<int:course_id>")
@session_required
@role_required("PROFESOR")
def update_course(course_id):
    """PROFESOR ažurira svoj kurs"""
    db: Session = SessionLocal()
    try:
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            return jsonify({"error": "Course not found"}), 404
        
        professor_id = request.user.get("user_id")
        if course.professor_id != professor_id:
            return jsonify({"error": "You are not the owner of this course"}), 403
        
        data = request.get_json() or {}
        
        if "name" in data:
            name = data["name"].strip()
            if not name:
                return jsonify({"error": "Course name cannot be empty"}), 400
            course.name = name
            
        if "description" in data:
            description = data["description"].strip()
            if not description:
                return jsonify({"error": "Course description cannot be empty"}), 400
            course.description = description
        
        db.commit()
        db.refresh(course)
        
        return jsonify(course.to_dict()), 200

    except Exception as e:
        db.rollback()
        return jsonify({"error": "Failed to update course", "detail": str(e)}), 500
    finally:
        db.close()


@courses_bp.delete("/<int:course_id>")
@session_required
@role_required("PROFESOR")
def delete_course(course_id):
    """PROFESOR briše svoj kurs"""
    db: Session = SessionLocal()
    try:
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            return jsonify({"error": "Course not found"}), 404
        
        professor_id = request.user.get("user_id")
        if course.professor_id != professor_id:
            return jsonify({"error": "You are not the owner of this course"}), 403
        
        db.delete(course)
        db.commit()
        
        return jsonify({"status": "deleted", "message": "Course deleted successfully"}), 200

    except Exception as e:
        db.rollback()
        return jsonify({"error": "Failed to delete course", "detail": str(e)}), 500
    finally:
        db.close()


@courses_bp.post("/<int:course_id>/material")
@session_required
@role_required("PROFESOR")
def upload_course_material(course_id):
    """PROFESOR okači materijal za učenje (PDF)"""
    db: Session = SessionLocal()
    try:
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            return jsonify({"error": "Course not found"}), 404
        
        professor_id = request.user.get("user_id")
        if course.professor_id != professor_id:
            return jsonify({"error": "You are not the owner of this course"}), 403
        
        data = request.get_json() or {}
        material_path = data.get("materialPath")  
        file_name = data.get("fileName", "material.pdf")
        
        if not material_path:
            return jsonify({"error": "materialPath is required"}), 400
        
        if not material_path.startswith("data:application/pdf"):
            return jsonify({"error": "Invalid PDF format"}), 400
        
        course.material_path = material_path
        db.commit()
        db.refresh(course)
        
        enrollments = db.query(CourseEnrollment).filter(
            CourseEnrollment.course_id == course_id
        ).all()
        
        for enrollment in enrollments:
            student = enrollment.student
            try:
                send_email(
                    to=student.email,
                    subject=f"Novi materijal u kursu {course.name}",
                    body=f"Dodat je novi materijal: {file_name}"
                )
            except Exception as e:
                print(f"Failed to send email to {student.email}: {e}")
        
        return jsonify(course.to_dict()), 200

    except Exception as e:
        db.rollback()
        return jsonify({"error": "Failed to upload material", "detail": str(e)}), 500
    finally:
        db.close()


@courses_bp.post("/<int:course_id>/enroll")
@session_required
@role_required("STUDENT")
def enroll_student(course_id):
    """STUDENT se upisuje na kurs"""
    db: Session = SessionLocal()
    try:
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            return jsonify({"error": "Course not found"}), 404
        
        student_id = request.user.get("user_id")
        
        existing = db.query(CourseEnrollment).filter(
            CourseEnrollment.course_id == course_id,
            CourseEnrollment.student_id == student_id
        ).first()
        
        if existing:
            return jsonify({"error": "Already enrolled"}), 409
        
        enrollment = CourseEnrollment(
            course_id=course_id,
            student_id=student_id
        )
        db.add(enrollment)
        db.commit()
        db.refresh(enrollment)
        
        return jsonify(enrollment.to_dict()), 201

    except Exception as e:
        db.rollback()
        return jsonify({"error": "Failed to enroll", "detail": str(e)}), 500
    finally:
        db.close()


@courses_bp.post("/<int:course_id>/enroll-student")
@session_required
@role_required("PROFESOR")
def enroll_student_by_professor(course_id):
    """PROFESOR dodaje studenta na svoj kurs"""
    db: Session = SessionLocal()
    try:
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            return jsonify({"error": "Course not found"}), 404
        
        professor_id = request.user.get("user_id")
        if course.professor_id != professor_id:
            return jsonify({"error": "You are not the owner of this course"}), 403
        
        data = request.get_json() or {}
        student_id = data.get("studentId")
        
        if not student_id:
            return jsonify({"error": "studentId is required"}), 400
        
        student = db.query(User).filter(User.id == student_id).first()
        if not student:
            return jsonify({"error": "Student not found"}), 404
        
        if student.role != "STUDENT":
            return jsonify({"error": "User is not a student"}), 400
        
        existing = db.query(CourseEnrollment).filter(
            CourseEnrollment.course_id == course_id,
            CourseEnrollment.student_id == student_id
        ).first()
        
        if existing:
            return jsonify({"error": "Student is already enrolled"}), 409
        
        enrollment = CourseEnrollment(
            course_id=course_id,
            student_id=student_id
        )
        db.add(enrollment)
        db.commit()
        db.refresh(enrollment)
        
        try:
            send_email(
                to=student.email,
                subject=f"Dodati ste na kurs: {course.name}",
                body=f"""
Poštovani/a {student.first_name},

Dodati ste na kurs '{course.name}'.

Profesor: {course.professor.first_name} {course.professor.last_name}
Opis: {course.description}

Prijavite se na platformu kako biste pristupili materijalu i zadacima.
                """
            )
        except Exception as e:
            print(f"Failed to send email to {student.email}: {e}")
        
        return jsonify(enrollment.to_dict()), 201

    except Exception as e:
        db.rollback()
        return jsonify({"error": "Failed to enroll student", "detail": str(e)}), 500
    finally:
        db.close()


@courses_bp.get("/<int:course_id>/students")
@session_required
@role_required("PROFESOR")
def list_course_students(course_id):
    """PROFESOR vidi studente na kursu"""
    db: Session = SessionLocal()
    try:
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            return jsonify({"error": "Course not found"}), 404
        
        professor_id = request.user.get("user_id")
        if course.professor_id != professor_id:
            return jsonify({"error": "You are not the owner of this course"}), 403
        
        enrollments = db.query(CourseEnrollment).filter(
            CourseEnrollment.course_id == course_id
        ).all()
        
        return jsonify([e.to_dict() for e in enrollments]), 200
    finally:
        db.close()


@courses_bp.get("/my-courses")
@session_required
@role_required("STUDENT")
def get_my_courses():
    """STUDENT vidi kurseve na koje je upisan"""
    db: Session = SessionLocal()
    try:
        student_id = request.user.get("user_id")
        enrollments = db.query(CourseEnrollment).filter(
            CourseEnrollment.student_id == student_id
        ).all()
        
        courses = [e.course.to_dict() for e in enrollments]
        return jsonify(courses), 200
    finally:
        db.close()


@courses_bp.get("/available-students")
@session_required
@role_required("PROFESOR")
def get_available_students():
    """PROFESOR vidi listu svih studenata (za dodavanje na kurs)"""
    db: Session = SessionLocal()
    try:
        students = db.query(User).filter(User.role == "STUDENT").all()
        
        return jsonify([
            {
                "id": s.id,
                "email": s.email,
                "firstName": s.first_name,
                "lastName": s.last_name,
                "role": s.role
            }
            for s in students
        ]), 200
    finally:
        db.close()

@courses_bp.get("/<int:course_id>/submissions")
@session_required
@role_required("PROFESOR")
def get_course_submissions(course_id):
    """PROFESOR vidi sva rešenja za sve zadatke u kursu"""
    db: Session = SessionLocal()
    try:
        from app.models import Task, TaskSubmission
        
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            return jsonify({"error": "Course not found"}), 404
        
        professor_id = request.user.get("user_id")
        if course.professor_id != professor_id:
            return jsonify({"error": "You are not the owner of this course"}), 403
        
        tasks = db.query(Task).filter(Task.course_id == course_id).all()
        task_ids = [t.id for t in tasks]
        
        submissions = db.query(TaskSubmission).filter(
            TaskSubmission.task_id.in_(task_ids)
        ).order_by(TaskSubmission.submitted_at.desc()).all()
        
        return jsonify([s.to_dict() for s in submissions]), 200
    finally:
        db.close()