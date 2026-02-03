import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { http } from "../../api/https";
import { endpoints } from "../../api/endpoints";
import type { Course } from "../../types/courses";
import { useAuth } from "../../auth/AuthContext";

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

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [uploadingMaterial, setUploadingMaterial] = useState(false);

  const [showAddStudents, setShowAddStudents] = useState(false);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<Enrollment[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | "">("");
  const [addingStudent, setAddingStudent] = useState(false);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err: any) {
      console.error("fetchCourse error:", err);
      setError("Greška pri učitavanju kursa");
      setTimeout(() => setError(null), 3000);
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
      setError("Greška pri učitavanju studenata");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editName.trim() || !editDescription.trim()) {
      setError("Naziv i opis ne mogu biti prazni!");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (courseId === null) return;

    try {
      await http.patch(endpoints.courses.update(courseId), {
        name: editName.trim(),
        description: editDescription.trim(),
      });

      setSuccessMessage("Kurs uspešno ažuriran! ✅");
      setTimeout(() => setSuccessMessage(null), 3000);
      setIsEditing(false);
      fetchCourse(courseId);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Greška pri ažuriranju kursa.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteCourse = async () => {
    if (!confirm("Da li ste sigurni da želite da obrišete ovaj kurs?\n\nOvo će obrisati sve zadatke i rešenja!")) {
      return;
    }

    if (courseId === null) return;

    try {
      await http.delete(endpoints.courses.delete(courseId));
      setSuccessMessage("Kurs uspešno obrisan! ✅");
      setTimeout(() => setSuccessMessage(null), 3000);
      navigate("/professor/courses");
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Greška pri brisanju kursa.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleMaterialUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!materialFile) {
      setError("Molimo izaberite PDF fajl!");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!materialFile.name.toLowerCase().endsWith('.pdf')) {
      setError("Fajl mora biti u PDF formatu!");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (materialFile.size > maxSize) {
      setError("Fajl je prevelik! Maksimalna veličina je 10MB.");
      setTimeout(() => setError(null), 3000);
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

        setSuccessMessage("Materijal uspešno okačen! ✅");
        setTimeout(() => setSuccessMessage(null), 3000);
        setMaterialFile(null);
        fetchCourse(courseId);
        setUploadingMaterial(false);
      };

      reader.onerror = () => {
        setError("Greška pri čitanju fajla");
        setTimeout(() => setError(null), 3000);
        setUploadingMaterial(false);
      };

      reader.readAsDataURL(materialFile);

    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Greška pri upload-u materijala.");
      setTimeout(() => setError(null), 3000);
      setUploadingMaterial(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedStudentId === "") {
      setError("Molimo izaberite studenta!");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (courseId === null) return;

    setAddingStudent(true);

    try {
      await http.post(`/api/courses/${courseId}/enroll-student`, {
        studentId: selectedStudentId,
      });

      setSuccessMessage("Student uspešno dodat na kurs! ✅");
      setTimeout(() => setSuccessMessage(null), 3000);
      setSelectedStudentId("");
      setShowAddStudents(false);
      fetchEnrolledStudents(courseId);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Greška pri dodavanju studenta.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setAddingStudent(false);
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
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {/* Header sa breadcrumb i delete button */}
        <div style={{ 
          marginBottom: 24, 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          background: "#fff",
          padding: 20,
          borderRadius: 16,
          boxShadow: "0 2px 8px rgba(39,35,30,0.04)",
        }}>
          <div>
            <Link
              to="/professor/courses"
              style={{ 
                color: "#9a7556", 
                textDecoration: "none", 
                fontSize: 14, 
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 8,
                fontWeight: 500,
              }}
            >
              ← Nazad na moje kurseve
            </Link>
            <h2 style={{ margin: 0, color: "#2c2b28", fontSize: 24 }}>
              🎓 {course.name}
            </h2>
            <p style={{ margin: "4px 0 0", color: "#8b7762", fontSize: 14 }}>
              Upravljanje kursom
            </p>
          </div>

          <button
            onClick={handleDeleteCourse}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              border: "1px solid rgba(180,130,130,0.2)",
              cursor: "pointer",
              fontWeight: 600,
              color: "#7a2a2a",
              background: "#fff5f5",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#ffe5e5";
              e.currentTarget.style.borderColor = "rgba(180,130,130,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff5f5";
              e.currentTarget.style.borderColor = "rgba(180,130,130,0.2)";
            }}
          >
            🗑️ Obriši kurs
          </button>
        </div>

        {successMessage && (
          <div
            style={{
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
            }}
          >
            ✅ {successMessage}
          </div>
        )}

        {error && (
          <div
            style={{
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
            }}
          >
            ❌ {error}
          </div>
        )}

        {/* Grid layout sa 2 kolone */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "2fr 1fr",
          gap: 24,
        }}>
          {/* Leva kolona - Glavni sadržaj */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* Informacije o kursu */}
            <div
              style={{
                padding: 24,
                border: "1px solid rgba(44,43,40,0.06)",
                borderRadius: 16,
                background: "#fff",
                boxShadow: "0 2px 8px rgba(39,35,30,0.04)",
              }}
            >
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                marginBottom: 20,
                paddingBottom: 16,
                borderBottom: "2px solid #f5f0ea",
              }}>
                <h3 style={{ margin: 0, color: "#2c2b28", fontSize: 18, display: "flex", alignItems: "center", gap: 10 }}>
                  ✏️ Informacije o kursu
                </h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 600,
                      color: "#fff",
                      background: "linear-gradient(135deg,#d6bca3,#b99a7f)",
                      fontSize: 13,
                      transition: "all 0.2s",
                    }}
                  >
                    Izmeni
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdateCourse} style={{ display: "grid", gap: 16 }}>
                  <div>
                    <label style={{ 
                      display: "block", 
                      marginBottom: 8, 
                      color: "#2c2b28", 
                      fontSize: 14,
                      fontWeight: 600,
                    }}>
                      Naziv kursa
                    </label>
                    <input
                      placeholder="Naziv kursa"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={{
                        width: "100%",
                        padding: 12,
                        borderRadius: 10,
                        border: "1px solid rgba(44,43,40,0.12)",
                        background: "#fff",
                        fontSize: 14,
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ 
                      display: "block", 
                      marginBottom: 8, 
                      color: "#2c2b28", 
                      fontSize: 14,
                      fontWeight: 600,
                    }}>
                      Opis kursa
                    </label>
                    <textarea
                      placeholder="Opis kursa"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      style={{
                        width: "100%",
                        padding: 12,
                        borderRadius: 10,
                        border: "1px solid rgba(44,43,40,0.12)",
                        minHeight: 120,
                        background: "#fff",
                        fontSize: 14,
                        resize: "vertical",
                      }}
                    />
                  </div>
                  
                  <div style={{ display: "flex", gap: 12 }}>
                    <button
                      type="submit"
                      style={{
                        padding: "10px 20px",
                        borderRadius: 10,
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 600,
                        color: "#fff",
                        background: "linear-gradient(135deg,#d6bca3,#b99a7f)",
                        fontSize: 14,
                      }}
                    >
                      💾 Sačuvaj izmene
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setEditName(course.name);
                        setEditDescription(course.description);
                      }}
                      style={{
                        padding: "10px 20px",
                        borderRadius: 10,
                        border: "1px solid rgba(44,43,40,0.12)",
                        cursor: "pointer",
                        fontWeight: 600,
                        color: "#2c2b28",
                        background: "#fff",
                        fontSize: 14,
                      }}
                    >
                      Otkaži
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div style={{ 
                    fontWeight: 600, 
                    color: "#2c2b28", 
                    marginBottom: 4,
                    fontSize: 15,
                  }}>
                    Naziv
                  </div>
                  <div style={{ 
                    color: "rgba(44,43,40,0.9)", 
                    fontSize: 14, 
                    marginBottom: 16,
                    padding: 12,
                    background: "#f9f6f2",
                    borderRadius: 8,
                  }}>
                    {course.name}
                  </div>
                  
                  <div style={{ 
                    fontWeight: 600, 
                    color: "#2c2b28", 
                    marginBottom: 4,
                    fontSize: 15,
                  }}>
                    Opis
                  </div>
                  <div style={{ 
                    color: "rgba(44,43,40,0.9)", 
                    fontSize: 14,
                    lineHeight: 1.6,
                    padding: 12,
                    background: "#f9f6f2",
                    borderRadius: 8,
                  }}>
                    {course.description}
                  </div>
                </div>
              )}
            </div>

            {/* Materijal za učenje */}
            <div
              style={{
                padding: 24,
                border: "1px solid rgba(44,43,40,0.06)",
                borderRadius: 16,
                background: "#fff",
                boxShadow: "0 2px 8px rgba(39,35,30,0.04)",
              }}
            >
              <h3 style={{ 
                margin: "0 0 20px", 
                color: "#2c2b28", 
                fontSize: 18,
                display: "flex",
                alignItems: "center",
                gap: 10,
                paddingBottom: 16,
                borderBottom: "2px solid #f5f0ea",
              }}>
                📄 Materijal za učenje
              </h3>
              
              {course.materialPath ? (
                <div
                  style={{
                    padding: 16,
                    borderRadius: 10,
                    background: "#e9fbf4",
                    border: "1px solid rgba(6,95,70,0.12)",
                    marginBottom: 16,
                  }}
                >
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 12,
                  }}>
                    <div style={{ 
                      fontSize: 32,
                      lineHeight: 1,
                    }}>
                      ✅
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: "#065f46", marginBottom: 2 }}>
                        Materijal okačen
                      </div>
                      <div style={{ fontSize: 13, color: "#047857" }}>
                        {course.materialPath.startsWith("data:") ? (
                          <>PDF fajl ({Math.round(course.materialPath.length / 1024)} KB)</>
                        ) : (
                          <>Fajl: {course.materialPath.split('/').pop()}</>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: 16,
                    borderRadius: 10,
                    background: "#fff7e8",
                    border: "1px solid rgba(122,91,50,0.12)",
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div style={{ fontSize: 24 }}>⚠️</div>
                  <div style={{ color: "#7a5b32", fontSize: 14 }}>
                    Materijal još nije okačen
                  </div>
                </div>
              )}

              <form onSubmit={handleMaterialUpload} style={{ display: "grid", gap: 14 }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      color: "#2c2b28",
                      fontSize: 14,
                      fontWeight: 600,
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
                      border: "1px solid rgba(44,43,40,0.12)",
                      background: "#fff",
                      width: "100%",
                      fontSize: 14,
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={uploadingMaterial || !materialFile}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    border: "none",
                    cursor: uploadingMaterial || !materialFile ? "not-allowed" : "pointer",
                    opacity: uploadingMaterial || !materialFile ? 0.6 : 1,
                    fontWeight: 600,
                    color: "#fff",
                    background: "linear-gradient(135deg,#d6bca3,#b99a7f)",
                    fontSize: 14,
                  }}
                >
                  {uploadingMaterial ? "⏳ Upload..." : course.materialPath ? "🔄 Zameni materijal" : "📤 Okači materijal"}
                </button>
              </form>
            </div>
          </div>

          {/* Desna kolona - Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* Studenti */}
            <div
              style={{
                padding: 20,
                border: "1px solid rgba(44,43,40,0.06)",
                borderRadius: 16,
                background: "#fff",
                boxShadow: "0 2px 8px rgba(39,35,30,0.04)",
              }}
            >
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                marginBottom: 16,
                paddingBottom: 14,
                borderBottom: "2px solid #f5f0ea",
              }}>
                <h3 style={{ 
                  margin: 0, 
                  color: "#2c2b28", 
                  fontSize: 17,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}>
                  👥 Studenti
                  <span style={{
                    fontSize: 13,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 12,
                    background: "#f0fdf4",
                    color: "#065f46",
                  }}>
                    {enrolledStudents.length}
                  </span>
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
                      fontSize: 12,
                    }}
                  >
                    ➕ Dodaj
                  </button>
                )}
              </div>

              {showAddStudents && (
                <div
                  style={{
                    marginBottom: 16,
                    padding: 14,
                    borderRadius: 10,
                    background: "#f9f6f2",
                    border: "1px solid rgba(44,43,40,0.08)",
                  }}
                >
                  <form onSubmit={handleAddStudent} style={{ display: "grid", gap: 10 }}>
                    <select
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value === "" ? "" : Number(e.target.value))}
                      style={{
                        padding: 10,
                        borderRadius: 8,
                        border: "1px solid rgba(44,43,40,0.12)",
                        background: "#fff",
                        fontSize: 13,
                      }}
                    >
                      <option value="">Izaberi studenta</option>
                      {availableStudents.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.firstName} {s.lastName}
                        </option>
                      ))}
                    </select>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="submit"
                        disabled={addingStudent}
                        style={{
                          flex: 1,
                          padding: 8,
                          borderRadius: 8,
                          border: "none",
                          cursor: addingStudent ? "not-allowed" : "pointer",
                          opacity: addingStudent ? 0.6 : 1,
                          fontWeight: 600,
                          color: "#fff",
                          background: "linear-gradient(135deg,#d6bca3,#b99a7f)",
                          fontSize: 13,
                        }}
                      >
                        {addingStudent ? "⏳" : "✅ Dodaj"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddStudents(false);
                          setSelectedStudentId("");
                        }}
                        style={{
                          padding: 8,
                          borderRadius: 8,
                          border: "1px solid rgba(44,43,40,0.12)",
                          cursor: "pointer",
                          fontWeight: 600,
                          color: "#2c2b28",
                          background: "#fff",
                          fontSize: 13,
                        }}
                      >
                        ✖️
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div style={{ display: "grid", gap: 10, maxHeight: 400, overflowY: "auto" }}>
                {enrolledStudents.map((e) => (
                  <div
                    key={e.id}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      background: "#fafafa",
                      border: "1px solid rgba(44,43,40,0.06)",
                    }}
                  >
                    <div style={{ fontWeight: 600, color: "#2c2b28", fontSize: 14 }}>
                      {e.studentName}
                    </div>
                    <div style={{ fontSize: 11, color: "#8b7762", marginTop: 4 }}>
                      📅 {new Date(e.enrolledAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {enrolledStudents.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: 24,
                      color: "#8b7762",
                      fontStyle: "italic",
                      fontSize: 13,
                    }}
                  >
                    Nema upisanih studenata.
                  </div>
                )}
              </div>
            </div>

            {/* Brzi linkovi */}
            <div
              style={{
                padding: 20,
                border: "1px solid rgba(44,43,40,0.06)",
                borderRadius: 16,
                background: "#fff",
                boxShadow: "0 2px 8px rgba(39,35,30,0.04)",
              }}
            >
              <h3 style={{ 
                margin: "0 0 16px", 
                color: "#2c2b28", 
                fontSize: 17,
                paddingBottom: 14,
                borderBottom: "2px solid #f5f0ea",
              }}>
                🔗 Brzi linkovi
              </h3>
              
              <div style={{ display: "grid", gap: 10 }}>
                <Link
                  to={`/courses/${courseId}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: "1px solid rgba(44,43,40,0.08)",
                    fontWeight: 600,
                    color: "#2c2b28",
                    background: "#fafafa",
                    textDecoration: "none",
                    fontSize: 14,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f0f0f0";
                    e.currentTarget.style.transform = "translateX(4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#fafafa";
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  📝 Upravljaj zadacima
                </Link>

                <Link
                  to="/professor/courses"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: "1px solid rgba(44,43,40,0.08)",
                    fontWeight: 600,
                    color: "#2c2b28",
                    background: "#fafafa",
                    textDecoration: "none",
                    fontSize: 14,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f0f0f0";
                    e.currentTarget.style.transform = "translateX(4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#fafafa";
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  📚 Moji kursevi
                </Link>
              </div>
            </div>

            {/* Statistika */}
            <div
              style={{
                padding: 20,
                border: "1px solid rgba(44,43,40,0.06)",
                borderRadius: 16,
                background: "linear-gradient(135deg, #fff 0%, #fafafa 100%)",
                boxShadow: "0 2px 8px rgba(39,35,30,0.04)",
              }}
            >
              <h3 style={{ 
                margin: "0 0 16px", 
                color: "#2c2b28", 
                fontSize: 17,
                paddingBottom: 14,
                borderBottom: "2px solid #f5f0ea",
              }}>
                📊 Statistika
              </h3>
              
              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ 
                  padding: 12,
                  borderRadius: 10,
                  background: "#fff",
                  border: "1px solid rgba(44,43,40,0.06)",
                }}>
                  <div style={{ fontSize: 12, color: "#8b7762", marginBottom: 4 }}>
                    Upisani studenti
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#2c2b28" }}>
                    {enrolledStudents.length}
                  </div>
                </div>
             </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
