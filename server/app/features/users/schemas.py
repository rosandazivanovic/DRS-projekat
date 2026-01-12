from pydantic import BaseModel, validator
from datetime import datetime  # Promenjeno iz date u datetime
from typing import Optional
import re

class UserCreateSchema(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
    date_of_birth: datetime  
    gender: str
    country: str
    street: str
    street_number: str

    @validator('email')
    def email_valid(cls, v):
        if '@' not in v or '.' not in v.split('@')[-1]:
            raise ValueError('Invalid email address')
        return v

    @validator('password')
    def password_length(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        return v

    @validator('date_of_birth')
    def date_of_birth_valid(cls, v):
        # Provera da li je datum u prošlosti
        if v > datetime.now():
            raise ValueError('Date of birth must be in the past')
        return v

class UserUpdateSchema(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    gender: Optional[str] = None
    country: Optional[str] = None
    street: Optional[str] = None
    street_number: Optional[str] = None
    profile_picture: Optional[str] = None

class UserResponseSchema(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str
    date_of_birth: datetime 
    gender: str
    country: str
    street: str
    street_number: str
    role: str
    created_at: str
    updated_at: str
    total_recipes: int
    average_rating: float

    class Config:
        from_attributes = True