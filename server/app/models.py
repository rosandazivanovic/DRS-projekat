from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    first_name = Column(String(60), nullable=False)
    last_name = Column(String(60), nullable=False)
    email = Column(String(120), unique=True, nullable=False, index=True)
    birth_date = Column(String(20), nullable=True)
    gender = Column(String(10), nullable=True)
    country = Column(String(60), nullable=True)
    street = Column(String(120), nullable=True)
    number = Column(String(20), nullable=True)
    role = Column(String(20), nullable=False, default="STUDENT")
    password_hash = Column(String(255), nullable=False)
    profile_image = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    course_requests = relationship("CourseRequest", back_populates="professor", cascade="all, delete-orphan")
    courses = relationship("Course", back_populates="professor", cascade="all, delete-orphan")
    enrollments = relationship("CourseEnrollment", back_populates="student", cascade="all, delete-orphan")
    submissions = relationship("TaskSubmission", back_populates="student", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "firstName": self.first_name,
            "lastName": self.last_name,
            "email": self.email,
            "birthDate": self.birth_date or "",
            "gender": self.gender or "",
            "country": self.country or "",
            "street": self.street or "",
            "number": self.number or "",
            "role": self.role,
            "profileImage": self.profile_image,
        }


class CourseRequest(Base):
    __tablename__ = "course_requests"

    id = Column(Integer, primary_key=True)
    professor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(120), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(20), nullable=False, default="PENDING")
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    professor = relationship("User", back_populates="course_requests")

    def to_dict(self):
        return {
            "id": self.id,
            "professorId": self.professor_id,
            "professorName": f"{self.professor.first_name} {self.professor.last_name}",
            "name": self.name,
            "description": self.description,
            "status": self.status,
            "rejectionReason": self.rejection_reason,
            "createdAt": self.created_at.isoformat(),
        }


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True)
    professor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(120), nullable=False)
    description = Column(Text, nullable=False)
    material_path = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    professor = relationship("User", back_populates="courses")
    enrollments = relationship("CourseEnrollment", back_populates="course", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="course", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "professorId": self.professor_id,
            "professorName": f"{self.professor.first_name} {self.professor.last_name}",
            "name": self.name,
            "description": self.description,
            "materialPath": self.material_path,
            "createdAt": self.created_at.isoformat(),
        }


class CourseEnrollment(Base):
    __tablename__ = "course_enrollments"

    id = Column(Integer, primary_key=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    enrolled_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    course = relationship("Course", back_populates="enrollments")
    student = relationship("User", back_populates="enrollments")

    def to_dict(self):
        return {
            "id": self.id,
            "courseId": self.course_id,
            "courseName": self.course.name,
            "studentId": self.student_id,
            "studentName": f"{self.student.first_name} {self.student.last_name}",
            "enrolledAt": self.enrolled_at.isoformat(),
        }


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(120), nullable=False)
    description = Column(Text, nullable=False)
    deadline = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    course = relationship("Course", back_populates="tasks")
    submissions = relationship("TaskSubmission", back_populates="task", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "courseId": self.course_id,
            "courseName": self.course.name,
            "title": self.title,
            "description": self.description,
            "deadline": self.deadline.isoformat(),
            "createdAt": self.created_at.isoformat(),
        }


class TaskSubmission(Base):
    __tablename__ = "task_submissions"

    id = Column(Integer, primary_key=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    file_path = Column(Text, nullable=False)
    grade = Column(Integer, nullable=True)
    comment = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    graded_at = Column(DateTime, nullable=True)

    task = relationship("Task", back_populates="submissions")
    student = relationship("User", back_populates="submissions")

    def to_dict(self):
        return {
            "id": self.id,
            "taskId": self.task_id,
            "taskTitle": self.task.title,
            "studentId": self.student_id,
            "studentName": f"{self.student.first_name} {self.student.last_name}",
            "filePath": self.file_path,
            "grade": self.grade,
            "comment": self.comment,
            "submittedAt": self.submitted_at.isoformat(),
            "gradedAt": self.graded_at.isoformat() if self.graded_at else None,
        }