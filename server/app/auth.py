import os
import uuid
import json
from functools import wraps
from typing import Optional, Dict

from flask import Blueprint, request, jsonify
from passlib.hash import pbkdf2_sha256
from sqlalchemy.orm import Session

from app.models import User
from app.redis_client import get_redis
from app.database import SessionLocal

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

SESSION_EXP_SECONDS = int(os.environ.get("SESSION_EXP_SECONDS", "3600"))


def create_session(user_dict: Dict) -> str:
    session_id = str(uuid.uuid4())
    session_data = {
        "user_id": user_dict["id"],
        "email": user_dict["email"],
        "role": user_dict["role"],
    }

    redis = get_redis()
    redis.setex(
        f"session:{session_id}",
        SESSION_EXP_SECONDS,
        json.dumps(session_data),
    )
    return session_id


def get_session(session_id: str) -> Optional[Dict]:
    redis = get_redis()
    data = redis.get(f"session:{session_id}")
    if not data:
        return None
    return json.loads(data)


def delete_session(session_id: str) -> None:
    redis = get_redis()
    redis.delete(f"session:{session_id}")


def session_required(fn):

    @wraps(fn)
    def wrapper(*args, **kwargs):
        # ✅ NE PROVJERAVAJ na OPTIONS requestima
        if request.method == "OPTIONS":
            return fn(*args, **kwargs)
           
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
            if request.method == "OPTIONS":
                return fn(*args, **kwargs)
               
            user = getattr(request, "user", None)
            if not user:
                return jsonify({"error": "Unauthorized"}), 401
            if user.get("role") not in roles:
                return jsonify(
                    {"error": "Forbidden - insufficient permissions"}
                ), 403
            return fn(*args, **kwargs)

        return wrapper

    return decorator


@auth_bp.route("/register", methods=["POST"])
def register():
    """Javna registracija"""
    db: Session = SessionLocal()
    try:
        data = request.get_json(silent=True) or {}

        required = ["firstName", "lastName", "email", "password"]
        missing = [f for f in required if not data.get(f)]
        if missing:
            return jsonify(
                {"error": f"Missing fields: {', '.join(missing)}"}
            ), 400

        email = (data["email"] or "").strip().lower()
        if not email or "@" not in email:
            return jsonify({"error": "Invalid email format"}), 400

        existing = db.query(User).filter(User.email == email).first()
        if existing:
            return jsonify({"error": "Email already exists"}), 409

        password = str(data["password"])
        if len(password) < 6:
            return jsonify(
                {"error": "Password must be at least 6 characters"}
            ), 400

        password_hash = pbkdf2_sha256.hash(password)

        user = User(
            first_name=data["firstName"].strip(),
            last_name=data["lastName"].strip(),
            email=email,
            birth_date=str(data.get("birthDate") or ""),
            gender=str(data.get("gender") or ""),
            country=str(data.get("country") or ""),
            street=str(data.get("street") or ""),
            number=str(data.get("number") or ""),
            role="STUDENT",
            password_hash=password_hash,
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        session_id = create_session(
            {
                "id": user.id,
                "email": user.email,
                "role": user.role,
            }
        )

        return jsonify(
            {
                "user": user.to_dict(),
                "sessionId": session_id,
            }
        ), 201

    except Exception as e:
        db.rollback()
        print(f"❌ Registration error: {e}")
        return jsonify(
            {"error": "Internal server error", "detail": str(e)}
        ), 500
    finally:
        db.close()


@auth_bp.route("/login", methods=["POST"])
def login():
    db: Session = SessionLocal()
    try:
        data = request.get_json(silent=True) or {}
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""

        print(f"🔐 Login attempt for: {email}")

        if not email or not password:
            return jsonify(
                {"error": "Email and password are required"}
            ), 400

        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"❌ User not found: {email}")
            return jsonify({"error": "Invalid credentials"}), 401
           
        if not pbkdf2_sha256.verify(password, user.password_hash):
            print(f"❌ Invalid password for: {email}")
            return jsonify({"error": "Invalid credentials"}), 401

        session_id = create_session(
            {
                "id": user.id,
                "email": user.email,
                "role": user.role,
            }
        )

        print(f"✅ Login successful for {email}, session: {session_id}")

        return jsonify(
            {
                "sessionId": session_id,
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "role": user.role,
                    "firstName": user.first_name,
                    "lastName": user.last_name,
                },
            }
        ), 200

    except Exception as e:
        print(f"❌ Login error: {e}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        db.close()


@auth_bp.route("/me", methods=["GET"])
@session_required
def me():
    db: Session = SessionLocal()
    try:
        user_id = request.user.get("user_id")
        user = db.query(User).filter(User.id == user_id).first()
       
        if not user:
            return jsonify({"error": "User not found"}), 404
           
        return jsonify(user.to_dict()), 200
    finally:
        db.close()


@auth_bp.route("/logout", methods=["POST"])
@session_required
def logout():
    session_id = request.headers.get("X-Session-ID", "").strip()
    delete_session(session_id)
    return jsonify({"message": "Logged out successfully"}), 200