import { useEffect, useState} from "react";
import type { FormEvent } from "react";
import { useParams } from "react-router-dom";
import { http } from "../api/https";
import { endpoints } from "../api/endpoints";
import type { Course } from "../types/courses";
import type { Task, TaskSubmission } from "../types/tasks";
import { useAuth } from "../auth/AuthContext";

export default function CourseDetailsPage() {
  const { id } = useParams<{ id?: string }>();
  const courseId = id ? Number(id) : null;

  const { user, hasRole } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [loading, setLoading] = useState(false);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");

  const [selectedTaskId, setSelectedTaskId] = useState<number | "">("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (courseId === null) return;

    (async () => {
      await fetchCourse(courseId);
      await fetchTasks(courseId);
      if (hasRole && hasRole(["PROFESOR"])) {
        await fetchAllSubmissions();
      }
    })();
  }, [courseId, user]);

  const fetchCourse = async (cid: number) => {
    setLoading(true);
    try {
      const res = await http.get(endpoints.courses.byId(cid));
      setCourse(res.data);
    } catch (err) {
      console.error("fetchCourse error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (cid: number) => {
    try {
      const res = await http.get(endpoints.tasks.listByCourse(cid));
      setTasks(res.data ?? []);
      return res.data ?? [];
    } catch (err) {
      console.error("fetchTasks error:", err);
      setTasks([]);
      return [];
    }
  };

  const fetchAllSubmissions = async () => {
    try {
      const allSubs: TaskSubmission[] = [];
      for (const task of tasks) {
        if (typeof task.id !== "undefined" && task.id !== null) {
          const res = await http.get(endpoints.tasks.submissions(task.id));
          if (Array.isArray(res.data)) allSubs.push(...res.data);
        }
      }
      setSubmissions(allSubs);
    } catch (err) {
      console.error("fetchAllSubmissions error:", err);
      setSubmissions([]);
    }
  };

  const createTask = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTaskTitle || !newTaskDesc || !newTaskDeadline) {
      alert("Popuni sva polja!");
      return;
    }
    if (courseId === null) {
      alert("Nevažeći ID kursa.");
      return;
    }

    try {
      await http.post(endpoints.tasks.create, {
        courseId: courseId,
        title: newTaskTitle,
        description: newTaskDesc,
        deadline: new Date(newTaskDeadline).toISOString(),
      });
      alert("Zadatak kreiran ✅");
      setNewTaskTitle("");
      setNewTaskDesc("");
      setNewTaskDeadline("");
      await fetchTasks(courseId);
    } catch (err: any) {
      alert(err?.response?.data?.error ?? "Greška pri kreiranju zadatka.");
    }
  };

  const submitTask = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedTaskId || selectedTaskId === 0) {
      alert("Izaberi zadatak!");
      return;
    }
    
    if (!selectedFile) {
      alert("Molimo odaberite .py fajl!");
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith('.py')) {
      alert("Fajl mora biti Python skripta (.py)!");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      alert("Fajl je prevelik! Maksimalna veličina je 5MB.");
      return;
    }

    setSubmitting(true);

    try {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        
        // Šalji Base64 + naziv fajla na backend
        await http.post(endpoints.tasks.submit(Number(selectedTaskId)), {
          filePath: base64Data,
          fileName: selectedFile.name,
        });

        alert("Zadatak uspešno predat! ✅");
        setSelectedTaskId("");
        setSelectedFile(null);
        setSubmitting(false);
        
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      };
      
      reader.onerror = () => {
        alert("Greška pri čitanju fajla");
        setSubmitting(false);
      };
      
      reader.readAsDataURL(selectedFile);
      
    } catch (err: any) {
      alert(err?.response?.data?.error ?? "Greška pri predaji.");
      setSubmitting(false);
    }
  };

  const gradeSubmission = async (submissionId: number) => {
    const gradeStr = prompt("Ocena (1-5):");
    if (!gradeStr) return;
    const comment = prompt("Komentar (opciono):") || "";
    const grade = parseInt(gradeStr, 10);
    if (Number.isNaN(grade)) {
      alert("Nevažeća ocena.");
      return;
    }

    try {
      await http.post(endpoints.tasks.grade(submissionId), {
        grade,
        comment,
      });
      alert("Ocena postavljena ✅");
      await fetchAllSubmissions();
    } catch (err: any) {
      alert(err?.response?.data?.error ?? "Greška pri ocenjivanju.");
    }
  };

  if (loading || !course) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#8b7762" }}>
        Učitavanje...
      </div>
    );
  }

  const isProfessor = hasRole && hasRole(["PROFESOR"]) && course.professorId === user?.id;
  const isStudent = hasRole && hasRole(["STUDENT"]);

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
          <h2 style={{ margin: 0, color: "#2c2b28" }}>{course.name}</h2>
          <p style={{ margin: "6px 0 0", color: "#8b7762" }}>{course.professorName}</p>
          <p style={{ margin: "10px 0 0", color: "rgba(44,43,40,0.8)" }}>{course.description}</p>

          {course.materialPath && (
            <div style={{ marginTop: 12 }}>
              {course.materialPath.startsWith("data:") ? (
                <a
                  href={course.materialPath}
                  download={`${course.name.replace(/\s+/g, '_')}_materijal.pdf`}
                  style={{ 
                    color: "#9a7556", 
                    textDecoration: "underline",
                    cursor: "pointer"
                  }}
                >
                  📄 Preuzmi materijal (PDF)
                </a>
              ) : (
                <a
                  href={course.materialPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#9a7556", textDecoration: "underline" }}
                >
                  📄 Preuzmi materijal
                </a>
              )}
            </div>
          )}
        </div>

        {isProfessor && (
          <div
            style={{
              marginBottom: 24,
              padding: 18,
              border: "1px solid rgba(44,43,40,0.06)",
              borderRadius: 16,
              background: "#fffaf6",
            }}
          >
            <h3 style={{ margin: "0 0 14px", color: "#2c2b28" }}>➕ Kreiraj novi zadatak</h3>
            <form onSubmit={createTask} style={{ display: "grid", gap: 12 }}>
              <input
                placeholder="Naziv zadatka"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                style={{
                  padding: 10,
                  borderRadius: 10,
                  border: "1px solid rgba(44,43,40,0.06)",
                  background: "#fff",
                }}
              />
              <textarea
                placeholder="Opis zadatka"
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                style={{
                  padding: 10,
                  borderRadius: 10,
                  border: "1px solid rgba(44,43,40,0.06)",
                  minHeight: 80,
                  background: "#fff",
                }}
              />
              <input
                type="datetime-local"
                value={newTaskDeadline}
                onChange={(e) => setNewTaskDeadline(e.target.value)}
                style={{
                  padding: 10,
                  borderRadius: 10,
                  border: "1px solid rgba(44,43,40,0.06)",
                  background: "#fff",
                }}
              />
              <button
                type="submit"
                style={{
                  padding: 10,
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  color: "#fff",
                  background: "linear-gradient(135deg,#d6bca3,#b99a7f)",
                }}
              >
                Kreiraj zadatak
              </button>
            </form>
          </div>
        )}

        {isStudent && (
          <div
            style={{
              marginBottom: 24,
              padding: 18,
              border: "1px solid rgba(44,43,40,0.06)",
              borderRadius: 16,
              background: "#fffaf6",
            }}
          >
            <h3 style={{ margin: "0 0 14px", color: "#2c2b28" }}>📤 Predaj zadatak</h3>
            <form onSubmit={submitTask} style={{ display: "grid", gap: 12 }}>
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value === "" ? "" : Number(e.target.value))}
                style={{
                  padding: 10,
                  borderRadius: 10,
                  border: "1px solid rgba(44,43,40,0.06)",
                  background: "#fff",
                  color: "#2c2b28",
                }}
              >
                <option value="">Izaberi zadatak</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    color: "#8b7762",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Python fajl (.py):
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".py,text/x-python"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  style={{
                    padding: 10,
                    borderRadius: 10,
                    border: "1px solid rgba(44,43,40,0.06)",
                    background: "#fff",
                    width: "100%",
                    cursor: "pointer",
                  }}
                />
                {selectedFile && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: 10,
                      borderRadius: 8,
                      background: "#e9fbf4",
                      border: "1px solid rgba(6,95,70,0.08)",
                    }}
                  >
                    <div style={{ fontSize: 12, color: "#065f46", fontWeight: 600 }}>
                      ✅ Odabran fajl:
                    </div>
                    <div style={{ fontSize: 13, color: "#047857", marginTop: 4 }}>
                      📄 <strong>{selectedFile.name}</strong>
                    </div>
                    <div style={{ fontSize: 12, color: "#8b7762", marginTop: 2 }}>
                      Veličina: {(selectedFile.size / 1024).toFixed(2)} KB
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: 10,
                  borderRadius: 10,
                  border: "none",
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.6 : 1,
                  fontWeight: 600,
                  color: "#fff",
                  background: "linear-gradient(135deg,#d6bca3,#b99a7f)",
                }}
              >
                {submitting ? "Predaja u toku..." : "📤 Predaj rešenje"}
              </button>
            </form>
          </div>
        )}

        <div>
          <h3 style={{ margin: "0 0 14px", color: "#2c2b28" }}>📝 Zadaci</h3>
          <div style={{ display: "grid", gap: 12 }}>
            {tasks.map((t) => (
              <div
                key={t.id}
                style={{
                  padding: 14,
                  border: "1px solid rgba(44,43,40,0.06)",
                  borderRadius: 12,
                  background: "#fff",
                }}
              >
                <div style={{ fontWeight: 700, color: "#2c2b28" }}>{t.title}</div>
                <div style={{ color: "rgba(44,43,40,0.8)", fontSize: 14, marginTop: 4 }}>
                  {t.description}
                </div>
                <div style={{ fontSize: 12, color: "#8b7762", marginTop: 6 }}>
                  Rok: {t.deadline ? new Date(t.deadline).toLocaleString() : "-"}
                </div>
              </div>
            ))}

            {tasks.length === 0 && <div style={{ color: "#777", fontStyle: "italic" }}>Nema zadataka još.</div>}
          </div>
        </div>

        {isProfessor && submissions.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h3 style={{ margin: "0 0 14px", color: "#2c2b28" }}>📋 Predata rešenja</h3>
            <div style={{ display: "grid", gap: 12 }}>
              {submissions.map((s) => (
                <div
                  key={s.id}
                  style={{
                    padding: 14,
                    border: "1px solid rgba(44,43,40,0.06)",
                    borderRadius: 12,
                    background: "#fff",
                  }}
                >
                  <div style={{ fontWeight: 700, color: "#2c2b28" }}>{s.taskTitle}</div>
                  <div style={{ color: "#8b7762", fontSize: 13 }}>{s.studentName}</div>
                  <div style={{ color: "rgba(44,43,40,0.8)", fontSize: 14, marginTop: 4 }}>
                    Fajl: {s.filePath.startsWith('data:') ? 'Python rešenje (.py)' : s.filePath}
                  </div>

                  {s.grade ? (
                    <div
                      style={{
                        marginTop: 8,
                        padding: 8,
                        borderRadius: 8,
                        background: "#effaf3",
                        border: "1px solid rgba(6,95,70,0.08)",
                        color: "#065f46",
                        fontSize: 13,
                      }}
                    >
                      Ocena: {s.grade}/5 • {s.comment}
                    </div>
                  ) : (
                    <button
                      onClick={() => gradeSubmission(s.id)}
                      style={{
                        marginTop: 10,
                        padding: "6px 12px",
                        borderRadius: 8,
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 600,
                        color: "#fff",
                        background: "linear-gradient(135deg,#d6bca3,#b99a7f)",
                      }}
                    >
                      Oceni
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}