import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { addCourse } from "../mocks/courseStore";
import { mockProfessors } from "../mocks/db";

export default function ProfessorCreateCoursePage() {
  const nav = useNavigate();
  const { user, hasRole } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    // noop - in real app fetch professors
  }, []);

  if (!user || !hasRole(["PROFESOR"])) {
    return <div style={{ padding: 16 }}>Nemaš pristup ovoj stranici.</div>;
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!name.trim()) return setErr("Naziv kursa je obavezan.");
    if (!description.trim()) return setErr("Opis kursa je obavezan.");

    const newId =
      Math.max(0, ...mockProfessors.map((p) => p.id)) +
      Math.floor(Math.random() * 1000) +
      1;

    const course = {
      id: newId,
      professorId: user.id,
      professorName: `${user.firstName} ${user.lastName}`,
      name: name.trim(),
      description: description.trim(),
      materialPath: null,
      createdAt: new Date().toISOString(),
      status: "PENDING" as const,
    };

    addCourse(course as any);
    alert("Kurs poslat administratoru na odobrenje ✅ (mock)");
    nav("/courses");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
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
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ margin: 0, color: "#2d2d2d" }}>
            🧑‍🏫 Kreiranje novog kursa
          </h2>
          <p style={{ margin: "6px 0 0", color: "#666" }}>
            Popuni osnovne informacije i pošalji kurs na odobrenje
          </p>
        </div>

        <form
          onSubmit={submit}
          style={{ display: "grid", gap: 14 }}
        >
          <input
            placeholder="Naziv kursa"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid #ddd",
              fontSize: 14,
            }}
          />

          <textarea
            placeholder="Kratki opis kursa"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid #ddd",
              fontSize: 14,
              minHeight: 140,
              resize: "vertical",
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
            Pošalji na odobrenje
          </button>
        </form>
      </div>
    </div>
  );
}
