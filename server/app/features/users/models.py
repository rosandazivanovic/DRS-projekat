from datetime import datetime,timezone
from bson import ObjectId

class UserModel:
    def __init__(self,db):
        self.collection = db.get_collection("users")

    def create_user(self,user_data: dict):
        user_data["created_at"] = datetime.utcnow()
        user_data["updated_at"] = datetime.utcnow()
        user_data["role"] = "reader"
        user_data["failed_login_attempts"] = 0
        user_data["is_blocked"] = False
        user_data["blocked_until"] = None
        user_data["favourite_recipes"] = []
        user_data["recent_recipes"] = []
        user_data["total_recipes"] = 0
        user_data["average_rating"] = 0.0

        result = self.collection.insert_one(user_data)
        return str(result.inserted_id)
    
    def find_by_email(self, email: str):
        return self.collection.find_one({"email": email})

    def find_by_id(self, user_id: str):
        return self.collection.find_one({"_id": ObjectId(user_id)})

    def update_user(self, user_id: str, update_data: dict):
        update_data["updated_at"] = datetime.now()
        self.collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )

    def delete_user(self, user_id: str):
        self.collection.delete_one({"_id": ObjectId(user_id)})