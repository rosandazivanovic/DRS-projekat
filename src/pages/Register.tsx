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

  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!firstName || !lastName) return setErr("Ime i prezime su obavezni.");
    if (!email.includes("@")) return setErr("Email nije validan.");
    if (password.length < 4) return setErr("Lozinka mora imati bar 4 karaktera.");
    try {
      await register({
        firstName,
        lastName,
        email,
        password,
        birthDate: "",
        gender: "",
        country: "",
        street: "",
        number: "",
        role: "STUDENT",
      });
      nav("/");
    } catch (ex: any) {
      setErr(ex?.response?.data?.error ?? "Greška pri registraciji.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#fff",
          borderRadius: 18,
          padding: 32,
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 36 }}>🎓</div>
          <h2 style={{ margin: "8px 0 4px", color: "#2d2d2d" }}>
            Kreiraj nalog
          </h2>
          <p style={{ margin: 0, color: "#666" }}>
            Započni svoje učenje danas
          </p>
        </div>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
          <input
            placeholder="Ime"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid #ddd",
              fontSize: 14,
            }}
          />
          <input
            placeholder="Prezime"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid #ddd",
              fontSize: 14,
            }}
          />
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid #ddd",
              fontSize: 14,
            }}
          />
          <input
            placeholder="Lozinka"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid #ddd",
              fontSize: 14,
            }}
          />

          {err && (
            <div style={{ color: "crimson", fontSize: 13, textAlign: "center" }}>
              {err}
            </div>
          )}

          <button
            style={{
              marginTop: 6,
              padding: 12,
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 15,
              color: "#fff",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
            }}
          >
            Kreiraj nalog
          </button>
        </form>

        <div style={{ marginTop: 18, textAlign: "center", color: "#555" }}>
          Već imaš nalog?{" "}
          <Link
            to="/login"
            style={{ color: "#667eea", textDecoration: "none", fontWeight: 500 }}
          >
            Prijavi se
          </Link>
        </div>
      </div>
    </div>
  );
}
