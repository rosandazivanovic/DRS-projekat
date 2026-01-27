# server/app/create_test_data.py
import os
from datetime import datetime, timedelta

from passlib.hash import pbkdf2_sha256
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

try:
    from app.models import (
        Base,
        User,
        CourseRequest,
        Course,
        CourseEnrollment,
        Task,
        TaskSubmission,
    )
except Exception:
    from app import models as m
    Base = m.Base
    User = m.User
    CourseRequest = m.CourseRequest
    Course = m.Course
    CourseEnrollment = m.CourseEnrollment
    Task = m.Task
    TaskSubmission = m.TaskSubmission

DB_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://postgres:postgres@localhost:5432/learning_platform",
)

engine = create_engine(DB_URL, future=True)
SessionLocal = sessionmaker(bind=engine, future=True)


def get_or_create(session, model, defaults=None, **kwargs):
    stmt = select(model).filter_by(**kwargs)
    instance = session.scalar(stmt)
    if instance:
        return instance, False
    params = dict(**kwargs)
    if defaults:
        params.update(defaults)
    instance = model(**params)
    session.add(instance)
    session.flush()  # assign id
    return instance, True


def hash_password(pw: str) -> str:
    return pbkdf2_sha256.hash(pw)


def seed():
    print("Connecting to DB:", DB_URL)
    Base.metadata.create_all(bind=engine)

    session = SessionLocal()
    try:
        print("Creating users...")
        admin, created = get_or_create(
            session,
            User,
            first_name="Admin",
            last_name="User",
            email="admin1@example.com",
            password_hash=hash_password("adminpass"),
            role="ADMIN",
        )
        if created:
            print(f"  created admin id={admin.id}")

        prof, created = get_or_create(
            session,
            User,
            first_name="Petar",
            last_name="Profesor",
            email="prof1@example.com",
            password_hash=hash_password("profpass"),
            role="PROFESOR",
        )
        if created:
            print(f"  created professor id={prof.id}")

        student, created = get_or_create(
            session,
            User,
            first_name="Maja",
            last_name="Student",
            email="student1@example.com",
            password_hash=hash_password("studentpass"),
            role="STUDENT",
        )
        if created:
            print(f"  created student id={student.id}")

        print("Creating a sample course request (professor) ...")
        cr, created = get_or_create(
            session,
            CourseRequest,
            professor_id=prof.id,
            name="Uvod u Python",
            defaults={
                "description": "Kratki kurs o Python programiranju za početnike.",
                "status": "APPROVED",
            },
        )
        if created:
            print(f"  created course request id={cr.id}")

        print("Creating courses...")
        course1, created = get_or_create(
            session,
            Course,
            professor_id=prof.id,
            name="Uvod u Python - pun kurs",
            defaults={"description": "Detaljan kurs pokrivajući osnove i vežbe."},
        )
        if created:
            print(f"  created course id={course1.id}")

        course2, created = get_or_create(
            session,
            Course,
            professor_id=prof.id,
            name="Napredni Python",
            defaults={"description": "Generatori, dekoratori, asinhroni kod."},
        )
        if created:
            print(f"  created course id={course2.id}")

        print("Enrolling student into courses...")
        enroll1, created = get_or_create(
            session,
            CourseEnrollment,
            course_id=course1.id,
            student_id=student.id,
        )
        if created:
            print(f"  enrolled student id={student.id} to course id={course1.id}")

        print("Creating tasks...")
        t1_deadline = datetime.utcnow() + timedelta(days=7)
        task1, created = get_or_create(
            session,
            Task,
            course_id=course1.id,
            title="Prvi zadatak - osnove",
            defaults={
                "description": "Napiši kratki program koji ispisuje \"Hello World\".",
                "deadline": t1_deadline,
            },
        )
        if created:
            print(f"  created task id={task1.id}")

        t2_deadline = datetime.utcnow() + timedelta(days=14)
        task2, created = get_or_create(
            session,
            Task,
            course_id=course1.id,
            title="Drugi zadatak - funkcije",
            defaults={
                "description": "Napisi funkciju za sabiranje dva broja i testove.",
                "deadline": t2_deadline,
            },
        )
        if created:
            print(f"  created task id={task2.id}")

        print("Creating a sample submission...")
        sub1, created = get_or_create(
            session,
            TaskSubmission,
            task_id=task1.id,
            student_id=student.id,
            defaults={
                "file_path": "/submissions/student1/task1.zip",
                "grade": None,
                "comment": None,
            },
        )
        if created:
            print(f"  created submission id={sub1.id}")

        session.commit()
        print("Test data created successfully.")
        print(
            f"Admin: admin@example.com / adminpass\nProfessor: prof@example.com / profpass\nStudent: student@example.com / studentpass"
        )

    except Exception as e:
        session.rollback()
        print("Error creating test data:", e)
        raise
    finally:
        session.close()


if __name__ == "__main__":
    seed()
