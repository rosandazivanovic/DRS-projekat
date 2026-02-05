import { useEffect, useState} from "react";
import type { FormEvent } from "react";
import { useParams } from "react-router-dom";
import { http } from "../../api/https";
import { endpoints } from "../../api/endpoints";
import type { Course } from "../../types/courses";
import type { Task, TaskSubmission } from "../../types/tasks";
import { useAuth } from "../../auth/AuthContext";

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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gradingSubmission, setGradingSubmission] = useState<TaskSubmission | null>(null);
  const [gradeValue, setGradeValue] = useState("");
  const [gradeComment, setGradeComment] = useState("");

  useEffect(() => {
    if (courseId === null) return;

    (async () => {
      await fetchCourse(courseId);
      const fetchedTasks = await fetchTasks(courseId);
      if (hasRole && hasRole(["PROFESOR"])) {
        await fetchAllSubmissions(fetchedTasks);
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

  const fetchAllSubmissions = async (tasksToFetch: Task[] = tasks) => {
    try {
      const allSubs: TaskSubmission[] = [];
      for (const task of tasksToFetch) {
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
      setError("Popuni sva polja!");
      setTimeout(() => setError(null), 3000);
      return;
    }
    if (courseId === null) {
      setError("Nevažeći ID kursa.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      await http.post(endpoints.tasks.create, {
        courseId: courseId,
        title: newTaskTitle,
        description: newTaskDesc,
        deadline: new Date(newTaskDeadline).toISOString(),
      });
      setSuccessMessage("Zadatak kreiran ✅");
      setTimeout(() => setSuccessMessage(null), 3000);
      setNewTaskTitle("");
      setNewTaskDesc("");
      setNewTaskDeadline("");
      await fetchTasks(courseId);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Greška pri kreiranju zadatka.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const submitTask = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (typeof selectedTaskId !== "number" || selectedTaskId === 0) {
      setError("Izaberi zadatak!");
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    if (!selectedFile) {
      setError("Molimo odaberite .py fajl!");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith('.py')) {
      setError("Fajl mora biti Python skripta (.py)!");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError("Fajl je prevelik! Maksimalna veličina je 5MB.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setSubmitting(true);

    try {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        
        try {
          await http.post(endpoints.tasks.submit(selectedTaskId), {
            filePath: base64Data,
            fileName: selectedFile!.name,
          });

          setSuccessMessage("Zadatak uspešno predat! ✅");
          setTimeout(() => setSuccessMessage(null), 3000);
          setSelectedTaskId("");
          setSelectedFile(null);
          
          const fileInput = document.getElementById('file-upload') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
          
        } catch (err: any) {
          if (err?.response?.status === 409) {
            setError("Već ste predali rešenje za ovaj zadatak.");
          } else {
            setError(err?.response?.data?.error ?? "Greška pri predaji.");
          }
          setTimeout(() => setError(null), 3000);
        } finally {
          setSubmitting(false);
        }
      };
      
      reader.onerror = () => {
        setError("Greška pri čitanju fajla");
        setTimeout(() => setError(null), 3000);
        setSubmitting(false);
      };
      
      reader.readAsDataURL(selectedFile);
      
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Greška pri predaji.");
      setTimeout(() => setError(null), 3000);
      setSubmitting(false);
    }
  };

  const handleDownloadSubmission = async (taskId: number, submissionId: number) => {
    try {
      const res = await http.get(`/api/tasks/${taskId}/submissions/${submissionId}/download`);
      const data = res.data;
      
      const base64Data = data.fileData.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'text/x-python' });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.fileName;
      a.click();
      window.URL.revokeObjectURL(url);
      
      setSuccessMessage(`Fajl preuzet: ${data.fileName} ✅`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Greška pri preuzimanju fajla");
      setTimeout(() => setError(null), 3000);
    }
  };

  const openGradingModal = (submission: TaskSubmission) => {
    setGradingSubmission(submission);
    setGradeValue("");
    setGradeComment("");
  };

  const closeGradingModal = () => {
    setGradingSubmission(null);
    setGradeValue("");
    setGradeComment("");
  };

  const submitGrade = async () => {
    if (!gradingSubmission) return;

    const grade = parseInt(gradeValue, 10);
    if (Number.isNaN(grade) || grade < 1 || grade > 5) {
      setError("Ocena mora biti između 1 i 5.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      await http.post(endpoints.tasks.grade(gradingSubmission.id), {
        grade,
        comment: gradeComment,
      });
      setSuccessMessage("Ocena postavljena ✅");
      setTimeout(() => setSuccessMessage(null), 3000);
      closeGradingModal();
      await fetchAllSubmissions();
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Greška pri ocenjivanju.");
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading || !course) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#fbf7f2 0%,#f6f1ea 100%)", padding: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 60, textAlign: "center", color: "#8b7762", boxShadow: "0 2px 8px rgba(39,35,30,0.04)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
          Učitavanje kursa...
        </div>
      </div>
    );
  }

  const isProfessor = hasRole && hasRole(["PROFESOR"]) && course.professorId === user?.id;
  const isStudent = hasRole && hasRole(["STUDENT"]);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#fbf7f2 0%,#f6f1ea 100%)", padding: 24 }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: "0 2px 8px rgba(39,35,30,0.04)" }}>
          <h2 style={{ margin: 0, color: "#2c2b28", fontSize: 24 }}>{course.name}</h2>
          <p style={{ margin: "6px 0 0", color: "#8b7762", fontSize: 14 }}>👨‍🏫 {course.professorName}</p>
          <p style={{ margin: "10px 0 0", color: "rgba(44,43,40,0.75)", fontSize: 14, lineHeight: 1.6 }}>{course.description}</p>
          {course.materialPath && (
            <div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: "#f9f6f2", border: "1px solid rgba(44,43,40,0.06)" }}>
              {course.materialPath.startsWith("data:") ? (
                <a href={course.materialPath} download={`${course.name.replace(/\s+/g, '_')}_materijal.pdf`} style={{ color: "#9a7556", textDecoration: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  📄 Preuzmi materijal (PDF)
                </a>
              ) : (
                <a href={course.materialPath} target="_blank" rel="noopener noreferrer" style={{ color: "#9a7556", textDecoration: "none", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  📄 Preuzmi materijal
                </a>
              )}
            </div>
          )}
        </div>

        {successMessage && (
          <div style={{ padding: 14, marginBottom: 16, background: "linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)", border: "1px solid rgba(6,95,70,0.12)", borderRadius: 12, color: "#065f46", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 10, boxShadow: "0 2px 8px rgba(6,95,70,0.08)" }}>
            ✅ {successMessage}
          </div>
        )}

        {error && (
          <div style={{ padding: 14, marginBottom: 16, background: "#fff5f5", border: "1px solid rgba(220,38,38,0.12)", borderRadius: 12, color: "#991b1b", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 10, boxShadow: "0 2px 8px rgba(220,38,38,0.08)" }}>
            ❌ {error}
          </div>
        )}

        {isProfessor && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              
              <div style={{ padding: 20, border: "1px solid rgba(44,43,40,0.06)", borderRadius: 16, background: "#fff", boxShadow: "0 2px 8px rgba(39,35,30,0.04)" }}>
                <h3 style={{ margin: "0 0 16px", color: "#2c2b28", fontSize: 17 }}>➕ Kreiraj novi zadatak</h3>
                <form onSubmit={createTask} style={{ display: "grid", gap: 12 }}>
                  <input placeholder="Naziv zadatka" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} style={{ padding: 12, borderRadius: 10, border: "1px solid rgba(44,43,40,0.1)", background: "#fff", fontSize: 14, color: "#2c2b28" }} />
                  <textarea placeholder="Opis zadatka" value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)} style={{ padding: 12, borderRadius: 10, border: "1px solid rgba(44,43,40,0.1)", minHeight: 100, background: "#fff", fontSize: 14, color: "#2c2b28", fontFamily: "inherit", resize: "vertical" }} />
                  <div>
                    <label style={{ display: "block", marginBottom: 6, color: "#8b7762", fontSize: 13, fontWeight: 600 }}>Rok isporuke:</label>
                    <input type="datetime-local" value={newTaskDeadline} onChange={(e) => setNewTaskDeadline(e.target.value)} style={{ padding: 12, borderRadius: 10, border: "1px solid rgba(44,43,40,0.1)", background: "#fff", fontSize: 14, color: "#2c2b28", width: "100%" }} />
                  </div>
                  <button type="submit" style={{ padding: 12, borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, color: "#fff", background: "linear-gradient(135deg,#d6bca3,#b99a7f)", boxShadow: "0 4px 12px rgba(121,86,61,0.15)", transition: "all 0.2s" }}>Kreiraj zadatak</button>
                </form>
              </div>

              <div style={{ padding: 20, border: "1px solid rgba(44,43,40,0.06)", borderRadius: 16, background: "#fff", boxShadow: "0 2px 8px rgba(39,35,30,0.04)", flex: 1 }}>
                <h3 style={{ margin: "0 0 16px", color: "#2c2b28", fontSize: 17 }}>📝 Zadaci ({tasks.length})</h3>
                <div style={{ display: "grid", gap: 12, maxHeight: 500, overflowY: "auto", paddingRight: 8 }}>
                  {tasks.map((t) => (
                    <div key={t.id} style={{ padding: 14, border: "1px solid rgba(44,43,40,0.06)", borderRadius: 12, background: "#fafafa" }}>
                      <div style={{ fontWeight: 700, color: "#2c2b28", fontSize: 15, marginBottom: 4 }}>{t.title}</div>
                      <div style={{ color: "rgba(44,43,40,0.75)", fontSize: 14, marginBottom: 8, lineHeight: 1.5 }}>{t.description}</div>
                      <div style={{ fontSize: 12, color: "#8b7762", fontWeight: 600 }}>🕐 Rok: {t.deadline ? new Date(t.deadline).toLocaleString('sr-RS') : "-"}</div>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <div style={{ textAlign: "center", padding: 40, color: "#8b7762", fontStyle: "italic", background: "#fafafa", borderRadius: 12, border: "1px solid rgba(44,43,40,0.06)" }}>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                      Nema zadataka još.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ padding: 20, border: "1px solid rgba(44,43,40,0.06)", borderRadius: 16, background: "#fff", boxShadow: "0 2px 8px rgba(39,35,30,0.04)" }}>
              <h3 style={{ margin: "0 0 16px", color: "#2c2b28", fontSize: 17 }}>📋 Predata rešenja ({submissions.length})</h3>
              <div style={{ display: "grid", gap: 14, maxHeight: 800, overflowY: "auto", paddingRight: 8 }}>
                {submissions.map((s) => (
                  <div key={s.id} style={{ padding: 18, border: "1px solid rgba(44,43,40,0.06)", borderRadius: 12, background: s.grade ? "#f0fdf4" : "#fafafa", transition: "all 0.2s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: "#2c2b28", fontSize: 16, marginBottom: 6 }}>{s.taskTitle}</div>
                        <div style={{ color: "#8b7762", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>👤 {s.studentName}</div>
                      </div>
                      <div style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: s.grade ? "#dcfce7" : "#fff7e8", color: s.grade ? "#065f46" : "#7a5b32", border: `1px solid ${s.grade ? "rgba(6,95,70,0.12)" : "rgba(122,91,50,0.12)"}`, whiteSpace: "nowrap" }}>
                        {s.grade ? "✅ Ocenjeno" : "⏳ Na čekanju"}
                      </div>
                    </div>
                    <div style={{ fontSize: 14, color: "rgba(44,43,40,0.8)", marginBottom: s.grade ? 12 : 0, padding: 10, background: "#fff", borderRadius: 8, border: "1px solid rgba(44,43,40,0.06)" }}>
                      📄 Fajl: <code style={{ background: "#f5f5f5", padding: "3px 8px", borderRadius: 6, fontWeight: 600, color: "#2c2b28" }}>{s.filePath.startsWith('data:') ? 'Python rešenje (.py)' : s.filePath}</code>
                    </div>
                    {s.grade ? (
                      <div style={{ padding: 14, borderRadius: 10, background: "#fff", border: "1px solid rgba(6,95,70,0.12)", display: "flex", gap: 14, alignItems: "flex-start" }}>
                        <div style={{ flex: 1 }}>
                          {s.comment ? (
                            <div>
                              <div style={{ fontSize: 11, color: "#047857", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>💬 Komentar profesora</div>
                              <div style={{ fontSize: 13, color: "#065f46", lineHeight: 1.6 }}>{s.comment}</div>
                            </div>
                          ) : (
                            <div style={{ fontSize: 13, color: "#8b7762", fontStyle: "italic" }}>Nema komentara</div>
                          )}
                        </div>
                        <div style={{ padding: "8px 14px", borderRadius: 8, background: "linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)", border: "1px solid rgba(6,95,70,0.15)", boxShadow: "0 1px 3px rgba(6,95,70,0.08)", textAlign: "center", minWidth: 80 }}>
                          <div style={{ fontSize: 10, color: "#047857", marginBottom: 2, fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase" }}>Ocena</div>
                          <div style={{ fontSize: 22, fontWeight: 700, color: "#065f46", letterSpacing: "-0.5px", lineHeight: 1 }}>{s.grade}/5</div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                        <button onClick={() => handleDownloadSubmission(s.taskId, s.id)} style={{ flex: 1, padding: "10px 16px", borderRadius: 10, border: "1px solid rgba(44,43,40,0.12)", cursor: "pointer", fontWeight: 600, fontSize: 14, color: "#2c2b28", background: "#fff", boxShadow: "0 1px 3px rgba(39,35,30,0.06)", transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#f5f5f5"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 2px 6px rgba(39,35,30,0.1)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(39,35,30,0.06)"; }}>📥 Preuzmi</button>
                        <button onClick={() => openGradingModal(s)} style={{ flex: 1, padding: "10px 16px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, color: "#fff", background: "linear-gradient(135deg,#d6bca3,#b99a7f)", boxShadow: "0 4px 12px rgba(121,86,61,0.15)", transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(121,86,61,0.2)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(121,86,61,0.15)"; }}>⭐ Oceni</button>
                      </div>
                    )}
                  </div>
                ))}
                {submissions.length === 0 && (
                  <div style={{ textAlign: "center", padding: 60, color: "#8b7762", fontStyle: "italic", background: "#fafafa", borderRadius: 12, border: "1px solid rgba(44,43,40,0.06)" }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>📭</div>
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Nema predatih rešenja</div>
                    <div style={{ fontSize: 13 }}>Kada studenti predaju zadatke, ovde će se pojaviti.</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {isStudent && (
          <>
            <div style={{ marginBottom: 20, padding: 20, border: "1px solid rgba(44,43,40,0.06)", borderRadius: 16, background: "#fff", boxShadow: "0 2px 8px rgba(39,35,30,0.04)" }}>
              <h3 style={{ margin: "0 0 16px", color: "#2c2b28", fontSize: 17 }}>📤 Predaj zadatak</h3>
              <form onSubmit={submitTask} style={{ display: "grid", gap: 14 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 6, color: "#8b7762", fontSize: 13, fontWeight: 600 }}>Izaberi zadatak:</label>
                  <select value={selectedTaskId} onChange={(e) => setSelectedTaskId(e.target.value === "" ? "" : Number(e.target.value))} style={{ padding: 12, borderRadius: 10, border: "1px solid rgba(44,43,40,0.1)", background: "#fff", color: "#2c2b28", fontSize: 14, width: "100%" }}>
                    <option value="">-- Izaberi zadatak --</option>
                    {tasks.map((t) => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 6, color: "#8b7762", fontSize: 13, fontWeight: 600 }}>Python fajl (.py):</label>
                  <input id="file-upload" type="file" accept=".py,text/x-python" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(44,43,40,0.1)", background: "#fff", width: "100%", cursor: "pointer", fontSize: 14 }} />
                  {selectedFile && (
                    <div style={{ marginTop: 10, padding: 12, borderRadius: 10, background: "linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)", border: "1px solid rgba(6,95,70,0.12)" }}>
                      <div style={{ fontSize: 12, color: "#047857", fontWeight: 600, marginBottom: 4 }}>✅ Odabran fajl:</div>
                      <div style={{ fontSize: 13, color: "#065f46", fontWeight: 600 }}>📄 {selectedFile.name}</div>
                      <div style={{ fontSize: 12, color: "#8b7762", marginTop: 2 }}>Veličina: {(selectedFile.size / 1024).toFixed(2)} KB</div>
                    </div>
                  )}
                </div>
                <button type="submit" disabled={submitting} style={{ padding: 12, borderRadius: 10, border: "none", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.6 : 1, fontWeight: 600, fontSize: 14, color: "#fff", background: "linear-gradient(135deg,#d6bca3,#b99a7f)", boxShadow: submitting ? "none" : "0 4px 12px rgba(121,86,61,0.15)", transition: "all 0.2s" }}>{submitting ? "Predaja u toku..." : "📤 Predaj rešenje"}</button>
              </form>
            </div>
            <div style={{ marginBottom: 20, padding: 20, border: "1px solid rgba(44,43,40,0.06)", borderRadius: 16, background: "#fff", boxShadow: "0 2px 8px rgba(39,35,30,0.04)" }}>
              <h3 style={{ margin: "0 0 16px", color: "#2c2b28", fontSize: 17 }}>📝 Zadaci</h3>
              <div style={{ display: "grid", gap: 12 }}>
                {tasks.map((t) => (
                  <div key={t.id} style={{ padding: 14, border: "1px solid rgba(44,43,40,0.06)", borderRadius: 12, background: "#fafafa" }}>
                    <div style={{ fontWeight: 700, color: "#2c2b28", fontSize: 15, marginBottom: 4 }}>{t.title}</div>
                    <div style={{ color: "rgba(44,43,40,0.75)", fontSize: 14, marginBottom: 8, lineHeight: 1.5 }}>{t.description}</div>
                    <div style={{ fontSize: 12, color: "#8b7762", fontWeight: 600 }}>🕐 Rok: {t.deadline ? new Date(t.deadline).toLocaleString('sr-RS') : "-"}</div>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <div style={{ textAlign: "center", padding: 40, color: "#8b7762", fontStyle: "italic", background: "#fafafa", borderRadius: 12, border: "1px solid rgba(44,43,40,0.06)" }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                    Nema zadataka još.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {gradingSubmission && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }} onClick={closeGradingModal}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, maxWidth: 500, width: "100%", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 16px", color: "#2c2b28", fontSize: 20 }}>Oceni rešenje</h3>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, color: "#8b7762", marginBottom: 4 }}><strong>Zadatak:</strong> {gradingSubmission.taskTitle}</div>
              <div style={{ fontSize: 14, color: "#8b7762" }}><strong>Student:</strong> {gradingSubmission.studentName}</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, color: "#8b7762", fontSize: 13, fontWeight: 600 }}>Ocena (1-5):</label>
              <input type="number" min="1" max="5" value={gradeValue} onChange={(e) => setGradeValue(e.target.value)} placeholder="Unesi ocenu" style={{ padding: 12, borderRadius: 10, border: "1px solid rgba(44,43,40,0.1)", background: "#fff", fontSize: 14, color: "#2c2b28", width: "100%" }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 6, color: "#8b7762", fontSize: 13, fontWeight: 600 }}>Komentar (opciono):</label>
              <textarea value={gradeComment} onChange={(e) => setGradeComment(e.target.value)} placeholder="Napišite komentar..." style={{ padding: 12, borderRadius: 10, border: "1px solid rgba(44,43,40,0.1)", background: "#fff", fontSize: 14, color: "#2c2b28", width: "100%", minHeight: 100, fontFamily: "inherit", resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button onClick={closeGradingModal} style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid rgba(44,43,40,0.12)", cursor: "pointer", fontWeight: 600, fontSize: 14, color: "#2c2b28", background: "#fff", transition: "all 0.2s" }}>Otkaži</button>
              <button onClick={submitGrade} style={{ padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, color: "#fff", background: "linear-gradient(135deg,#d6bca3,#b99a7f)", boxShadow: "0 4px 12px rgba(121,86,61,0.15)", transition: "all 0.2s" }}>Postavi ocenu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}