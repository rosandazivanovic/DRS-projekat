import time
from datetime import datetime, timezone
from sqlalchemy.orm import sessionmaker

from app.db.models import Task, TaskStatus


def run_task_status_updater(engine):
    """
    Background proces koji automatski ažurira status zadataka
    na osnovu deadline-a.
    """
    Session = sessionmaker(bind=engine)

    while True:
        now = datetime.now(timezone.utc)

        with Session() as db:
            tasks = db.query(Task).filter(
                Task.status.in_([
                    TaskStatus.UPCOMING,
                    TaskStatus.ACTIVE
                ])
            ).all()

            changed = False

            for task in tasks:
                deadline = task.deadline

                if task.status == TaskStatus.UPCOMING and now < deadline:
                    task.status = TaskStatus.ACTIVE
                    changed = True

                elif task.status == TaskStatus.ACTIVE and now >= deadline:
                    task.status = TaskStatus.CLOSED
                    changed = True

            if changed:
                db.commit()

        time.sleep(5)
