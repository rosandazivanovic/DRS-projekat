import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def send_email(to: str, subject: str, body: str):
    """
    Šalje email koristeći SMTP server.
    """
    print("=" * 60)
    print(f"[EMAIL] Šaljem email...")
    print(f"[EMAIL] To: {to}")
    print(f"[EMAIL] Subject: {subject}")
    print("=" * 60)
    
    try:
        smtp_host = os.getenv("SMTP_SERVER")  
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_user = os.getenv("SMTP_USERNAME") 
        smtp_password = os.getenv("SMTP_PASSWORD")
        smtp_from = os.getenv("SMTP_FROM_EMAIL", smtp_user)
        
        if not smtp_user or not smtp_password:
            raise ValueError("SMTP_USERNAME i SMTP_PASSWORD nisu postavljeni u .env fajlu!")
        
        msg = MIMEMultipart()
        msg["From"] = "Platforma za učenje <noreply@platformazaucenje0.com>"
        msg["To"] = to
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain", "utf-8"))
        
        print(f"📧 Povezujem se na {smtp_host}:{smtp_port}...")
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            print(f"🔐 Logujem se kao {smtp_user}...")
            server.login(smtp_user, smtp_password)
            print(f"📤 Šaljem email na {to}...")
            server.send_message(msg)
            
        print(f"✅ Email uspešno poslat na {to}")
        
    except smtplib.SMTPAuthenticationError as e:
        print(f"❌ SMTP autentifikacija neuspešna: {e}")
        print("   Proveri SMTP_USERNAME i SMTP_PASSWORD u .env fajlu")
        raise
        
    except smtplib.SMTPException as e:
        print(f"❌ SMTP greška: {e}")
        raise
        
    except Exception as e:
        print(f"❌ Greška pri slanju emaila: {e}")
        raise


def send_course_request_approved_email(professor_email: str, course_name: str):
    """Šalje email profesoru kada je zahtev odobren."""
    subject = "✅ Zahtev za kurs odobren"
    body = f"""Poštovani/a,

Obaveštavamo vas da je vaš zahtev za kreiranje kursa uspešno odobren!

Naziv kursa: {course_name}

Sada možete da:
- Dodate studente na kurs
- Postavite materijale za učenje
- Kreirate zadatke za studente

Prijavite se na platformu kako biste pristupili kursu.

Srdačan pozdrav,
Tim platforme za učenje
"""
    send_email(to=professor_email, subject=subject, body=body)


def send_course_request_rejected_email(professor_email: str, course_name: str, reason: str):
    """Šalje email profesoru kada je zahtev odbijen."""
    subject = "❌ Zahtev za kurs odbijen"
    body = f"""Poštovani/a,

Obaveštavamo vas da je vaš zahtev za kreiranje kursa odbijen.

Naziv kursa: {course_name}
Razlog odbijanja: {reason}

Možete podneti novi zahtev za kurs sa izmenjenim informacijama.

Srdačan pozdrav,
Tim platforme za učenje
"""
    send_email(to=professor_email, subject=subject, body=body)


def send_new_assignment_email(student_email: str, student_name: str, course_name: str, 
                               assignment_title: str, assignment_description: str, deadline: str):
    """Šalje email studentu kada je kreiran novi zadatak."""
    subject = f"📚 Novi zadatak u kursu: {course_name}"
    body = f"""Poštovani/a {student_name},

Kreiran je novi zadatak u kursu "{course_name}".

📝 Naziv zadatka: {assignment_title}

📋 Opis:
{assignment_description}

⏰ Krajnji rok za predaju: {deadline}

Molimo vas da predate rešenje u .py formatu pre isteka roka.

Srećno!

Srdačan pozdrav,
Tim platforme za učenje
"""
    send_email(to=student_email, subject=subject, body=body)