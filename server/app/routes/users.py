from flask import Blueprint, request, jsonify
from sqlalchemy.orm import Session

from app.models import User
from app.auth import session_required
from app.database import SessionLocal

users_bp = Blueprint("users", __name__, url_prefix="/api/users")


@users_bp.get("/profile")
@session_required
def get_profile():
    db: Session = SessionLocal()
    try:
        user_id = request.user.get("user_id")
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify(user.to_dict()), 200
    finally:
        db.close()


@users_bp.patch("/profile")
@session_required
def update_profile():
    db: Session = SessionLocal()
    try:
        user_id = request.user.get("user_id")
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        if user.role == "ADMIN":
            return jsonify({"error": "Admins cannot edit their profile"}), 403

        data = request.get_json() or {}

        if "firstName" in data:
            user.first_name = data["firstName"].strip()
        if "lastName" in data:
            user.last_name = data["lastName"].strip()
        
        if "email" in data:
            new_email = data["email"].strip().lower()
            
            existing = db.query(User).filter(
                User.email == new_email,
                User.id != user_id
            ).first()
            
            if existing:
                return jsonify({"error": "Email already exists"}), 409
            
            user.email = new_email
        
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

        db.commit()
        db.refresh(user)
        
        return jsonify(user.to_dict()), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": "Failed to update profile", "detail": str(e)}), 500
    finally:
        db.close()


@users_bp.post("/profile/image")
@session_required
def upload_profile_image():
    """Upload slike profila"""
    print("\n" + "="*60)
    print("📸 UPLOAD PROFILE IMAGE REQUEST")
    print("="*60)
    
    db: Session = SessionLocal()
    try:
        user_id = request.user.get("user_id")
        print(f"👤 User ID: {user_id}")
        
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            print(f"❌ User not found: {user_id}")
            return jsonify({"error": "User not found"}), 404
        
        print(f"✅ User found: {user.email} (role: {user.role})")
        
        if user.role == "ADMIN":
            print("❌ Admin cannot upload images")
            return jsonify({"error": "Admins cannot upload profile images"}), 403

        data = request.get_json() or {}
        print(f"📦 Request data keys: {list(data.keys())}")
        
        image_path = data.get("imagePath")
        
        if image_path is None:
            print("❌ No imagePath in request")
            return jsonify({"error": "imagePath is required"}), 400
        
        print(f"📊 Image data received:")
        print(f"   - Type: {type(image_path)}")
        print(f"   - Length: {len(image_path) if image_path else 0}")
        print(f"   - Preview: {image_path[:100] if image_path else 'EMPTY'}...")
        
        if image_path == "":
            print("🗑️ Removing profile image")
            user.profile_image = None
        else:
            print("💾 Saving profile image")
            user.profile_image = image_path

        print("💿 Committing to database...")
        db.commit()
        db.refresh(user)
        
        print("✅ Database updated successfully")
        print(f"🖼️ User profile_image now: {user.profile_image[:100] if user.profile_image else 'NULL'}...")
        
        response_data = user.to_dict()
        print(f"📤 Response data keys: {list(response_data.keys())}")
        print(f"📤 Response profileImage length: {len(response_data.get('profileImage', ''))}")
        
        print("="*60)
        return jsonify(response_data), 200
        
    except Exception as e:
        db.rollback()
        print(f"❌ Exception: {type(e).__name__}")
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Failed to upload image", "detail": str(e)}), 500
    finally:
        db.close()