from flask import Blueprint, request, jsonify

from .db import db
from .models import User
from .auth import session_required

users_bp = Blueprint("users_bp", __name__)


@users_bp.get("/profile")
@session_required
def get_profile():
    """Korisnik pregleda svoj profil"""
    user_id = request.user.get("user_id")
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify(user.to_dict()), 200


@users_bp.patch("/profile")
@session_required
def update_profile():
    """Korisnik (STUDENT/PROFESOR) ažurira svoj profil"""
    user_id = request.user.get("user_id")
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json() or {}

    if "firstName" in data:
        user.first_name = data["firstName"].strip()
    if "lastName" in data:
        user.last_name = data["lastName"].strip()
    if "birthDate" in data:
        user.birth_date = str(data["birthDate"]).strip()
    if "gender" in data:
        user.gender = str(data["gender"]).strip()
    if "country" in data:
        user.country = data["country"].strip()
    if "street" in data:
        user.street = data["street"].strip()
    if "number" in data:
        user.number = str(data["number"]).strip()

    db.session.commit()
    return jsonify(user.to_dict()), 200


@users_bp.post("/profile/image")
@session_required
def upload_profile_image():
    """Upload slike profila"""
    user_id = request.user.get("user_id")
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json() or {}
    image_path = data.get("imagePath")
    
    if not image_path:
        return jsonify({"error": "imagePath is required"}), 400

    user.profile_image = image_path
    db.session.commit()
    
    return jsonify(user.to_dict()), 200