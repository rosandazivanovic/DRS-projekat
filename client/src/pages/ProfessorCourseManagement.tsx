import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { http } from "../api/https";
import { endpoints } from "../api/endpoints";
import type { Course } from "../types/courses";
import type { TaskSubmission } from "../types/tasks"; 
import { useAuth } from "../auth/AuthContext";

type Student = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: "STUDENT" | "PROFESOR" | "ADMIN";
};

type Enrollment = {
  id: number;
  studentId: number;
  studentName: string;
  enrolledAt: string;
};

export default function ProfessorCourseManagementPage() {
  const { id } = useParams<{ id?: string }>();
  const courseId = id ? Number(id) : null;
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);

  // Forme za izmenu kursa
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Upload materijala
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [uploadingMaterial, setUploadingMaterial] = useState(false);

  // Dodavanje studenata
  const [showAddStudents, setShowAddStudents] = useState(false);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<Enrollment[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | "">("");
  const [addingStudent, setAddingStudent] = useState(false);

  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [showSubmissions, setShowSubmissions] = useState(false);

  useEffect(() => {
    if (courseId === null) return;
    fetchCourse(courseId);
    fetchEnrolledStudents(courseId);
  }, [courseId]);

  const fetchCourse = async (cid: number) => {
    setLoading(true);
    try {
      const res = await http.get(endpoints.courses.byId(cid));
      const data = res.data;
      setCourse(data);
      setEditName(data.name);
      setEditDescription(data.description);
    } catch (err) {
      console.error("fetchCourse error:", err);
      alert("Greška pri učitavanju kursa");
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledStudents = async (cid: number) => {
    try {
      const res = await http.get(endpoints.courses.students(cid));
      setEnrolledStudents(res.data || []);
    } catch (err) {
      console.error("fetchEnrolledStudents error:", err);
    }
  };

  const fetchSubmissions = async () => {
    if (courseId === null) return;
    
    setLoadingSubmissions(true);
    try {
      const res = await http.get(endpoints.courses.allSubmissions(courseId));
      setSubmissions(res.data || []);
      setShowSubmissions(true);
    } catch (err) {
      console.error("fetchSubmissions error:", err);
      alert("Greška pri učitavanju rešenja");
    } finally {
      setLoadingSubmissions(false);
    }
  };

const fetchAvailableStudents = async () => {
  try {
    const res = await http.get(endpoints.courses.availableStudents);
    const allStudents = res.data;
    
    const enrolledIds = new Set(enrolledStudents.map(e => e.studentId));
    const students = allStudents.filter(
      (s: Student) => !enrolledIds.has(s.id)
    );
    
    setAvailableStudents(students);
  } catch (err) {
    console.error("fetchAvailableStudents error:", err);
    alert("Greška pri učitavanju studenata");
  }
};

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editName.trim() || !editDescription.trim()) {
      alert("Naziv i opis ne mogu biti prazni!");
      return;
    }

    if (courseId === null) return;

    try {
      await http.patch(endpoints.courses.update(courseId), {
        name: editName.trim(),
        description: editDescription.trim(),
      });
      
      alert("Kurs uspešno ažuriran! ✅");
      setIsEditing(false);
      fetchCourse(courseId);
    } catch (err: any) {
      alert(err?.response?.data?.error ?? "Greška pri ažuriranju kursa.");
    }
  };

  const handleDeleteCourse = async () => {
    if (!confirm("Da li ste sigurni da želite da obrišete ovaj kurs?\n\nOvo će obrisati sve zadatke i rešenja!")) {
      return;
    }

    if (courseId === null) return;

    try {
      await http.delete(endpoints.courses.delete(courseId));
      alert("Kurs uspešno obrisan! ✅");
      navigate("/professor/courses");
    } catch (err: any) {
      alert(err?.response?.data?.error ?? "Greška pri brisanju kursa.");
    }
  };

const handleMaterialUpload = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!materialFile) {
    alert("Molimo izaberite PDF fajl!");
    return;
  }

  if (!materialFile.name.toLowerCase().endsWith('.pdf')) {
    alert("Fajl mora biti u PDF formatu!");
    return;
  }

  const maxSize = 10 * 1024 * 1024;
  if (materialFile.size > maxSize) {
    alert("Fajl je prevelik! Maksimalna veličina je 10MB.");
    return;
  }

  if (courseId === null) return;

  setUploadingMaterial(true);

  try {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      
      await http.post(endpoints.courses.material(courseId), {
        materialPath: base64Data, 
        fileName: materialFile.name, 
      });

      alert("Materijal uspešno okačen! ✅");
      setMaterialFile(null);
      fetchCourse(courseId);
      setUploadingMaterial(false);
    };
    
    reader.onerror = () => {
      alert("Greška pri čitanju fajla");
      setUploadingMaterial(false);
    };
    
    reader.readAsDataURL(materialFile);
    
  } catch (err: any) {
    alert(err?.response?.data?.error ?? "Greška pri upload-u materijala.");
    setUploadingMaterial(false);
  }
};

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedStudentId === "") {
      alert("Molimo izaberite studenta!");
      return;
    }


    if (courseId === null) return;

    setAddingStudent(true);

    try {
      await http.post(`/api/courses/${courseId}/enroll-student`, {
        studentId: selectedStudentId,
      });

      alert("Student uspešno dodat na kurs! ✅");
      setSelectedStudentId("");
      setShowAddStudents(false);
      fetchEnrolledStudents(courseId);
    } catch (err: any) {
      alert(err?.response?.data?.error ?? "Greška pri dodavanju studenta.");
    } finally {
      setAddingStudent(false);
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
      
      alert(`Fajl preuzet: ${data.fileName} ✅`);
    } catch (err: any) {
      alert(err?.response?.data?.error ?? "Greška pri preuzimanju fajla");
    }
  };

  const handleGradeSubmission = async (submissionId: number) => {
    const gradeStr = prompt("Unesite ocenu (1-5):");
    if (!gradeStr) return;
    
    const grade = parseInt(gradeStr, 10);
    if (isNaN(grade) || grade < 1 || grade > 5) {
      alert("Ocena mora biti broj između 1 i 5!");
      return;
    }

    const comment = prompt("Komentar (opciono):") || "";

    try {
      await http.post(endpoints.tasks.grade(submissionId), {
        grade,
        comment,
      });
      
      alert("Ocena uspešno postavljena! ✅");
      fetchSubmissions(); 
    } catch (err: any) {
      alert(err?.response?.data?.error ?? "Greška pri ocenjivanju.");
    }
  };

  if (!user || !hasRole(["PROFESOR"])) {
    return <div style={{ padding: 16 }}>Nemate pristup ovoj stranici.</div>;
  }

  if (loading || !course) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#8b7762" }}>
        Učitavanje...
      </div>
    );
  }

  if (course.professorId !== user.id) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#7a2a2a" }}>
        Nemate dozvolu za upravljanje ovim kursom.
      </div>
    );
  }

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
          maxWidth: 1000,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 20,
          padding: 28,
          boxShadow: "0 20px 40px rgba(39,35,30,0.04)",
        }}
      >
        <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <Link
              to="/professor/courses"
              style={{ color: "#9a7556", textDecoration: "none", fontSize: 14, marginBottom: 8, display: "inline-block" }}
            >
              ← Nazad na moje kurseve
            </Link>
            <h2 style={{ margin: "8px 0 0", color: "#2c2b28" }}>
              🎓 Upravljanje kursom
            </h2>
            <p style={{ margin: "6px 0 0", color: "#8b7762" }}>
              {course.name}
            </p>
          </div>

          <button
            onClick={handleDeleteCourse}
            style={{
              padding: "8px 16px",
              borderRadius: 10,
              border: "1px solid rgba(180,130,130,0.12)",
              cursor: "pointer",
              fontWeight: 600,
              color: "#7a2a2a",
              background: "#fff5f5",
            }}
          >
            🗑️ Obriši kurs
          </button>
        </div>

        <div
          style={{
            marginBottom: 24,
            padding: 18,
            border: "1px solid rgba(44,43,40,0.06)",
            borderRadius: 16,
            background: "#fffaf6",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ margin: 0, color: "#2c2b28" }}>✏️ Informacije o kursu</h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  color: "#fff",
                  background: "linear-gradient(135deg,#d6bca3,#b99a7f)",
                  fontSize: 13,
                }}
              >
                Izmeni
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdateCourse} style={{ display: "grid", gap: 12 }}>
              <input
                placeholder="Naziv kursa"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                style={{
                  padding: 10,
                  borderRadius: 10,
                  border: "1px solid rgba(44,43,40,0.06)",
                  background: "#fff",
                }}
              />
              <textarea
                placeholder="Opis kursa"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                style={{
                  padding: 10,
                  borderRadius: 10,
                  border: "1px solid rgba(44,43,40,0.06)",
                  minHeight: 100,
                  background: "#fff",
                }}
              />
              <div style={{ display: "flex", gap: 10 }}>
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
                  Sačuvaj izmene
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditName(course.name);
                    setEditDescription(course.description);
                  }}
                  style={{
                    padding: 10,
                    borderRadius: 10,
                    border: "1px solid rgba(44,43,40,0.06)",
                    cursor: "pointer",
                    fontWeight: 600,
                    color: "#2c2b28",
                    background: "#fff",
                  }}
                >
                  Otkaži
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div style={{ fontWeight: 700, color: "#2c2b28", marginBottom: 8 }}>
                {course.name}
              </div>
              <div style={{ color: "rgba(44,43,40,0.8)", fontSize: 14 }}>
                {course.description}
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            marginBottom: 24,
            padding: 18,
            border: "1px solid rgba(44,43,40,0.06)",
            borderRadius: 16,
            background: "#fffaf6",
          }}
        >
          <h3 style={{ margin: "0 0 14px", color: "#2c2b28" }}>📄 Materijal za učenje</h3>
          
          {course.materialPath ? (
            <div
              style={{
                padding: 14,
                borderRadius: 10,
                background: "#e9fbf4",
                border: "1px solid rgba(6,95,70,0.08)",
                marginBottom: 14,
              }}
            >
              <div style={{ fontWeight: 600, color: "#065f46", marginBottom: 4 }}>
                ✅ Materijal okačen
              </div>
              <div style={{ fontSize: 13, color: "#047857" }}>
                {course.materialPath.startsWith("data:") ? (
                  <>PDF fajl ({Math.round(course.materialPath.length / 1024)} KB)</>
                ) : (
                  <>Fajl: {course.materialPath.split('/').pop()}</>
                )}
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: 12,
                borderRadius: 10,
                background: "#fff7e8",
                border: "1px solid rgba(122,91,50,0.08)",
                marginBottom: 14,
                color: "#7a5b32",
                fontSize: 13,
              }}
            >
              ⚠️ Materijal još nije okačen
            </div>
          )}

          <form onSubmit={handleMaterialUpload} style={{ display: "grid", gap: 12 }}>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  color: "#8b7762",
                  fontSize: 13,
                }}
              >
                {course.materialPath ? "Zameni materijal:" : "Izaberite PDF fajl (max 10MB):"}
              </label>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => setMaterialFile(e.target.files?.[0] || null)}
                style={{
                  padding: 10,
                  borderRadius: 10,
                  border: "1px solid rgba(44,43,40,0.06)",
                  background: "#fff",
                  width: "100%",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={uploadingMaterial || !materialFile}
              style={{
                padding: 10,
                borderRadius: 10,
                border: "none",
                cursor: uploadingMaterial || !materialFile ? "not-allowed" : "pointer",
                opacity: uploadingMaterial || !materialFile ? 0.6 : 1,
                fontWeight: 600,
                color: "#fff",
                background: "linear-gradient(135deg,#d6bca3,#b99a7f)",
              }}
            >
              {uploadingMaterial ? "Upload u toku..." : course.materialPath ? "Zameni materijal" : "Okači materijal"}
            </button>
          </form>
        </div>

        <div
          style={{
            marginBottom: 24,
            padding: 18,
            border: "1px solid rgba(44,43,40,0.06)",
            borderRadius: 16,
            background: "#fffaf6",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ margin: 0, color: "#2c2b28" }}>
              👥 Studenti ({enrolledStudents.length})
            </h3>
            {!showAddStudents && (
              <button
                onClick={() => {
                  setShowAddStudents(true);
                  fetchAvailableStudents();
                }}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  color: "#fff",
                  background: "linear-gradient(135deg,#d6bca3,#b99a7f)",
                  fontSize: 13,
                }}
              >
                ➕ Dodaj studenta
              </button>
            )}
          </div>

          {showAddStudents && (
            <div
              style={{
                marginBottom: 16,
                padding: 14,
                borderRadius: 12,
                background: "#fff",
                border: "1px solid rgba(44,43,40,0.06)",
              }}
            >
              <form onSubmit={handleAddStudent} style={{ display: "grid", gap: 12 }}>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value === "" ? "" : Number(e.target.value))}
                  style={{
                    padding: 10,
                    borderRadius: 10,
                    border: "1px solid rgba(44,43,40,0.06)",
                    background: "#fff",
                  }}
                >
                  <option value="">Izaberi studenta</option>
                  {availableStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.email})
                    </option>
                  ))}
                </select>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="submit"
                    disabled={addingStudent}
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      border: "none",
                      cursor: addingStudent ? "not-allowed" : "pointer",
                      opacity: addingStudent ? 0.6 : 1,
                      fontWeight: 600,
                      color: "#fff",
                      background: "linear-gradient(135deg,#d6bca3,#b99a7f)",
                    }}
                  >
                    {addingStudent ? "Dodavanje..." : "Dodaj"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddStudents(false);
                      setSelectedStudentId("");
                    }}
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      border: "1px solid rgba(44,43,40,0.06)",
                      cursor: "pointer",
                      fontWeight: 600,
                      color: "#2c2b28",
                      background: "#fff",
                    }}
                  >
                    Otkaži
                  </button>
                </div>
              </form>
            </div>
          )}

          <div style={{ display: "grid", gap: 10 }}>
            {enrolledStudents.map((e) => (
              <div
                key={e.id}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  background: "#fff",
                  border: "1px solid rgba(44,43,40,0.06)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: "#2c2b28" }}>
                    {e.studentName}
                  </div>
                  <div style={{ fontSize: 12, color: "#8b7762" }}>
                    Upisan: {new Date(e.enrolledAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
            {enrolledStudents.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: 20,
                  color: "#8b7762",
                  fontStyle: "italic",
                }}
              >
                Nema upisanih studenata.
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            marginBottom: 24,
            padding: 18,
            border: "1px solid rgba(44,43,40,0.06)",
            borderRadius: 16,
            background: "#fffaf6",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ margin: 0, color: "#2c2b28" }}>
              📋 Predata rešenja
            </h3>
            {!showSubmissions && (
              <button
                onClick={fetchSubmissions}
                disabled={loadingSubmissions}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "none",
                  cursor: loadingSubmissions ? "not-allowed" : "pointer",
                  opacity: loadingSubmissions ? 0.6 : 1,
                  fontWeight: 600,
                  color: "#fff",
                  background: "linear-gradient(135deg,#d6bca3,#b99a7f)",
                  fontSize: 13,
                }}
              >
                {loadingSubmissions ? "Učitavanje..." : "Prikaži rešenja"}
              </button>
            )}
          </div>

          {showSubmissions && (
            <>
              {submissions.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: 20,
                    color: "#8b7762",
                    fontStyle: "italic",
                  }}
                >
                  Nema predatih rešenja.
                </div>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {submissions.map((sub) => (
                    <div
                      key={sub.id}
                      style={{
                        padding: 14,
                        borderRadius: 12,
                        background: "#fff",
                        border: "1px solid rgba(44,43,40,0.06)",
                      }}
                    >
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontWeight: 700, color: "#2c2b28", fontSize: 15 }}>
                          {sub.taskTitle}
                        </div>
                        <div style={{ color: "#8b7762", fontSize: 13, marginTop: 2 }}>
                          Student: {sub.studentName}
                        </div>
                        <div style={{ color: "rgba(44,43,40,0.7)", fontSize: 13, marginTop: 4 }}>
                          Fajl: <code style={{ background: "#f5f5f5", padding: "2px 6px", borderRadius: 4 }}>
                            {sub.filePath.startsWith('data:') ? 'Python rešenje (.py)' : sub.filePath}
                          </code>
                        </div>
                        <div style={{ fontSize: 12, color: "#8b7762", marginTop: 4 }}>
                          Predato: {new Date(sub.submittedAt).toLocaleString()}
                        </div>
                      </div>

                      {sub.grade !== null ? (
                        <div
                          style={{
                            padding: 10,
                            borderRadius: 8,
                            background: "#e9fbf4",
                            border: "1px solid rgba(6,95,70,0.08)",
                          }}
                        >
                          <div style={{ fontWeight: 600, color: "#065f46", fontSize: 14 }}>
                            ✅ Ocenjeno: {sub.grade}/5
                          </div>
                          {sub.comment && (
                            <div style={{ color: "#065f46", fontSize: 13, marginTop: 4 }}>
                              Komentar: {sub.comment}
                            </div>
                          )}
                          {sub.gradedAt && (
                            <div style={{ fontSize: 11, color: "#8b7762", marginTop: 4 }}>
                              Ocenjeno: {new Date(sub.gradedAt).toLocaleString()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                          <button
                            onClick={() => handleDownloadSubmission(sub.taskId, sub.id)}
                            style={{
                              padding: "8px 14px",
                              borderRadius: 8,
                              border: "1px solid rgba(44,43,40,0.06)",
                              cursor: "pointer",
                              fontWeight: 600,
                              color: "#2c2b28",
                              background: "#fff",
                              fontSize: 13,
                            }}
                          >
                            📥 Preuzmi rešenje
                          </button>
                          
                          <button
                            onClick={() => handleGradeSubmission(sub.id)}
                            style={{
                              padding: "8px 14px",
                              borderRadius: 8,
                              border: "none",
                              cursor: "pointer",
                              fontWeight: 600,
                              color: "#fff",
                              background: "linear-gradient(135deg,#d6bca3,#b99a7f)",
                              fontSize: 13,
                            }}
                          >
                            ⭐ Oceni rešenje
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowSubmissions(false)}
                style={{
                  marginTop: 12,
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "1px solid rgba(44,43,40,0.06)",
                  cursor: "pointer",
                  fontWeight: 600,
                  color: "#2c2b28",
                  background: "#fff",
                  fontSize: 13,
                }}
              >
                Sakrij rešenja
              </button>
            </>
          )}
        </div>

        <div style={{ textAlign: "center" }}>
          <Link
            to={`/courses/${courseId}`}
            style={{
              display: "inline-block",
              padding: "12px 24px",
              borderRadius: 12,
              border: "none",
              fontWeight: 600,
              color: "#fff",
              background: "linear-gradient(135deg,#d6bca3,#b99a7f)",
              textDecoration: "none",
            }}
          >
            📝 Upravljaj zadacima
          </Link>
        </div>
      </div>
    </div>
  );
}