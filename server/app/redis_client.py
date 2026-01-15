import os
import redis

redis_client = None

def init_redis():
    global redis_client
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    redis_client = redis.from_url(redis_url, decode_responses=True)

def get_redis():
    return redis_client