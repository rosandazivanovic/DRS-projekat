from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from app.config import Config


class MongoDB:
    _client = None
    _db = None

    @classmethod
    def connect(cls):
        if cls._client is None:
            try:
                cls._client = MongoClient(Config.MONGO_URI)
                cls._db = cls._client[Config.MONGO_DB]
                print("MongoDB connected successfully")
            except ConnectionFailure as e:
                print(f"MongoDB connection failed: {e}")
                raise

    @classmethod
    def get_db(cls):
        if cls._db is None:
            cls.connect()
        return cls._db
    
    @classmethod
    def close(cls):
        if cls._client:
            cls._client.close()
            cls._client = None
            cls._db = None
            print("MongoDB connection closed.")