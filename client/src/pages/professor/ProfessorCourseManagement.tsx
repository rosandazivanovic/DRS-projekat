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

// SVG Icons
const BookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);

const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const FileTextIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const LinkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);

const BarChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10"/>
    <line x1="18" y1="20" x2="18" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="16"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const XCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);

const SaveIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
);

const UploadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const RefreshIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const UserPlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="8.5" cy="7" r="4"/>
    <line x1="20" y1="8" x2="20" y2="14"/>
    <line x1="23" y1="11" x2="17" y2="11"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const ClipboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

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

      setSuccessMessage("Kurs uspešno ažuriran!");
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
      setSuccessMessage("Kurs uspešno obrisan!");
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

        setSuccessMessage("Materijal uspešno okačen!");
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

      setSuccessMessage("Student uspešno dodat na kurs!");
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
      <div style={{ padding: 24, textAlign: "center", color: "#8B7762" }}>
        Učitavanje...
      </div>
    );
  }

  if (course.professorId !== user.id) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#991b1b" }}>
        Nemate dozvolu za upravljanje ovim kursom.
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #F3F2FB 0%, #FBF7F2 100%)",
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
          background: "#FFFFFF",
          padding: 20,
          borderRadius: 16,
          boxShadow: "0 2px 8px rgba(99,98,139,0.06)",
        }}>
          <div>
            <Link
              to="/professor/courses"
              style={{ 
                color: "#56629A", 
                textDecoration: "none", 
                fontSize: 14, 
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 8,
                fontWeight: 500,
              }}
            >
              <ArrowLeftIcon />
              Nazad na moje kurseve
            </Link>
            <h2 style={{ 
              margin: 0, 
              color: "#63628B", 
              fontSize: 24,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}>
              <span style={{ color: "#56629A" }}>
                <BookIcon />
              </span>
              {course.name}
            </h2>
            <p style={{ margin: "4px 0 0", color: "#8B7762", fontSize: 14 }}>
              Upravljanje kursom
            </p>
          </div>

          <button
            onClick={handleDeleteCourse}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              border: "1px solid rgba(220,38,38,0.12)",
              cursor: "pointer",
              fontWeight: 600,
              color: "#991b1b",
              background: "#fff5f5",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#ffe5e5";
              e.currentTarget.style.borderColor = "rgba(220,38,38,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff5f5";
              e.currentTarget.style.borderColor = "rgba(220,38,38,0.12)";
            }}
          >
            <TrashIcon />
            Obriši kurs
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
            <CheckCircleIcon />
            {successMessage}
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
            <XCircleIcon />
            {error}
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
                border: "1px solid rgba(86,98,154,0.1)",
                borderRadius: 16,
                background: "#FFFFFF",
                boxShadow: "0 2px 8px rgba(99,98,139,0.06)",
              }}
            >
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                marginBottom: 20,
                paddingBottom: 16,
                borderBottom: "2px solid #F3F2FB",
              }}>
                <h3 style={{ 
                  margin: 0, 
                  color: "#63628B", 
                  fontSize: 18, 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 10 
                }}>
                  <span style={{ color: "#56629A" }}>
                    <EditIcon />
                  </span>
                  Informacije o kursu
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
                      background: "linear-gradient(135deg, #56629A, #63628B)",
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
                      color: "#63628B", 
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
                        border: "1px solid rgba(86,98,154,0.15)",
                        background: "#FFFFFF",
                        fontSize: 14,
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ 
                      display: "block", 
                      marginBottom: 8, 
                      color: "#63628B", 
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
                        border: "1px solid rgba(86,98,154,0.15)",
                        minHeight: 120,
                        background: "#FFFFFF",
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
                        background: "linear-gradient(135deg, #56629A, #63628B)",
                        fontSize: 14,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <SaveIcon />
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
                        padding: "10px 20px",
                        borderRadius: 10,
                        border: "1px solid rgba(86,98,154,0.15)",
                        cursor: "pointer",
                        fontWeight: 600,
                        color: "#63628B",
                        background: "#FFFFFF",
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
                    color: "#63628B", 
                    marginBottom: 4,
                    fontSize: 15,
                  }}>
                    Naziv
                  </div>
                  <div style={{ 
                    color: "rgba(99,98,139,0.9)", 
                    fontSize: 14, 
                    marginBottom: 16,
                    padding: 12,
                    background: "#F3F2FB",
                    borderRadius: 8,
                  }}>
                    {course.name}
                  </div>
                  
                  <div style={{ 
                    fontWeight: 600, 
                    color: "#63628B", 
                    marginBottom: 4,
                    fontSize: 15,
                  }}>
                    Opis
                  </div>
                  <div style={{ 
                    color: "rgba(99,98,139,0.9)", 
                    fontSize: 14,
                    lineHeight: 1.6,
                    padding: 12,
                    background: "#F3F2FB",
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
                border: "1px solid rgba(86,98,154,0.1)",
                borderRadius: 16,
                background: "#FFFFFF",
                boxShadow: "0 2px 8px rgba(99,98,139,0.06)",
              }}
            >
              <h3 style={{ 
                margin: "0 0 20px", 
                color: "#63628B", 
                fontSize: 18,
                display: "flex",
                alignItems: "center",
                gap: 10,
                paddingBottom: 16,
                borderBottom: "2px solid #F3F2FB",
              }}>
                <span style={{ color: "#56629A" }}>
                  <FileTextIcon />
                </span>
                Materijal za učenje
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
                    <div style={{ color: "#065f46" }}>
                      <CheckCircleIcon />
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
                  <div style={{ color: "#7a5b32" }}>
                    <AlertIcon />
                  </div>
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
                      color: "#63628B",
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
                      border: "1px solid rgba(86,98,154,0.15)",
                      background: "#FFFFFF",
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
                    background: "linear-gradient(135deg, #56629A, #63628B)",
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {uploadingMaterial ? (
                    "Upload..."
                  ) : course.materialPath ? (
                    <>
                      <RefreshIcon />
                      Zameni materijal
                    </>
                  ) : (
                    <>
                      <UploadIcon />
                      Okači materijal
                    </>
                  )}
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
                border: "1px solid rgba(86,98,154,0.1)",
                borderRadius: 16,
                background: "#FFFFFF",
                boxShadow: "0 2px 8px rgba(99,98,139,0.06)",
              }}
            >
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                marginBottom: 16,
                paddingBottom: 14,
                borderBottom: "2px solid #F3F2FB",
              }}>
                <h3 style={{ 
                  margin: 0, 
                  color: "#63628B", 
                  fontSize: 17,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}>
                  <span style={{ color: "#56629A" }}>
                    <UsersIcon />
                  </span>
                  Studenti
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
                      background: "linear-gradient(135deg, #56629A, #63628B)",
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <UserPlusIcon />
                    Dodaj
                  </button>
                )}
              </div>

              {showAddStudents && (
                <div
                  style={{
                    marginBottom: 16,
                    padding: 14,
                    borderRadius: 10,
                    background: "#F3F2FB",
                    border: "1px solid rgba(86,98,154,0.12)",
                  }}
                >
                  <form onSubmit={handleAddStudent} style={{ display: "grid", gap: 10 }}>
                    <select
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value === "" ? "" : Number(e.target.value))}
                      style={{
                        padding: 10,
                        borderRadius: 8,
                        border: "1px solid rgba(86,98,154,0.15)",
                        background: "#FFFFFF",
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
                          background: "linear-gradient(135deg, #56629A, #63628B)",
                          fontSize: 13,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        {addingStudent ? "..." : (
                          <>
                            <CheckCircleIcon />
                            Dodaj
                          </>
                        )}
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
                          border: "1px solid rgba(86,98,154,0.15)",
                          cursor: "pointer",
                          fontWeight: 600,
                          color: "#63628B",
                          background: "#FFFFFF",
                          fontSize: 13,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <XCircleIcon />
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div style={{ display: "grid", gap: 10, maxHeight: 240, overflowY: "auto", paddingRight: 4 }}>
                {enrolledStudents.map((e) => (
                  <div
                    key={e.id}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      background: "#F3F2FB",
                      border: "1px solid rgba(86,98,154,0.1)",
                    }}
                  >
                    <div style={{ fontWeight: 600, color: "#63628B", fontSize: 14 }}>
                      {e.studentName}
                    </div>
                    <div style={{ 
                      fontSize: 11, 
                      color: "#8B7762", 
                      marginTop: 4,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}>
                      <CalendarIcon />
                      {new Date(e.enrolledAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {enrolledStudents.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: 24,
                      color: "#8B7762",
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
                border: "1px solid rgba(86,98,154,0.1)",
                borderRadius: 16,
                background: "#FFFFFF",
                boxShadow: "0 2px 8px rgba(99,98,139,0.06)",
              }}
            >
              <h3 style={{ 
                margin: "0 0 16px", 
                color: "#63628B", 
                fontSize: 17,
                paddingBottom: 14,
                borderBottom: "2px solid #F3F2FB",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}>
                <span style={{ color: "#56629A" }}>
                  <LinkIcon />
                </span>
                Brzi linkovi
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
                    border: "1px solid rgba(86,98,154,0.12)",
                    fontWeight: 600,
                    color: "#63628B",
                    background: "#F3F2FB",
                    textDecoration: "none",
                    fontSize: 14,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#E8E7F5";
                    e.currentTarget.style.transform = "translateX(4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#F3F2FB";
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  <ClipboardIcon />
                  Upravljaj zadacima
                </Link>

                <Link
                  to="/professor/courses"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: "1px solid rgba(86,98,154,0.12)",
                    fontWeight: 600,
                    color: "#63628B",
                    background: "#F3F2FB",
                    textDecoration: "none",
                    fontSize: 14,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#E8E7F5";
                    e.currentTarget.style.transform = "translateX(4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#F3F2FB";
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  <BookIcon />
                  Moji kursevi
                </Link>
              </div>
            </div>

            {/* Statistika */}
            <div
              style={{
                padding: 20,
                border: "1px solid rgba(86,98,154,0.1)",
                borderRadius: 16,
                background: "linear-gradient(135deg, #FFFFFF 0%, #F3F2FB 100%)",
                boxShadow: "0 2px 8px rgba(99,98,139,0.06)",
              }}
            >
              <h3 style={{ 
                margin: "0 0 16px", 
                color: "#63628B", 
                fontSize: 17,
                paddingBottom: 14,
                borderBottom: "2px solid #F3F2FB",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}>
                <span style={{ color: "#56629A" }}>
                  <BarChartIcon />
                </span>
                Statistika
              </h3>
              
              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ 
                  padding: 12,
                  borderRadius: 10,
                  background: "#FFFFFF",
                  border: "1px solid rgba(86,98,154,0.1)",
                }}>
                  <div style={{ fontSize: 12, color: "#8B7762", marginBottom: 4 }}>
                    Upisani studenti
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#63628B" }}>
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