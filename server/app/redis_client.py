import os
import redis

redis_client = None


def init_redis():
    global redis_client
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    redis_client = redis.from_url(redis_url, decode_responses=True)
    
    # Test konekcije
    try:
        redis_client.ping()
        print("✅ Redis connected successfully")
    except Exception as e:
        print(f"❌ Redis connection failed: {e}")
        raise


def get_redis():
    if redis_client is None:
        raise RuntimeError("Redis client not initialized. Call init_redis() first.")
    return redis_client