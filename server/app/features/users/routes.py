from flask import Blueprint, request, jsonify
from datetime import datetime
from ..shared.database.mongodb import MongoDB
from .models import UserModel
from ..shared.utils.password_utils import hash_password

user_bp = Blueprint("users", __name__)
db = MongoDB.get_db()
user_model = UserModel(db)

@user_bp.route("/register", methods=["POST"])
def register_user():
    """
    Registracija novog korisnika.
    """
    data = request.get_json()
    
    required_fields = ['first_name', 'last_name', 'email', 'password', 
                      'date_of_birth', 'gender', 'country', 'street', 'street_number']
    
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    email = data['email']
    if '@' not in email or '.' not in email.split('@')[-1]:
        return jsonify({"error": "Invalid email address"}), 400
    
    if len(data['password']) < 6:
        return jsonify({"error": "Password must be at least 6 characters long"}), 400
    
    try:
        date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d')
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
    
    if date_of_birth > datetime.now():
        return jsonify({"error": "Date of birth must be in the past"}), 400
    
    if user_model.find_by_email(email):
        return jsonify({"error": "User with this email already exists"}), 409
    
    user_data = {
        'first_name': data['first_name'],
        'last_name': data['last_name'],
        'email': email,
        'password': hash_password(data['password']),
        'date_of_birth': date_of_birth,
        'gender': data['gender'],
        'country': data['country'],
        'street': data['street'],
        'street_number': data['street_number']
    }
    
    user_id = user_model.create_user(user_data)
    
    return jsonify({
        "message": "User registered successfully",
        "user_id": user_id
    }), 201