import os
import uuid
import json
from functools import wraps

from flask import Blueprint, request, jsonify
from passlib.hash import pbkdf2_sha256

from .models import User
from .redis_client import get_redis
from .db import db

auth_bp = Blueprint("auth_bp", __name__)

SESSION_EXP_SECONDS = int(os.environ.get("SESSION_EXP_SECONDS", "3600"))


def get_user_by_email(email: str):
    email = (email or "").strip().lower()
    u = User.query.filter_by(email=email).first()
    if not u:
        return None

    return {
        "id": u.id,
        "email": u.email,
        "role": u.role,
        "first_name": u.first_name,
        "last_name": u.last_name,
        "password_hash": u.password_hash,
    }


def create_session(user):
    session_id = str(uuid.uuid4())
    session_data = {
        "user_id": user["id"],
        "email": user["email"],
        "role": user["role"],
    }

    redis = get_redis()
    redis.setex(f"session:{session_id}", SESSION_EXP_SECONDS, json.dumps(session_data))
    return session_id


def get_session(session_id: str):
    redis = get_redis()
    data = redis.get(f"session:{session_id}")
    if not data:
        return None
    return json.loads(data)


def delete_session(session_id: str):
    redis = get_redis()
    redis.delete(f"session:{session_id}")


def session_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        session_id = request.headers.get("X-Session-ID", "").strip()
        if not session_id:
            return jsonify({"error": "Missing session ID"}), 401

        session_data = get_session(session_id)
        if not session_data:
            return jsonify({"error": "Invalid or expired session"}), 401

        request.user = session_data
        return fn(*args, **kwargs)
    return wrapper


def role_required(*roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user = getattr(request, "user", None)
            if not user:
                return jsonify({"error": "Unauthorized"}), 401
            if user.get("role") not in roles:
                return jsonify({"error": "Forbidden"}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400

    user = get_user_by_email(email)
    if (not user) or (not pbkdf2_sha256.verify(password, user["password_hash"])):
        return jsonify({"error": "invalid credentials"}), 401

    session_id = create_session(user)
    return jsonify({
        "sessionId": session_id,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "role": user["role"],
            "firstName": user["first_name"],
            "lastName": user["last_name"],
        }
    }), 200


@auth_bp.get("/me")
@session_required
def me():
    u = request.user
    return jsonify({
        "id": u.get("user_id"),
        "email": u.get("email"),
        "role": u.get("role"),
    }), 200


@auth_bp.post("/logout")
@session_required
def logout():
    session_id = request.headers.get("X-Session-ID", "").strip()
    delete_session(session_id)
    return jsonify({"message": "Logged out"}), 200


@auth_bp.post("/register")
def register():
    """
    Public registration endpoint:
    Accepts minimal payload: firstName, lastName, email, password
    Optional: birthDate, gender, country, street, number, role
    Returns: { user, sessionId } on success
    """
    try:
        data = request.get_json(silent=True) or {}
        required = ["firstName", "lastName", "email", "password"]
        missing = [f for f in required if not data.get(f)]
        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

        email = (data["email"] or "").strip().lower()

        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email already exists"}), 409

        password_hash = pbkdf2_sha256.hash(str(data["password"]))

        user = User(
            first_name=data["firstName"].strip(),
            last_name=data["lastName"].strip(),
            email=email,
            birth_date=str(data.get("birthDate") or ""),
            gender=str(data.get("gender") or ""),
            country=str(data.get("country") or ""),
            street=str(data.get("street") or ""),
            number=str(data.get("number") or ""),
            role=(data.get("role") or "STUDENT").upper(),
            password_hash=password_hash
        )

        db.session.add(user)
        db.session.commit()

        user_dto = user.to_dict()
        session_id = create_session({"id": user.id, "email": user.email, "role": user.role})

        return jsonify({"user": user_dto, "sessionId": session_id}), 201

    except Exception as e:
        return jsonify({"error": "Internal server error", "detail": str(e)}), 500
