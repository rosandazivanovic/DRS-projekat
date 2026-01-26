"""
Reports route - Demonstracija upotrebe multiprocessing-a za generisanje izveštaja
"""

from flask import Blueprint, request, jsonify
from sqlalchemy.orm import Session

from app.models import Course, User, Task, TaskSubmission, CourseEnrollment
from app.auth import session_required, role_required
from app.database import SessionLocal
from app.process_handler import process_manager

reports_bp = Blueprint("reports", __name__, url_prefix="/api/reports")


@reports_bp.post("/generate")
@session_required
@role_required("ADMIN", "PROFESOR")
def generate_report():
    db: Session = SessionLocal()
    try:
        data = request.get_json() or {}
        report_type = data.get("type", "courses")
        report_format = data.get("format", "json")
        
        if report_type not in ["courses", "users", "submissions"]:
            return jsonify({"error": "Invalid report type"}), 400
        
        report_data = {}
        
        if report_type == "courses":
            courses = db.query(Course).all()
            report_data = {
                "total": len(courses),
                "courses": [
                    {
                        "id": c.id,
                        "name": c.name,
                        "professor": c.professor.email,
                        "enrollments": len(c.enrollments),
                        "tasks": len(c.tasks)
                    }
                    for c in courses
                ]
            }
        
        elif report_type == "users":
            users = db.query(User).all()
            report_data = {
                "total": len(users),
                "by_role": {
                    "ADMIN": len([u for u in users if u.role == "ADMIN"]),
                    "PROFESOR": len([u for u in users if u.role == "PROFESOR"]),
                    "STUDENT": len([u for u in users if u.role == "STUDENT"])
                },
                "users": [
                    {
                        "id": u.id,
                        "email": u.email,
                        "role": u.role,
                        "name": f"{u.first_name} {u.last_name}"
                    }
                    for u in users
                ]
            }
        
        elif report_type == "submissions":
            submissions = db.query(TaskSubmission).all()
            report_data = {
                "total": len(submissions),
                "graded": len([s for s in submissions if s.grade is not None]),
                "pending": len([s for s in submissions if s.grade is None]),
                "avg_grade": sum([s.grade for s in submissions if s.grade]) / max(len([s for s in submissions if s.grade]), 1),
                "submissions": [
                    {
                        "id": s.id,
                        "task": s.task.title,
                        "student": s.student.email,
                        "grade": s.grade,
                        "submitted_at": s.submitted_at.isoformat()
                    }
                    for s in submissions[:50]  
                ]
            }
        
        process = process_manager.generate_report(
            report_type=report_type,
            data={
                "format": report_format,
                "content": report_data,
                "requested_by": request.user.get("user_id")
            }
        )
        
        return jsonify({
            "message": "Report generation started",
            "process_id": process.pid,
            "report_type": report_type,
            "status": "processing"
        }), 202
        
    finally:
        db.close()


@reports_bp.get("/status")
@session_required
@role_required("ADMIN", "PROFESOR")
def get_report_status():
    active_count = process_manager.get_active_count()
    results = process_manager.get_results()
    
    return jsonify({
        "active_processes": active_count,
        "completed_reports": len(results),
        "results": results
    }), 200


@reports_bp.post("/email/bulk")
@session_required
@role_required("ADMIN", "PROFESOR")
def send_bulk_emails():

    db: Session = SessionLocal()
    try:
        data = request.get_json() or {}
        
        recipient_type = data.get("recipient_type", "all_students")
        subject = data.get("subject", "Obaveštenje sa platforme")
        body = data.get("body", "")
        
        if not body:
            return jsonify({"error": "Email body is required"}), 400
        
        recipients = []
        
        if recipient_type == "all_students":
            students = db.query(User).filter(User.role == "STUDENT").all()
            recipients = [{"to": s.email, "subject": subject, "body": body} for s in students]
        
        elif recipient_type == "all_professors":
            professors = db.query(User).filter(User.role == "PROFESOR").all()
            recipients = [{"to": p.email, "subject": subject, "body": body} for p in professors]
        
        elif recipient_type == "course_students":
            course_id = data.get("course_id")
            if not course_id:
                return jsonify({"error": "course_id required for course_students"}), 400
            
            enrollments = db.query(CourseEnrollment).filter(
                CourseEnrollment.course_id == course_id
            ).all()
            recipients = [
                {"to": e.student.email, "subject": subject, "body": body}
                for e in enrollments
            ]
        
        if not recipients:
            return jsonify({"error": "No recipients found"}), 400

        process = process_manager.send_bulk_emails(recipients)
        
        return jsonify({
            "message": "Bulk email sending started",
            "process_id": process.pid,
            "recipient_count": len(recipients),
            "status": "processing"
        }), 202
        
    finally:
        db.close()


@reports_bp.post("/cleanup")
@session_required
@role_required("ADMIN")
def cleanup_old_data():

    data = request.get_json() or {}
    days = data.get("days", 90)
    
    # U realnoj implementaciji bi se pokrenuo proces koji briše stare podatke
    # Za sada samo vraćamo poruku
    
    return jsonify({
        "message": f"Cleanup process would remove data older than {days} days",
        "status": "not_implemented"
    }), 200