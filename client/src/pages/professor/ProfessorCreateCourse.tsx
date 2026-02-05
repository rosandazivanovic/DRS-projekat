import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../../api/https";
import { endpoints } from "../../api/endpoints";
import { useAuth } from "../../auth/AuthContext";

const BookOpenIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const XCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);

const AlertCircleIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

export default function ProfessorCreateCoursePage() {
  const nav = useNavigate();
  const { user, hasRole } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!user || !hasRole(["PROFESOR"])) {
    return (
      <div style={pageWrap}>
        <div style={errorContainer}>
          <div style={{ marginBottom: 16, color: "#9a7556", display: "flex", justifyContent: "center" }}>
            <AlertCircleIcon />
          </div>
          Nemaš pristup ovoj stranici.
        </div>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!name.trim()) return setErr("Naziv kursa je obavezan.");
    if (!description.trim()) return setErr("Opis kursa je obavezan.");

    setLoading(true);
    try {
      await http.post(endpoints.courses.request, {
        name: name.trim(),
        description: description.trim(),
      });
      setSuccessMessage("Kurs poslat administratoru na odobrenje");
      setTimeout(() => setSuccessMessage(null), 3000);
      nav("/professor/courses");
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Greška pri kreiranju kursa.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageWrap}>
      <div style={container}>
        <div style={header}>
          <h2 style={{ margin: 0, color: "#2c2b28", fontSize: 26, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "#9a7556" }}>
              <BookOpenIcon />
            </span>
            Kreiranje novog kursa
          </h2>
          <p style={{ margin: "6px 0 0", color: "#8b7762", fontSize: 15 }}>
            Popuni osnovne informacije i pošalji kurs na odobrenje
          </p>
        </div>

        {successMessage && (
          <div style={successBanner}>
            <CheckCircleIcon />
            {successMessage}
          </div>
        )}

        {error && (
          <div style={errorBanner}>
            <XCircleIcon />
            {error}
          </div>
        )}

        <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
          <div>
            <label style={label}>Naziv kursa</label>
            <input
              placeholder="Unesite naziv kursa..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={label}>Opis kursa</label>
            <textarea
              placeholder="Kratki opis kursa..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={textareaStyle}
            />
          </div>

          {err && (
            <div style={validationError}>
              {err}
            </div>
          )}

          <button
            disabled={loading}
            style={{
              ...submitButton,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Šaljem..." : "Pošalji na odobrenje"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ----------------- Styles ----------------- */
const pageWrap: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(180deg,#fbf7f2 0%,#f6f1ea 100%)",
  padding: 24,
};

const container: React.CSSProperties = {
  maxWidth: 900,
  margin: "0 auto",
  background: "#fff",
  borderRadius: 20,
  padding: 28,
  boxShadow: "0 20px 40px rgba(39,35,30,0.04)",
};

const errorContainer: React.CSSProperties = {
  maxWidth: 600,
  margin: "0 auto",
  background: "#fff",
  borderRadius: 20,
  padding: 60,
  textAlign: "center",
  color: "#8b7762",
  boxShadow: "0 20px 40px rgba(39,35,30,0.04)",
};

const header: React.CSSProperties = {
  marginBottom: 24,
  paddingBottom: 20,
  borderBottom: "2px solid #f5f0ea",
};

const label: React.CSSProperties = {
  display: "block",
  marginBottom: 8,
  color: "#8b7762",
  fontSize: 13,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 12,
  borderRadius: 12,
  border: "1px solid rgba(44,43,40,0.1)",
  fontSize: 14,
  background: "#fff",
  color: "#2c2b28",
  boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
  transition: "all 0.2s",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  padding: 12,
  borderRadius: 12,
  border: "1px solid rgba(44,43,40,0.1)",
  fontSize: 14,
  minHeight: 140,
  resize: "vertical",
  background: "#fff",
  color: "#2c2b28",
  fontFamily: "inherit",
  boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
  transition: "all 0.2s",
};

const validationError: React.CSSProperties = {
  padding: 12,
  borderRadius: 10,
  background: "#fff5f5",
  border: "1px solid rgba(220,38,38,0.12)",
  color: "#991b1b",
  fontSize: 13,
  fontWeight: 600,
  textAlign: "center",
};

const submitButton: React.CSSProperties = {
  marginTop: 8,
  padding: "14px 24px",
  borderRadius: 12,
  border: "none",
  fontWeight: 700,
  fontSize: 15,
  color: "#fff",
  background: "linear-gradient(135deg,#d6bca3,#b99a7f)",
  boxShadow: "0 4px 12px rgba(121,86,61,0.15)",
  transition: "all 0.2s",
};

const successBanner: React.CSSProperties = {
  padding: 14,
  marginBottom: 16,
  background: "linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)",
  border: "1px solid rgba(6,95,70,0.12)",
  borderRadius: 12,
  color: "#065f46",
  fontWeight: 600,
  fontSize: 14,
  display: "flex",
  alignItems: "center",
  gap: 10,
  boxShadow: "0 2px 8px rgba(6,95,70,0.08)",
};

const errorBanner: React.CSSProperties = {
  padding: 14,
  marginBottom: 16,
  background: "#fff5f5",
  border: "1px solid rgba(220,38,38,0.12)",
  borderRadius: 12,
  color: "#991b1b",
  fontWeight: 600,
  fontSize: 14,
  display: "flex",
  alignItems: "center",
  gap: 10,
  boxShadow: "0 2px 8px rgba(220,38,38,0.08)",
};