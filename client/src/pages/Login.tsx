import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function LoginPage() {
  const nav = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login(email, password);
      nav("/courses");
    } catch (ex: any) {
      setErr(ex?.response?.data?.error ?? ex?.message ?? "Greška pri prijavi.");
    } finally {
      setLoading(false);
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
          maxWidth: 420,
          background: "#fff",
          borderRadius: 18,
          padding: 32,
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 36 }}>📚</div>
          <h2 style={{ margin: "8px 0 4px", color: "#2d2d2d" }}>
            Dobrodošao nazad
          </h2>
          <p style={{ margin: 0, color: "#666" }}>
            Nastavi svoje učenje
          </p>
        </div>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
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
            <div
              style={{
                color: "crimson",
                fontSize: 13,
                textAlign: "center",
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
                ? "#999"
                : "linear-gradient(135deg, #667eea, #764ba2)",
              transition: "opacity 0.2s",
            }}
          >
            {loading ? "Prijava..." : "Prijavi se"}
          </button>
        </form>

        <div style={{ marginTop: 18, textAlign: "center", color: "#555" }}>
          Nemaš nalog?{" "}
          <Link
            to="/register"
            style={{ color: "#667eea", textDecoration: "none", fontWeight: 500 }}
          >
            Registruj se
          </Link>
        </div>

        <div
          style={{
            marginTop: 16,
            fontSize: 12,
            color: "#777",
            textAlign: "center",
          }}
        >
          Tip: koristi email sa <b>admin</b> ili <b>profesor</b> da vidiš
          role-based UI (mock).
        </div>
      </div>
    </div>
  );
}
