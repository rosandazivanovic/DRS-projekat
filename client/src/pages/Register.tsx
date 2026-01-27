// src/pages/RegisterPage.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function RegisterPage() {
  const nav = useNavigate();
  const { register } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!firstName.trim() || !lastName.trim()) {
      return setErr("Ime i prezime su obavezni.");
    }
    if (!email.includes("@")) {
      return setErr("Email adresa nije validna.");
    }
    if (password.length < 6) {
      return setErr("Lozinka mora imati minimum 6 karaktera.");
    }
    if (password !== confirmPassword) {
      return setErr("Lozinke se ne poklapaju.");
    }

    setLoading(true);
    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password: password,
      });
      nav("/courses");
    } catch (ex: any) {
      setErr(
        ex?.response?.data?.error ?? ex?.message ?? "Greška pri registraciji."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #fbf7f2 0%, #f6f1ea 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#fffaf6",
          borderRadius: 18,
          padding: 32,
          boxShadow: "0 12px 30px rgba(39,35,30,0.06)",
          border: "1px solid rgba(39,35,30,0.04)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              fontSize: 36,
              lineHeight: 1,
              display: "inline-block",
              padding: 10,
              borderRadius: 12,
              background: "#f1e9df",
              color: "#7a5b3b",
            }}
          >
            🎓
          </div>
          <h2
            style={{
              margin: "8px 0 4px",
              color: "#2c2b28",
              fontWeight: 700,
              fontSize: 22,
            }}
          >
            Registruj se
          </h2>
          <p style={{ margin: 0, color: "#8b7762" }}>
            Kreiraj nalog i počni sa učenjem
          </p>
        </div>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <input
              placeholder="Ime"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              style={{
                padding: 12,
                borderRadius: 12,
                border: "1px solid rgba(39,35,30,0.06)",
                fontSize: 14,
                background: "#fff",
                color: "#2c2b28",
                boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
              }}
            />
            <input
              placeholder="Prezime"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              style={{
                padding: 12,
                borderRadius: 12,
                border: "1px solid rgba(39,35,30,0.06)",
                fontSize: 14,
                background: "#fff",
                color: "#2c2b28",
                boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
              }}
            />
          </div>

          <input
            placeholder="Email adresa"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(39,35,30,0.06)",
              fontSize: 14,
              background: "#fff",
              color: "#2c2b28",
              boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
            }}
          />

          <input
            placeholder="Lozinka (min. 6 karaktera)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(39,35,30,0.06)",
              fontSize: 14,
              background: "#fff",
              color: "#2c2b28",
              boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
            }}
          />

          <input
            placeholder="Potvrdi lozinku"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(39,35,30,0.06)",
              fontSize: 14,
              background: "#fff",
              color: "#2c2b28",
              boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
            }}
          />

          {err && (
            <div
              style={{
                color: "#7a2a2a",
                fontSize: 13,
                textAlign: "center",
                padding: 10,
                background: "#fff3f2",
                borderRadius: 8,
                border: "1px solid rgba(122,42,42,0.08)",
              }}
            >
              {err}
            </div>
          )}

          <button
            disabled={loading}
            style={{
              marginTop: 6,
              padding: 12,
              borderRadius: 12,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontSize: 15,
              color: "#fff",
              background: loading
                ? "#bfa58a"
                : "linear-gradient(135deg, #d6bca3 0%, #b99a7f 100%)",
              transition: "opacity 0.18s, transform 0.12s",
              boxShadow: loading
                ? "none"
                : "0 6px 18px rgba(121,86,61,0.12)",
            }}
            onMouseDown={(e) => {
              (e.target as HTMLButtonElement).style.transform = "translateY(1px)";
            }}
            onMouseUp={(e) => {
              (e.target as HTMLButtonElement).style.transform = "translateY(0)";
            }}
          >
            {loading ? "Kreiranje naloga..." : "Kreiraj nalog"}
          </button>
        </form>

        <div
          style={{
            marginTop: 20,
            textAlign: "center",
            fontSize: 14,
            color: "#8b7762",
          }}
        >
          Već imaš nalog?{" "}
          <Link
            to="/login"
            style={{
              color: "#9a7556",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Prijavi se
          </Link>
        </div>

        <div
          style={{
            marginTop: 16,
            textAlign: "center",
            fontSize: 12,
            color: "#9b8b7a",
            padding: 12,
            background: "#fbf6f1",
            borderRadius: 8,
            border: "1px solid rgba(39,35,30,0.03)",
          }}
        >
          Registracijom prihvataš uslove korišćenja platforme.
          <br />
          Novi nalozi dobijaju ulogu <strong>STUDENT</strong>.
        </div>
      </div>
    </div>
  );
}
