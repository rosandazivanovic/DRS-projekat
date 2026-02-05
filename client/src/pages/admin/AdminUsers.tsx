import React, { useEffect, useMemo, useState } from "react";
import { http } from "../../api/https";
import { endpoints } from "../../api/endpoints";
import type { User } from "../../types/auth";

const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const PlusCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="16"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await http.get(endpoints.admin.users);
      setUsers(res.data || []);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.error ?? "Greška pri učitavanju korisnika.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    birthDate?: string;
    gender?: string;
    country?: string;
    street?: string;
    number?: string;
    role?: "STUDENT" | "PROFESOR";
  }) => {
    try {
      await http.post(endpoints.admin.users, payload);
      setSuccessMessage("Korisnik kreiran");
      setTimeout(() => setSuccessMessage(null), 3000);
      setShowCreate(false);
      fetchUsers();
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Greška pri kreiranju korisnika.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const deleteUser = async (id: number) => {
    try {
      await http.delete(endpoints.admin.deleteUser(id));
      setSuccessMessage("Korisnik obrisan");
      setTimeout(() => setSuccessMessage(null), 3000);
      setDeleteTarget(null);
      fetchUsers();
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Greška pri brisanju.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const filtered = useMemo(() => {
    if (!debouncedQuery) return users;
    return users.filter((u) => {
      const s = debouncedQuery;
      return (
        u.firstName.toLowerCase().includes(s) ||
        u.lastName.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s) ||
        (u.role || "").toLowerCase().includes(s)
      );
    });
  }, [users, debouncedQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages]);

  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #F3F2FB 0%, #FBF7F2 100%)", padding: 24 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", background: "#FFFFFF", borderRadius: 20, padding: 28, boxShadow: "0 20px 40px rgba(99,98,139,0.08)" }}>
        <Header
          onCreate={() => setShowCreate((s) => !s)}
          createOpen={showCreate}
          onRefresh={fetchUsers}
        />

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

        <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <input
              placeholder="Pretraga (ime, email, role)..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid rgba(86,98,154,0.12)", background: "#FFFFFF", color: "#63628B" }}
            />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setQuery(""); setPage(1); }} style={ghostBtn}>Reset</button>
            <button onClick={fetchUsers} style={refreshBtn}>Osveži</button>
          </div>
        </div>

        {/* grid of user cards or skeleton */}
        {loading ? (
          <div style={{ display: "grid", gap: 12 }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonUser key={i} />)}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
            {visible.map((u) => (
              <UserCard
                key={u.id}
                user={u}
                onDelete={() => setDeleteTarget(u)}
              />
            ))}
          </div>
        )}

        {/* empty state */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 28, color: "#8B7762", fontStyle: "italic" }}>
            Nema korisnika koji odgovaraju pretrazi.
          </div>
        )}

        {/* pagination */}
        <Pagination page={page} totalPages={totalPages} onChange={(p) => setPage(p)} />

        {/* modals */}
        {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} onCreate={createUser} />}
        {deleteTarget && (
          <ConfirmModal
            title="Obriši korisnika"
            description={`Da li ste sigurni da želite da obrišete korisnika ${deleteTarget.firstName} ${deleteTarget.lastName}?`}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={() => deleteUser(deleteTarget.id)}
          />
        )}
      </div>
    </div>
  );
}

/* ----------------------- Small subcomponents (local) ----------------------- */

function Header({ onCreate, createOpen }: { onCreate: ()=>void; createOpen: boolean; onRefresh: ()=>void }) {
  return (
    <div style={{ marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <h2 style={{ margin: 0, color: "#63628B", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "#56629A" }}>
            <UsersIcon />
          </span>
          Korisnici
        </h2>
        <p style={{ margin: "6px 0 0", color: "#8B7762" }}>Upravljanje korisnicima platforme</p>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button onClick={onCreate} style={{
          ...(createOpen ? cancelBtn : primaryBtn),
          display: "flex",
          alignItems: "center",
          gap: 6
        }}>
          {createOpen ? "Otkaži" : (
            <>
              <PlusCircleIcon />
              Novi korisnik
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function UserCard({ user, onDelete }: { user: User; onDelete: () => void }) {
  return (
    <div style={{ padding: 14, border: "1px solid rgba(86,98,154,0.1)", borderRadius: 12, background: "#FFFFFF", display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={avatarStyle}>{getInitials(user.firstName, user.lastName)}</div>
        <div>
          <div style={{ fontWeight: 700, color: "#63628B" }}>{user.firstName} {user.lastName}</div>
          <div style={{ color: "#8B7762", fontSize: 13 }}>{user.email}</div>
          <div style={{ marginTop: 6 }}>
            <RoleBadge role={user.role} />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {user.role !== "ADMIN" && (
          <button onClick={onDelete} style={dangerOutline}>Obriši</button>
        )}
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role?: string }) {
  const text = role ?? "STUDENT";
  const isProf = text === "PROFESOR";
  const bg = isProf ? "linear-gradient(135deg, #E8E7F5, #D9D8EB)" : "linear-gradient(135deg, #f0fdf4, #e6fff0)";
  const color = isProf ? "#56629A" : "#065f46";
  return <div style={{ padding: "6px 10px", borderRadius: 999, background: bg, color, fontWeight: 700, fontSize: 12 }}>{text}</div>;
}

function getInitials(first?: string, last?: string) {
  const a = (first || "").trim()[0] ?? "";
  const b = (last || "").trim()[0] ?? "";
  return (a + b).toUpperCase();
}

function SkeletonUser() {
  return (
    <div style={{ padding: 14, borderRadius: 12, background: "#FFFFFF", boxShadow: "0 8px 20px rgba(99,98,139,0.04)" }}>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ width: 52, height: 52, borderRadius: 10, background: "#F3F2FB" }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 14, width: "40%", background: "#F3F2FB", marginBottom: 8 }} />
          <div style={{ height: 12, width: "60%", background: "#FAFAFA", marginBottom: 8 }} />
          <div style={{ height: 10, width: "30%", background: "#FCFCFC" }} />
        </div>
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p:number)=>void }) {
  if (totalPages <= 1) return null;
  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 18 }}>
      <button onClick={() => onChange(Math.max(1, page - 1))} style={ghostBtn} disabled={page===1}>{"<"}</button>
      {start > 1 && <button onClick={() => onChange(1)} style={ghostBtn}>1</button>}
      {start > 2 && <div style={{ padding: "8px 10px", color: "#8B7762" }}>…</div>}
      {pages.map((p) => (
        <button key={p} onClick={() => onChange(p)} style={p === page ? pageBtn : ghostBtn}>{p}</button>
      ))}
      {end < totalPages - 1 && <div style={{ padding: "8px 10px", color: "#8B7762" }}>…</div>}
      {end < totalPages && <button onClick={() => onChange(totalPages)} style={ghostBtn}>{totalPages}</button>}
      <button onClick={() => onChange(Math.min(totalPages, page + 1))} style={ghostBtn} disabled={page===totalPages}>{">"}</button>
    </div>
  );
}

/* ----------------------- Create user modal (local) ----------------------- */

function CreateUserModal({ onClose, onCreate }: { onClose: ()=>void; onCreate: (payload:any)=>void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("M");
  const [country, setCountry] = useState("Srbija");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [role, setRole] = useState<"STUDENT"|"PROFESOR">("STUDENT");

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      alert("Popunite sve obavezne podatke (ime, prezime, email, lozinka).");
      return;
    }
    onCreate({ firstName, lastName, email, password, birthDate, gender, country, street, number, role });
  };

  return (
    <div style={overlay} role="dialog" aria-modal="true">
      <div style={{ ...modal, width: 720 }}>
        <h3 style={{ marginTop: 0, color: "#63628B" }}>Novi korisnik</h3>
        <form onSubmit={submit} style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
          <input placeholder="Ime" value={firstName} onChange={(e)=>setFirstName(e.target.value)} style={inputStyle} required />
          <input placeholder="Prezime" value={lastName} onChange={(e)=>setLastName(e.target.value)} style={inputStyle} required />
          <input placeholder="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} style={{ ...inputStyle, gridColumn: "1 / -1" }} required />
          <input placeholder="Lozinka" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} style={inputStyle} required />
          <input type="date" value={birthDate} onChange={(e)=>setBirthDate(e.target.value)} style={inputStyle} />
          <select value={gender} onChange={(e)=>setGender(e.target.value)} style={inputStyle}>
            <option value="M">Muški</option>
            <option value="F">Ženski</option>
          </select>
          <input placeholder="Država" value={country} onChange={(e)=>setCountry(e.target.value)} style={inputStyle} />
          <input placeholder="Ulica" value={street} onChange={(e)=>setStreet(e.target.value)} style={inputStyle} />
          <input placeholder="Broj" value={number} onChange={(e)=>setNumber(e.target.value)} style={inputStyle} />
          <select value={role} onChange={(e)=>setRole(e.target.value as any)} style={{ ...inputStyle, gridColumn: "1 / -1" }}>
            <option value="STUDENT">Student</option>
            <option value="PROFESOR">Profesor</option>
          </select>

          <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
            <button type="button" onClick={onClose} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(86,98,154,0.15)", background: "#FFFFFF", color: "#63628B" }}>Otkaži</button>
            <button type="submit" style={{ padding: "8px 12px", borderRadius: 8, background: "linear-gradient(135deg, #56629A, #63628B)", color: "#FFFFFF", border: "none", fontWeight: 600 }}>Kreiraj korisnika</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ----------------------- Confirm modal ----------------------- */
function ConfirmModal({ title, description, onCancel, onConfirm }: { title: string; description: string; onCancel: ()=>void; onConfirm: ()=>void }) {
  return (
    <div style={overlay} role="dialog" aria-modal="true">
      <div style={modal}>
        <h3 style={{ marginTop: 0, color: "#63628B" }}>{title}</h3>
        <div style={{ marginTop: 6, color: "#8B7762" }}>{description}</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
          <button onClick={onCancel} style={{ padding: 8, borderRadius: 8, border: "1px solid rgba(86,98,154,0.15)", background: "#FFFFFF", color: "#63628B" }}>Otkaži</button>
          <button onClick={onConfirm} style={{ padding: 8, borderRadius: 8, background: "#fda4a4", color: "#7a1f1f", border: "none" }}>Obriši</button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------- Styles & utils ----------------------- */

const avatarStyle: React.CSSProperties = { width: 52, height: 52, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #E8E7F5, #D9D8EB)", color: "#63628B", fontWeight: 700 };

const overlay: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 };
const modal: React.CSSProperties = { width: 720, background: "#FFFFFF", padding: 18, borderRadius: 12, boxShadow: "0 20px 40px rgba(99,98,139,0.15)" };

const inputStyle: React.CSSProperties = { padding: 10, borderRadius: 10, border: "1px solid rgba(86,98,154,0.12)", background: "#FFFFFF", color: "#63628B" };

const ghostBtn: React.CSSProperties = { padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(86,98,154,0.12)", background: "#FFFFFF", color: "#63628B" };
const primaryBtn: React.CSSProperties = { padding: "10px 14px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #56629A, #63628B)", color: "#FFFFFF", fontWeight: 700 };
const cancelBtn: React.CSSProperties = { padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(86,98,154,0.15)", background: "#FFFFFF", fontWeight: 700, color: "#63628B" };
const refreshBtn: React.CSSProperties = { padding: "8px 12px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #E8E7F5, #D9D8EB)", color: "#56629A", fontWeight: 700 };
const dangerOutline: React.CSSProperties = { padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(220,38,38,0.12)", background: "#fff5f5", color: "#7a2a2a" };
const pageBtn: React.CSSProperties = { padding: "8px 10px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #56629A, #63628B)", color: "#FFFFFF", fontWeight: 700 };

const successBanner: React.CSSProperties = {
  padding: 14, marginBottom: 16, background: "linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)",
  border: "1px solid rgba(6,95,70,0.12)", borderRadius: 12, color: "#065f46", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 10, boxShadow: "0 2px 8px rgba(6,95,70,0.08)"
};
const errorBanner: React.CSSProperties = {
  padding: 14, marginBottom: 16, background: "#fff5f5", border: "1px solid rgba(220,38,38,0.12)", borderRadius: 12, color: "#991b1b", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 10, boxShadow: "0 2px 8px rgba(220,38,38,0.08)"
};