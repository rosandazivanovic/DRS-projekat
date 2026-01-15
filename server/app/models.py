from .db import db
from datetime import datetime

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(60), nullable=False)
    last_name = db.Column(db.String(60), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    birth_date = db.Column(db.String(20), nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    country = db.Column(db.String(60), nullable=False)
    street = db.Column(db.String(120), nullable=False)
    number = db.Column(db.String(20), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="STUDENT")
    password_hash = db.Column(db.String(255), nullable=False)
    profile_image = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "firstName": self.first_name,
            "lastName": self.last_name,
            "email": self.email,
            "birthDate": self.birth_date,
            "gender": self.gender,
            "country": self.country,
            "street": self.street,
            "number": self.number,
            "role": self.role,
            "profileImage": self.profile_image,
        }


class CourseRequest(db.Model):
    __tablename__ = "course_requests"

    id = db.Column(db.Integer, primary_key=True)
    professor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), nullable=False, default="PENDING")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    professor = db.relationship("User", backref="course_requests")

    def to_dict(self):
        return {
            "id": self.id,
            "professorId": self.professor_id,
            "professorName": f"{self.professor.first_name} {self.professor.last_name}",
            "name": self.name,
            "description": self.description,
            "status": self.status,
            "createdAt": self.created_at.isoformat(),
        }


class Course(db.Model):
    __tablename__ = "courses"

    id = db.Column(db.Integer, primary_key=True)
    professor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=False)
    material_path = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    professor = db.relationship("User", backref="courses")

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


class CourseEnrollment(db.Model):
    __tablename__ = "course_enrollments"

    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    enrolled_at = db.Column(db.DateTime, default=datetime.utcnow)

    course = db.relationship("Course", backref="enrollments")
    student = db.relationship("User", backref="enrollments")

    def to_dict(self):
        return {
            "id": self.id,
            "courseId": self.course_id,
            "courseName": self.course.name,
            "studentId": self.student_id,
            "studentName": f"{self.student.first_name} {self.student.last_name}",
            "enrolledAt": self.enrolled_at.isoformat(),
        }


class Task(db.Model):
    __tablename__ = "tasks"

    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=False)
    deadline = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    course = db.relationship("Course", backref="tasks")

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


class TaskSubmission(db.Model):
    __tablename__ = "task_submissions"

    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey("tasks.id"), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    grade = db.Column(db.Integer, nullable=True)
    comment = db.Column(db.Text, nullable=True)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    graded_at = db.Column(db.DateTime, nullable=True)

    task = db.relationship("Task", backref="submissions")
    student = db.relationship("User", backref="submissions")

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