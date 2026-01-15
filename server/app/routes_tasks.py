from flask import Blueprint, request, jsonify
from datetime import datetime

from .db import db
from .models import Course, Task, TaskSubmission, CourseEnrollment
from .auth import session_required, role_required
from .email_utils import send_email

tasks_bp = Blueprint("tasks_bp", __name__)

@tasks_bp.post("/")
@session_required
@role_required("PROFESOR")
def create_task():
    """PROFESOR kreira zadatak za svoj kurs"""
    data = request.get_json() or {}
    
    course_id = data.get("courseId")
    title = (data.get("title") or "").strip()
    description = (data.get("description") or "").strip()
    deadline = data.get("deadline")
    
    if not all([course_id, title, description, deadline]):
        return jsonify({"error": "courseId, title, description, and deadline are required"}), 400
    
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"error": "Course not found"}), 404
    
    professor_id = request.user.get("user_id")
    if course.professor_id != professor_id:
        return jsonify({"error": "You are not the owner of this course"}), 403
    
    try:
        deadline_dt = datetime.fromisoformat(deadline)
    except ValueError:
        return jsonify({"error": "Invalid deadline format"}), 400
    
    task = Task(
        course_id=course_id,
        title=title,
        description=description,
        deadline=deadline_dt
    )
    
    db.session.add(task)
    db.session.commit()
    
    enrollments = CourseEnrollment.query.filter_by(course_id=course_id).all()
    for enrollment in enrollments:
        student = enrollment.student
        send_email(
            to=student.email,
            subject=f"Novi zadatak u kursu {course.name}",
            body=f"Dodat je novi zadatak '{title}' u kursu '{course.name}'.\nKrajnji rok: {deadline_dt.strftime('%Y-%m-%d %H:%M')}"
        )
    
    return jsonify(task.to_dict()), 201


@tasks_bp.get("/course/<int:course_id>")
@session_required
def list_course_tasks(course_id):
    """Svi korisnici mogu da vide zadatke kursa"""
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"error": "Course not found"}), 404
    
    tasks = Task.query.filter_by(course_id=course_id).all()
    return jsonify([t.to_dict() for t in tasks]), 200


@tasks_bp.post("/<int:task_id>/submit")
@session_required
@role_required("STUDENT")
def submit_task(task_id):
    """STUDENT predaje rešenje zadatka"""
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404
    
    student_id = request.user.get("user_id")
    
    enrollment = CourseEnrollment.query.filter_by(
        course_id=task.course_id,
        student_id=student_id
    ).first()
    
    if not enrollment:
        return jsonify({"error": "You are not enrolled in this course"}), 403
    
    data = request.get_json() or {}
    file_path = data.get("filePath")
    
    if not file_path:
        return jsonify({"error": "filePath is required"}), 400
    
    existing = TaskSubmission.query.filter_by(
        task_id=task_id,
        student_id=student_id
    ).first()
    
    if existing:
        existing.file_path = file_path
        existing.submitted_at = datetime.utcnow()
        db.session.commit()
        return jsonify(existing.to_dict()), 200
    
    submission = TaskSubmission(
        task_id=task_id,
        student_id=student_id,
        file_path=file_path
    )
    
    db.session.add(submission)
    db.session.commit()
    
    return jsonify(submission.to_dict()), 201


@tasks_bp.get("/<int:task_id>/submissions")
@session_required
@role_required("PROFESOR")
def list_task_submissions(task_id):
    """PROFESOR vidi sva rešenja za zadatak"""
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404
    
    professor_id = request.user.get("user_id")
    if task.course.professor_id != professor_id:
        return jsonify({"error": "You are not the owner of this course"}), 403
    
    submissions = TaskSubmission.query.filter_by(task_id=task_id).all()
    return jsonify([s.to_dict() for s in submissions]), 200


@tasks_bp.post("/submissions/<int:submission_id>/grade")
@session_required
@role_required("PROFESOR")
def grade_submission(submission_id):
    """PROFESOR ocenjuje rešenje studenta"""
    submission = TaskSubmission.query.get(submission_id)
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
    
    db.session.commit()
    
    student = submission.student
    send_email(
        to=student.email,
        subject=f"Ocena za zadatak '{submission.task.title}'",
        body=f"Vaše rešenje za zadatak '{submission.task.title}' je ocenjeno ocenom {grade}.\nKomentar: {comment}"
    )
    
    return jsonify(submission.to_dict()), 200


@tasks_bp.get("/my-submissions")
@session_required
@role_required("STUDENT")
def get_my_submissions():
    """STUDENT vidi svoja rešenja"""
    student_id = request.user.get("user_id")
    submissions = TaskSubmission.query.filter_by(student_id=student_id).all()
    return jsonify([s.to_dict() for s in submissions]), 200