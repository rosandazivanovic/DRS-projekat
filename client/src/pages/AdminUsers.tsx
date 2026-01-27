import { useEffect, useState } from "react";
import { http } from "../api/https";
import { endpoints } from "../api/endpoints";
import type { User } from "../types/auth";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("M");
  const [country, setCountry] = useState("Srbija");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [role, setRole] = useState<"STUDENT" | "PROFESOR">("STUDENT");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await http.get(endpoints.admin.users);
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await http.post(endpoints.admin.users, {
        firstName,
        lastName,
        email,
        password,
        birthDate,
        gender,
        country,
        street,
        number,
        role,
      });
      alert("Korisnik kreiran ✅");
      setShowForm(false);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setBirthDate("");
      setGender("M");
      setCountry("Srbija");
      setStreet("");
      setNumber("");
      setRole("STUDENT");
      fetchUsers();
    } catch (err: any) {
      alert(err?.response?.data?.error ?? "Greška pri kreiranju korisnika.");
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm("Da li ste sigurni da želite da obrišete korisnika?")) return;

    try {
      await http.delete(endpoints.admin.deleteUser(id));
      alert("Korisnik obrisan ✅");
      fetchUsers();
    } catch (err: any) {
      alert(err?.response?.data?.error ?? "Greška pri brisanju.");
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
          maxWidth: 1000,
          margin: "0 auto",
          background: "#fffaf6",
          borderRadius: 20,
          padding: 28,
          boxShadow: "0 20px 40px rgba(39,35,30,0.04)",
        }}
      >
        <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0, color: "#2c2b28" }}>👥 Korisnici</h2>
            <p style={{ margin: "6px 0 0", color: "#8b7762" }}>
              Upravljanje korisnicima platforme
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              color: "#fff",
              background: "linear-gradient(135deg,#d6bca3,#b99a7f)",
            }}
          >
            {showForm ? "Otkaži" : "➕ Novi korisnik"}
          </button>
        </div>

        {showForm && (
          <div
            style={{
              marginBottom: 24,
              padding: 18,
              border: "1px solid rgba(44,43,40,0.06)",
              borderRadius: 16,
              background: "#fff",
            }}
          >
            <h3 style={{ margin: "0 0 14px", color: "#2c2b28" }}>Novi korisnik</h3>
            <form onSubmit={createUser} style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
              <input
                placeholder="Ime"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(44,43,40,0.06)", background: "#fff" }}
              />
              <input
                placeholder="Prezime"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(44,43,40,0.06)", background: "#fff" }}
              />
              <input
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(44,43,40,0.06)", gridColumn: "1 / -1", background: "#fff" }}
              />
              <input
                placeholder="Lozinka"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(44,43,40,0.06)", background: "#fff" }}
              />
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
                style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(44,43,40,0.06)", background: "#fff" }}
              />
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(44,43,40,0.06)", background: "#fff" }}
              >
                <option value="M">Muški</option>
                <option value="F">Ženski</option>
              </select>
              <input
                placeholder="Država"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
                style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(44,43,40,0.06)", background: "#fff" }}
              />
              <input
                placeholder="Ulica"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                required
                style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(44,43,40,0.06)", background: "#fff" }}
              />
              <input
                placeholder="Broj"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                required
                style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(44,43,40,0.06)", background: "#fff" }}
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(44,43,40,0.06)", gridColumn: "1 / -1", background: "#fff" }}
              >
                <option value="STUDENT">Student</option>
                <option value="PROFESOR">Profesor</option>
              </select>
              <button
                style={{
                  gridColumn: "1 / -1",
                  padding: 10,
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  color: "#fff",
                  background: "linear-gradient(135deg,#d6bca3,#b99a7f)",
                }}
              >
                Kreiraj korisnika
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", color: "#8b7762" }}>Učitavanje...</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {users.map((u) => (
              <div
                key={u.id}
                style={{
                  padding: 14,
                  border: "1px solid rgba(44,43,40,0.06)",
                  borderRadius: 12,
                  background: "#fff",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: "#2c2b28" }}>
                    {u.firstName} {u.lastName}
                  </div>
                  <div style={{ color: "#8b7762", fontSize: 13 }}>{u.email}</div>
                  <div style={{ fontSize: 12, color: "#8b7762", marginTop: 4 }}>
                    {u.role}
                  </div>
                </div>
                {u.role !== "ADMIN" && (
                  <button
                    onClick={() => deleteUser(u.id)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: "1px solid rgba(180,130,130,0.12)",
                      cursor: "pointer",
                      fontWeight: 600,
                      color: "#7a2a2a",
                      background: "#fff5f5",
                    }}
                  >
                    Obriši
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
