import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { http } from "../api/https";
import { endpoints } from "../api/endpoints";

export default function UserProfile() {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("M");
  const [country, setCountry] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [profileImage, setProfileImage] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await http.get(endpoints.users.profile);
      const data = res.data;
      
      console.log("📥 Profile data:", data);
      
      setFirstName(data.firstName || "");
      setLastName(data.lastName || "");
      setEmail(data.email || "");
      setBirthDate(data.birthDate || "");
      setGender(data.gender || "M");
      setCountry(data.country || "");
      setStreet(data.street || "");
      setNumber(data.number || "");
      setProfileImage(data.profileImage || "");
      
      console.log("🖼️ Profile image:", data.profileImage);
    } catch (err: any) {
      console.error("❌ Error fetching profile:", err);
      setError(err?.response?.data?.error ?? "Greška pri učitavanju profila");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      await http.patch(endpoints.users.profile, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(), 
        birthDate: birthDate.trim(),
        gender: gender.trim(),
        country: country.trim(),
        street: street.trim(),
        number: number.trim(),
      });
      
      setSuccess("Profil uspešno ažuriran! ✅");
      
      setTimeout(() => {
        setSuccess(null);
      }, 2000);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Greška pri čuvanju profila");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) {
    console.log("❌ No file selected");
    return;
  }

  console.log("=== IMAGE UPLOAD START ===");
  console.log("📁 File:", {
    name: file.name,
    type: file.type,
    size: file.size,
    sizeInMB: (file.size / (1024 * 1024)).toFixed(2) + "MB"
  });

  if (!file.type.startsWith("image/")) {
    console.log("❌ Invalid file type:", file.type);
    setError("Molimo odaberite sliku (JPG, PNG, itd.)");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    console.log("❌ File too large:", file.size);
    setError("Slika ne može biti veća od 5MB");
    return;
  }

  setError(null);
  setSuccess(null);
  setUploadingImage(true);
  console.log("⏳ Upload started, uploadingImage = true");

  const reader = new FileReader();
  
  reader.onloadstart = () => {
    console.log("📖 FileReader started reading...");
  };
  
  reader.onprogress = (event) => {
    if (event.lengthComputable) {
      const percentComplete = (event.loaded / event.total) * 100;
      console.log(`📊 Reading: ${percentComplete.toFixed(0)}%`);
    }
  };
  
  reader.onload = async (event) => {
    console.log("✅ FileReader finished reading");
    
    const imagePath = event.target?.result as string;
    
    if (!imagePath) {
      console.error("❌ No image data from FileReader");
      setError("Greška pri čitanju slike");
      setUploadingImage(false);
      return;
    }
    
    console.log("📤 Image data:", {
      length: imagePath.length,
      preview: imagePath.substring(0, 100) + "...",
      type: imagePath.split(';')[0]
    });
    
    try {
      console.log("🌐 Sending to backend...");
      console.log("🔗 Endpoint:", endpoints.users.uploadImage);
      console.log("📦 Payload:", { imagePath: imagePath.substring(0, 50) + "..." });
      
      const response = await http.post(endpoints.users.uploadImage, {
        imagePath: imagePath,
      });
      
      console.log("✅ Backend response:", response);
      console.log("📄 Response data:", response.data);
      
      const userData = response.data;
      const newImage = userData.profileImage || "";
      
      console.log("🖼️ Extracted profileImage:", {
        exists: !!newImage,
        length: newImage.length,
        preview: newImage ? newImage.substring(0, 100) + "..." : "EMPTY"
      });
      
      setProfileImage(newImage);
      console.log("✅ State updated with new image");
      
      setSuccess("Slika profila ažurirana! ✅");
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err: any) {
      console.error("❌ Upload error:", err);
      console.error("❌ Error response:", err?.response);
      console.error("❌ Error data:", err?.response?.data);
      setError(err?.response?.data?.error ?? "Greška pri upload-u slike");
    } finally {
      console.log("🏁 Upload process finished, setting uploadingImage = false");
      setUploadingImage(false);
    }
  };
  
  reader.onerror = () => {
    console.error("❌ FileReader error:", reader.error);
    setError("Greška pri čitanju slike");
    setUploadingImage(false);
  };
  
  reader.onloadend = () => {
    console.log("🏁 FileReader loadend event");
  };
  
  console.log("📖 Starting FileReader.readAsDataURL...");
  reader.readAsDataURL(file);
};

  const handleRemoveImage = async () => {
    if (!confirm("Da li sigurno želiš da ukloniš sliku profila?")) return;
    
    setUploadingImage(true);
    try {
      const response = await http.post(endpoints.users.uploadImage, { 
        imagePath: "" 
      });
      
      const userData = response.data;
      setProfileImage(userData.profileImage || "");
      
      setSuccess("Slika uklonjena! ✅");
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Greška pri uklanjanju slike");
    } finally {
      setUploadingImage(false);
    }
  };

  if (isAdmin) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(180deg,#fbf7f2 0%,#f6f1ea 100%)",
          padding: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: 500,
            background: "#fffaf6",
            borderRadius: 20,
            padding: 40,
            textAlign: "center",
            boxShadow: "0 20px 40px rgba(39,35,30,0.04)",
          }}
        >
          <div style={{ fontSize: 64, marginBottom: 16 }}>🔒</div>
          <h2 style={{ margin: 0, color: "#2c2b28", fontSize: 24 }}>
            Admin pristup
          </h2>
          <p style={{ margin: "12px 0 0", color: "#8b7762", lineHeight: 1.6 }}>
            Administratori ne mogu pristupiti profil stranici. 
            Koristite admin panel za upravljanje sistemom.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(180deg,#fbf7f2 0%,#f6f1ea 100%)",
          padding: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ color: "#8b7762", fontSize: 16 }}>Učitavanje profila...</div>
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
          maxWidth: 900,
          margin: "0 auto",
          background: "#fffaf6",
          borderRadius: 20,
          padding: 28,
          boxShadow: "0 20px 40px rgba(39,35,30,0.04)",
        }}
      >
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ margin: 0, color: "#2c2b28", fontSize: 24 }}>
            👤 Moj profil
          </h2>
          <p style={{ margin: "6px 0 0", color: "#8b7762" }}>
            Upravljaj svojim podacima i postavkama
          </p>
        </div>

        {error && (
          <div
            style={{
              marginBottom: 20,
              padding: 14,
              background: "#fff5f5",
              border: "1px solid rgba(180,130,130,0.12)",
              borderRadius: 12,
              color: "#7a2a2a",
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              marginBottom: 20,
              padding: 14,
              background: "#effaf3",
              border: "1px solid rgba(6,95,70,0.12)",
              borderRadius: 12,
              color: "#065f46",
              fontSize: 14,
            }}
          >
            {success}
          </div>
        )}

        <div
          style={{
            marginBottom: 32,
            padding: 24,
            border: "1px solid rgba(44,43,40,0.06)",
            borderRadius: 16,
            background: "#fff",
          }}
        >
          <h3 style={{ margin: "0 0 16px", color: "#2c2b28", fontSize: 18 }}>
            📸 Slika profila
          </h3>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
            }}
          >
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: profileImage
                  ? `url(${profileImage}) center/cover`
                  : "linear-gradient(135deg, #d6bca3, #b99a7f)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 48,
                fontWeight: 700,
                boxShadow: "0 8px 20px rgba(39,35,30,0.08)",
                border: "3px solid #fff",
                position: "relative" as const,
                overflow: "hidden",
              }}
            >
              {!profileImage && (firstName?.[0] || "?").toUpperCase()}
              {uploadingImage && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 14,
                  }}
                >
                  ⏳
                </div>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <label
                htmlFor="image-upload"
                style={{
                  display: "inline-block",
                  padding: "10px 20px",
                  borderRadius: 10,
                  border: "1px solid rgba(44,43,40,0.12)",
                  cursor: uploadingImage ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  color: uploadingImage ? "#999" : "#2c2b28",
                  background: uploadingImage ? "#f5f5f5" : "#fff",
                  transition: "all 0.2s",
                }}
              >
                {uploadingImage ? "⏳ Upload..." : "📁 Odaberi sliku"}
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                style={{ display: "none" }}
              />
              <div
                style={{
                  marginTop: 10,
                  fontSize: 13,
                  color: "#8b7762",
                }}
              >
                Podržani formati: JPG, PNG, GIF (max 5MB)
              </div>
              {profileImage && (
                <button
                  onClick={handleRemoveImage}
                  disabled={uploadingImage}
                  style={{
                    marginTop: 10,
                    padding: "6px 12px",
                    borderRadius: 8,
                    border: "1px solid rgba(180,130,130,0.12)",
                    cursor: uploadingImage ? "not-allowed" : "pointer",
                    fontWeight: 600,
                    fontSize: 13,
                    color: uploadingImage ? "#999" : "#7a2a2a",
                    background: uploadingImage ? "#f5f5f5" : "#fff5f5",
                  }}
                >
                  🗑️ Ukloni sliku
                </button>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div
            style={{
              padding: 24,
              border: "1px solid rgba(44,43,40,0.06)",
              borderRadius: 16,
              background: "#fff",
            }}
          >
            <h3 style={{ margin: "0 0 20px", color: "#2c2b28", fontSize: 18 }}>
              ℹ️ Osnovni podaci
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    color: "#2c2b28",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Ime
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid rgba(44,43,40,0.08)",
                    fontSize: 14,
                    background: "#fff",
                    color: "#2c2b28",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    color: "#2c2b28",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Prezime
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid rgba(44,43,40,0.08)",
                    fontSize: 14,
                    background: "#fff",
                    color: "#2c2b28",
                  }}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    color: "#2c2b28",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid rgba(44,43,40,0.08)",
                    fontSize: 14,
                    background: "#fff",
                    color: "#2c2b28",
                  }}
                />
                <div style={{ marginTop: 4, fontSize: 12, color: "#8b7762" }}>
                  💡 Email adresa se može menjati
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    color: "#2c2b28",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Datum rođenja
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid rgba(44,43,40,0.08)",
                    fontSize: 14,
                    background: "#fff",
                    color: "#2c2b28",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    color: "#2c2b28",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Pol
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid rgba(44,43,40,0.08)",
                    fontSize: 14,
                    background: "#fff",
                    color: "#2c2b28",
                  }}
                >
                  <option value="M">Muški</option>
                  <option value="F">Ženski</option>
                  <option value="O">Ostalo</option>
                </select>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    color: "#2c2b28",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Država
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Npr. Srbija"
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid rgba(44,43,40,0.08)",
                    fontSize: 14,
                    background: "#fff",
                    color: "#2c2b28",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    color: "#2c2b28",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Ulica
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Npr. Kneza Miloša"
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid rgba(44,43,40,0.08)",
                    fontSize: 14,
                    background: "#fff",
                    color: "#2c2b28",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    color: "#2c2b28",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Broj
                </label>
                <input
                  type="text"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="Npr. 15"
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid rgba(44,43,40,0.08)",
                    fontSize: 14,
                    background: "#fff",
                    color: "#2c2b28",
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: "12px 28px",
                  borderRadius: 10,
                  border: "none",
                  cursor: saving ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: 15,
                  color: "#fff",
                  background: saving
                    ? "#b99a7f"
                    : "linear-gradient(135deg,#d6bca3,#b99a7f)",
                  boxShadow: saving ? "none" : "0 6px 18px rgba(121,86,61,0.12)",
                  transition: "all 0.2s",
                }}
              >
                {saving ? "Čuvanje..." : "💾 Sačuvaj izmene"}
              </button>
            </div>
          </div>
        </form>

        <div
          style={{
            marginTop: 24,
            padding: 18,
            background: "#fbf6f1",
            borderRadius: 12,
            border: "1px solid rgba(44,43,40,0.04)",
          }}
        >
          <div style={{ fontSize: 13, color: "#8b7762", lineHeight: 1.6 }}>
            <strong>📌 Napomena:</strong> Promene se čuvaju odmah nakon klika na dugme "Sačuvaj izmene".
          </div>
        </div>
      </div>
    </div>
  );
}