import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../../api/https";
import { endpoints } from "../../api/endpoints";
import { useAuth } from "../../auth/AuthContext";

export default function ProfessorCreateCoursePage() {
  const nav = useNavigate();
  const { user, hasRole } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!user || !hasRole(["PROFESOR"])) {
    return <div style={{ padding: 16 }}>Nemaš pristup ovoj stranici.</div>;
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
      alert("Kurs poslat administratoru na odobrenje ✅");
      nav("/professor/courses");
    } catch (err: any) {
      setErr(err?.response?.data?.error ?? "Greška pri kreiranju kursa.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#fbf7f2 0%,#f6f1ea 100%)",
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 20,
          padding: 28,
          boxShadow: "0 20px 40px rgba(39,35,30,0.04)",
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ margin: 0, color: "#2c2b28" }}>
            🧑‍🏫 Kreiranje novog kursa
          </h2>
          <p style={{ margin: "6px 0 0", color: "#8b7762" }}>
            Popuni osnovne informacije i pošalji kurs na odobrenje
          </p>
        </div>

        <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
          <input
            placeholder="Naziv kursa"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(44,43,40,0.06)",
              fontSize: 14,
              background: "#fff",
              color: "#2c2b28",
            }}
          />

          <textarea
            placeholder="Kratki opis kursa"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(44,43,40,0.06)",
              fontSize: 14,
              minHeight: 140,
              resize: "vertical",
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
            }}
          >
            {loading ? "Šaljem..." : "Pošalji na odobrenje"}
          </button>
        </form>
      </div>
    </div>
  );
}
