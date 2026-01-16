import { useState } from "react";

type ReportType = "ACTIVE" | "PENDING" | "CLOSED";

function downloadMockPdf(filename: string) {
  const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 60 >>
stream
BT
/F1 24 Tf
72 720 Td
(Reports - MOCK) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
trailer
<< /Root 1 0 R /Size 5 >>
startxref
0
%%EOF`;

  const blob = new Blob([content], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminReportsPage() {
  const [type, setType] = useState<ReportType>("ACTIVE");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    downloadMockPdf(`report-${type.toLowerCase()}-mock.pdf`);
    setLoading(false);
    alert("Izveštaj generisan (mock). U pravoj verziji ide i na mail.");
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
          maxWidth: 700,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 20,
          padding: 28,
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ margin: 0, color: "#2d2d2d" }}>
            📊 Izveštaji
          </h2>
          <p style={{ margin: "6px 0 0", color: "#666" }}>
            Generisanje administrativnih izveštaja
          </p>
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <label
              style={{
                fontSize: 13,
                color: "#555",
                fontWeight: 500,
              }}
            >
              Tip izveštaja
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ReportType)}
              style={{
                padding: 12,
                borderRadius: 12,
                border: "1px solid #ddd",
                fontSize: 14,
                background: "#fafafa",
              }}
            >
              <option value="ACTIVE">Aktivni kursevi</option>
              <option value="PENDING">Na čekanju</option>
              <option value="CLOSED">Završeni</option>
            </select>
          </div>

          <button
            disabled={loading}
            onClick={generate}
            style={{
              marginTop: 10,
              padding: 12,
              borderRadius: 12,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontSize: 15,
              color: "#fff",
              background: loading
                ? "#999"
                : "linear-gradient(135deg, #667eea, #764ba2)",
            }}
          >
            {loading ? "Generišem..." : "Generiši PDF"}
          </button>

          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              color: "#777",
              textAlign: "center",
            }}
          >
            Kasnije: POST /api/admin/reports + slanje na mail.
          </div>
        </div>
      </div>
    </div>
  );
}
