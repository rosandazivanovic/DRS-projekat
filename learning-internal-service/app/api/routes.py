from flask import Blueprint, request, jsonify, abort
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.models import CourseRequest, Course, ApprovalStatus

bp = Blueprint("learning_internal", __name__, url_prefix="/internal")


def course_request_to_dto(cr: CourseRequest):
    return {
        "id": cr.id,
        "professor_id": cr.professor_id,
        "name": cr.name,
        "description": cr.description,
        "status": cr.approval_status.value,
        "rejection_reason": cr.rejection_reason,
        "created_at": cr.created_at.isoformat(),
    }


@bp.post("/course-requests")
def create_course_request():
    """Poziva GLAVNI SERVER (ne klijent)"""
    db: Session = request.environ["db"]

    data = request.get_json(force=True)
    required = ["professor_id", "name", "description"]

    for k in required:
        if k not in data:
            abort(400, f"Missing field {k}")

    cr = CourseRequest(
        professor_id=int(data["professor_id"]),
        name=data["name"],
        description=data["description"],
        approval_status=ApprovalStatus.PENDING,
    )

    db.add(cr)
    db.commit()
    db.refresh(cr)

    return jsonify(course_request_to_dto(cr)), 201


@bp.post("/course-requests/<int:req_id>/approve")
def approve_course_request(req_id: int):
    db: Session = request.environ["db"]

    cr = db.get(CourseRequest, req_id)
    if not cr:
        abort(404)

    if cr.approval_status != ApprovalStatus.PENDING:
        abort(409, "Request is not pending")

    course = Course(
        professor_id=cr.professor_id,
        name=cr.name,
        description=cr.description,
    )
    db.add(course)

    cr.approval_status = ApprovalStatus.APPROVED
    cr.rejection_reason = None

    db.commit()
    db.refresh(cr)

    return jsonify(course_request_to_dto(cr)), 200


@bp.post("/course-requests/<int:req_id>/reject")
def reject_course_request(req_id: int):
    db: Session = request.environ["db"]

    cr = db.get(CourseRequest, req_id)
    if not cr:
        abort(404)

    data = request.get_json(force=True)
    reason = (data.get("reason") or "").strip()
    if not reason:
        abort(400, "Rejection reason is required")

    if cr.approval_status != ApprovalStatus.PENDING:
        abort(409, "Request is not pending")

    cr.approval_status = ApprovalStatus.REJECTED
    cr.rejection_reason = reason

    db.commit()
    db.refresh(cr)

    return jsonify(course_request_to_dto(cr)), 200
