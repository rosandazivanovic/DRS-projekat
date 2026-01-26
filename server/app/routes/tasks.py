from flask import Blueprint, request, jsonify
from sqlalchemy.orm import Session
from datetime import datetime

from app.models import Course, Task, TaskSubmission, CourseEnrollment, User
from app.auth import session_required, role_required
from app.email_utils import send_email
from app.database import SessionLocal

tasks_bp = Blueprint("tasks", __name__, url_prefix="/api/tasks")


@tasks_bp.post("/")
@session_required
@role_required("PROFESOR")
def create_task():
    db: Session = SessionLocal()
    try:
        data = request.get_json() or {}
        
        course_id = data.get("courseId")
        title = (data.get("title") or "").strip()
        description = (data.get("description") or "").strip()
        deadline = data.get("deadline")
        
        if not all([course_id, title, description, deadline]):
            return jsonify({
                "error": "courseId, title, description, and deadline are required"
            }), 400
        
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            return jsonify({"error": "Course not found"}), 404
        
        professor_id = request.user.get("user_id")
        if course.professor_id != professor_id:
            return jsonify({"error": "You are not the owner of this course"}), 403
        
        try:
            deadline_dt = datetime.fromisoformat(deadline.replace('Z', '+00:00'))
        except ValueError:
            return jsonify({"error": "Invalid deadline format"}), 400
        
        task = Task(
            course_id=course_id,
            title=title,
            description=description,
            deadline=deadline_dt
        )
        
        db.add(task)
        db.commit()
        db.refresh(task)
        
        enrollments = db.query(CourseEnrollment).filter(
            CourseEnrollment.course_id == course_id
        ).all()
        
        for enrollment in enrollments:
            student = enrollment.student
            try:
                send_email(
                    to=student.email,
                    subject=f"Novi zadatak u kursu {course.name}",
                    body=f"""
Dodat je novi zadatak u kursu '{course.name}'.

Zadatak: {title}
Opis: {description}
Krajnji rok: {deadline_dt.strftime('%d.%m.%Y %H:%M')}

Prijavite se na platformu kako biste predali rešenje.
                    """
                )
            except Exception as e:
                print(f"Failed to send email to {student.email}: {e}")
        
        return jsonify(task.to_dict()), 201

    except Exception as e:
        db.rollback()
        return jsonify({"error": "Failed to create task", "detail": str(e)}), 500
    finally:
        db.close()


@tasks_bp.get("/course/<int:course_id>")
@session_required
def list_course_tasks(course_id):
    """Svi korisnici mogu da vide zadatke kursa"""
    db: Session = SessionLocal()
    try:
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            return jsonify({"error": "Course not found"}), 404
        
        tasks = db.query(Task).filter(
            Task.course_id == course_id
        ).order_by(Task.deadline.desc()).all()
        
        return jsonify([t.to_dict() for t in tasks]), 200
    finally:
        db.close()


@tasks_bp.post("/<int:task_id>/submit")
@session_required
@role_required("STUDENT")
def submit_task(task_id):
    db: Session = SessionLocal()
    try:
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            return jsonify({"error": "Task not found"}), 404
        
        student_id = request.user.get("user_id")
        
        enrollment = db.query(CourseEnrollment).filter(
            CourseEnrollment.course_id == task.course_id,
            CourseEnrollment.student_id == student_id
        ).first()
        
        if not enrollment:
            return jsonify({"error": "You are not enrolled in this course"}), 403
        
        data = request.get_json() or {}
        file_path = data.get("filePath")  
        file_name = data.get("fileName", "solution.py")
        
        if not file_path:
            return jsonify({"error": "filePath is required"}), 400
        
        if not file_name.lower().endswith('.py'):
            return jsonify({"error": "File must be a Python file (.py)"}), 400
        
        if not file_path.startswith('data:'):
            return jsonify({"error": "Invalid file format - expected Base64 data URL"}), 400
        
        existing = db.query(TaskSubmission).filter(
            TaskSubmission.task_id == task_id,
            TaskSubmission.student_id == student_id
        ).first()
        
        if existing:
            existing.file_path = file_path
            existing.submitted_at = datetime.utcnow()
            existing.grade = None
            existing.comment = None
            existing.graded_at = None
            db.commit()
            db.refresh(existing)
            
            return jsonify({
                **existing.to_dict(),
                "message": "Rešenje ažurirano (ponovna predaja)"
            }), 200
        submission = TaskSubmission(
            task_id=task_id,
            student_id=student_id,
            file_path=file_path  
        )
        
        db.add(submission)
        db.commit()
        db.refresh(submission)
        
        professor = task.course.professor
        try:
            send_email(
                to=professor.email,
                subject=f"Novo rešenje za zadatak '{task.title}'",
                body=f"""
Student {request.user.get('email')} je predao rešenje za zadatak '{task.title}'.

Kurs: {task.course.name}
Student: {request.user.get('email')}
Fajl: {file_name}
Vreme predaje: {datetime.utcnow().strftime('%d.%m.%Y %H:%M')}

Prijavite se na platformu da ocenite rešenje.
                """
            )
        except Exception as e:
            print(f"Failed to send email to professor: {e}")
        
        return jsonify({
            **submission.to_dict(),
            "message": "Zadatak uspešno predat!"
        }), 201

    except Exception as e:
        db.rollback()
        print(f"❌ Submit error: {e}")
        return jsonify({"error": "Failed to submit task", "detail": str(e)}), 500
    finally:
        db.close()


@tasks_bp.get("/<int:task_id>/submissions")
@session_required
@role_required("PROFESOR")
def list_task_submissions(task_id):
    db: Session = SessionLocal()
    try:
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            return jsonify({"error": "Task not found"}), 404
        
        professor_id = request.user.get("user_id")
        if task.course.professor_id != professor_id:
            return jsonify({"error": "You are not the owner of this course"}), 403
        
        submissions = db.query(TaskSubmission).filter(
            TaskSubmission.task_id == task_id
        ).order_by(TaskSubmission.submitted_at.desc()).all()
        
        return jsonify([s.to_dict() for s in submissions]), 200
    finally:
        db.close()


@tasks_bp.post("/submissions/<int:submission_id>/grade")
@session_required
@role_required("PROFESOR")
def grade_submission(submission_id):
    db: Session = SessionLocal()
    try:
        submission = db.query(TaskSubmission).filter(
            TaskSubmission.id == submission_id
        ).first()
        
        if not submission:
            return jsonify({"error": "Submission not found"}), 404
        
        professor_id = request.user.get("user_id")
        if submission.task.course.professor_id != professor_id:
            return jsonify({"error": "You are not the owner of this course"}), 403
        
        data = request.get_json() or {}
        grade = data.get("grade")
        comment = (data.get("comment") or "").strip()
        
        if grade is None:
            return jsonify({"error": "grade is required"}), 400
        
        try:
            grade = int(grade)
            if grade < 1 or grade > 5:
                raise ValueError
        except (ValueError, TypeError):
            return jsonify({"error": "grade must be an integer between 1 and 5"}), 400
        
        submission.grade = grade
        submission.comment = comment
        submission.graded_at = datetime.utcnow()
        
        db.commit()
        db.refresh(submission)
        
        # Slanje email-a studentu
        student = submission.student
        try:
            send_email(
                to=student.email,
                subject=f"Ocena za zadatak '{submission.task.title}'",
                body=f"""
Vaše rešenje za zadatak '{submission.task.title}' je ocenjeno.

Ocena: {grade}/5
Komentar profesora: {comment if comment else 'Bez komentara'}

Kurs: {submission.task.course.name}
                """
            )
        except Exception as e:
            print(f"Failed to send email to {student.email}: {e}")
        
        return jsonify(submission.to_dict()), 200

    except Exception as e:
        db.rollback()
        return jsonify({"error": "Failed to grade submission", "detail": str(e)}), 500
    finally:
        db.close()


@tasks_bp.get("/my-submissions")
@session_required
@role_required("STUDENT")
def get_my_submissions():
    db: Session = SessionLocal()
    try:
        student_id = request.user.get("user_id")
        submissions = db.query(TaskSubmission).filter(
            TaskSubmission.student_id == student_id
        ).order_by(TaskSubmission.submitted_at.desc()).all()
        
        return jsonify([s.to_dict() for s in submissions]), 200
    finally:
        db.close()

@tasks_bp.get("/<int:task_id>/submissions/<int:submission_id>/download")
@session_required
@role_required("PROFESOR")
def download_submission(task_id, submission_id):
    db: Session = SessionLocal()
    try:
        submission = db.query(TaskSubmission).filter(
            TaskSubmission.id == submission_id,
            TaskSubmission.task_id == task_id
        ).first()
        
        if not submission:
            return jsonify({"error": "Submission not found"}), 404
        
        professor_id = request.user.get("user_id")
        if submission.task.course.professor_id != professor_id:
            return jsonify({"error": "You are not the owner of this course"}), 403
        
        return jsonify({
            "fileData": submission.file_path,
            "fileName": f"{submission.student.first_name}_{submission.student.last_name}_{submission.task.title.replace(' ', '_')}.py",
            "studentName": f"{submission.student.first_name} {submission.student.last_name}",
            "taskTitle": submission.task.title,
            "submittedAt": submission.submitted_at.isoformat()
        }), 200
        
    finally:
        db.close()