import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, DateTime, Enum, Text
)
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class ApprovalStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class CourseRequest(Base):
    __tablename__ = "course_requests"

    id = Column(Integer, primary_key=True)
    professor_id = Column(Integer, nullable=False)

    name = Column(String(120), nullable=False)
    description = Column(Text, nullable=False)

    approval_status = Column(
        Enum(ApprovalStatus),
        nullable=False,
        default=ApprovalStatus.PENDING
    )

    rejection_reason = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True)
    professor_id = Column(Integer, nullable=False)

    name = Column(String(120), nullable=False)
    description = Column(Text, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
