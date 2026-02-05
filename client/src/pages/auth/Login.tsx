import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

const BookOpenIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

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
        background: "linear-gradient(180deg,#fbf7f2 0%,#f6f1ea 100%)",
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
          background: "#fffaf6",
          borderRadius: 18,
          padding: 32,
          boxShadow: "0 20px 40px rgba(39,35,30,0.04)",
          border: "1px solid rgba(44,43,40,0.03)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ 
            display: "inline-flex", 
            padding: 12, 
            borderRadius: 12, 
            background: "#f1e9df", 
            color: "#7a5b3b",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <BookOpenIcon />
          </div>
          <h2 style={{ margin: "12px 0 4px", color: "#2c2b28", fontSize: 24, fontWeight: 700 }}>
            Dobrodošao nazad
          </h2>
          <p style={{ margin: 0, color: "#8b7762", fontSize: 14 }}>Nastavi svoje učenje</p>
        </div>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(44,43,40,0.06)",
              fontSize: 14,
              background: "#fff",
              color: "#2c2b28",
            }}
          />
          <input
            placeholder="Lozinka"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(44,43,40,0.06)",
              fontSize: 14,
              background: "#fff",
              color: "#2c2b28",
            }}
          />

          {err && (
            <div
              style={{
                color: "#7a2a2a",
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
                ? "#b99a7f"
                : "linear-gradient(135deg,#d6bca3,#b99a7f)",
              transition: "opacity 0.2s",
              boxShadow: loading ? "none" : "0 6px 18px rgba(121,86,61,0.12)",
            }}
          >
            {loading ? "Prijava..." : "Prijavi se"}
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
        </div>

        <div
          style={{
            marginTop: 18,
            textAlign: "center",
            color: "#9b8b7a",
            fontSize: 12,
            padding: 12,
            background: "#fbf6f1",
            borderRadius: 8,
          }}
        >
          <strong>Test nalozi:</strong>
          <br />
          <span style={{ fontSize: 11 }}>
            admin@test.com / profesor@test.com / student@test.com
            <br />
            lozinka: <strong>test1234</strong>
          </span>
        </div>
      </div>
    </div>
  );
}