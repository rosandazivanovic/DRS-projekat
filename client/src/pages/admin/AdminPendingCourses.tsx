import React, { useEffect, useMemo, useState } from "react";
import { http } from "../../api/https";
import { endpoints } from "../../api/endpoints";
import type { CourseRequest } from "../../types/courses";

import SkeletonCard from "../../components/SkeletonCard";
import FiltersBar from "../../components/FiltersBar";
import TopStats from "../../components/TopStats";
import RequestCard from "../../components/RequestCard";
import PreviewModal from "../../components/PreviewModal";
import RejectModal from "../../components/RejectModal";

export default function AdminPendingCourses() {
  const [requests, setRequests] = useState<CourseRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [allRequests, setAllRequests] = useState<CourseRequest[]>([]);
  

  // UI state
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CourseRequest | null>(null);

  // filters
  const [query, setQuery] = useState<{ search?: string; sort?: string }>({});

  useEffect(() => { fetchRequests(); }, []);

const fetchRequests = async () => {
  setLoading(true);
  try {
    const res = await http.get(endpoints.admin.courseRequests);
    const data = res.data as CourseRequest[];

    // ⬅️ čuvamo SVE zahteve sortirane po datumu
    const sorted = [...data].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setAllRequests(sorted);

    // ⬅️ pending idu u prikaz
    const pending = sorted.filter((r) => r.status === "PENDING");
    setRequests(pending);
  } catch (err: any) {
    console.error(err);
    setError(err?.response?.data?.error ?? "Greška pri učitavanju zahteva.");
    setTimeout(() => setError(null), 3000);
  } finally {
    setLoading(false);
  }
};


  const approve = async (id: number) => {
    try {
      await http.post(endpoints.admin.approveRequest(id));
      setSuccessMessage("Zahtev za kurs odobren ✅");
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchRequests();
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Greška pri odobravanju.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const startReject = (id: number) => {
    setRejectingId(id);
    setRejectModalOpen(true);
  };

  const cancelReject = () => {
    setRejectingId(null);
    setRejectModalOpen(false);
  };

  const confirmReject = async (reason: string) => {
    if (!reason.trim()) {
      setError("Unesite razlog odbijanja.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (rejectingId == null) return;

    try {
      await http.post(endpoints.admin.rejectRequest(rejectingId), {
        reason: reason.trim()
      });

      setSuccessMessage("Zahtev za kurs odbijen ❌");
      setTimeout(() => setSuccessMessage(null), 3000);

      setRejectingId(null);
      setRejectModalOpen(false);
      fetchRequests();
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Greška pri odbijanju.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const openPreview = (req: CourseRequest) => {
    setSelectedRequest(req);
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setSelectedRequest(null);
    setPreviewOpen(false);
  };

  // derived + search/sort
  const visible = useMemo(() => {
    let items = [...requests];

    if (query.search) {
      const s = query.search.toLowerCase();
      items = items.filter(
        (c) =>
          c.name.toLowerCase().includes(s) ||
          c.professorName.toLowerCase().includes(s) ||
          c.description.toLowerCase().includes(s)
      );
    }

    if (query.sort === "old")
      items.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    else
      items.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    return items;
  }, [requests, query]);

  // sidebar helpers

 const recent = allRequests.slice(0, 5);


  return (
    <div style={pageWrap}>
      <div style={container}>
        <div style={mainGrid}>
          {/* Left - main content */}
          <div style={mainColumn}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div>
                <h2 style={{ margin: 0, color: "var(--text)" }}>📋 Zahtevi za kurseve</h2>
                <p style={{ margin: "6px 0 0", color: "var(--muted)" }}>Administratorski pregled novih kurseva</p>
              </div>
            </div>

            {successMessage && <div style={successBanner}>✅ {successMessage}</div>}
            {error && <div style={errorBanner}>❌ {error}</div>}

            {/* Filters bar sits at top of main column */}
            <div style={{ marginTop: 12 }}>
              <FiltersBar onChange={(q) => setQuery((prev) => ({ ...prev, ...q }))} />
            </div>

            {/* List / skeletons */}
            <div style={{ marginTop: 14 }}>
              {loading ? (
                <div style={{ display: "grid", gap: 12 }}>
                  {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : (
                <div style={{ display: "grid", gap: 14 }}>
                  {visible.map((c) => (
                    <RequestCard
                      key={c.id}
                      req={c}
                      onApprove={approve}
                      onStartReject={startReject}
                      onPreview={openPreview}
                      isRejecting={rejectingId === c.id}
                    />
                  ))}

                  {visible.length === 0 && (
                    <div style={{ textAlign: "center", padding: 24, color: "#777", fontStyle: "italic" }}>
                      Nema zahteva za kurseve.
                      <div style={{ marginTop: 12 }}>
                        <button onClick={fetchRequests} style={refreshButton}>Osveži</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right - sidebar */}
          <aside style={sidebar}>
            <TopStats 
  total={allRequests.length}
  pending={requests.length}
  lastCreated={allRequests[0]?.createdAt ?? null}
/>

            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>Poslednjih {recent.length} zahteva</div>
              <div style={{ display: "grid", gap: 10 }}>
{recent.length === 0 && <div style={{ color: "#777", fontStyle: "italic" }}>Nema nedavnih zahteva</div>}
                {recent.map((r) => (
                  <div key={r.id} style={recentItem}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{r.professorName} • {new Date(r.createdAt).toLocaleString("sr-RS")}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>Brze akcije</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={fetchRequests} style={ghostBtn}>Osveži</button>
                <button onClick={() => { /* future: bulk approve */ }} style={primaryBtn}>Masovno odobri</button>
              </div>
            </div>
          </aside>
        </div>

        {/* Modali */}
        <PreviewModal open={previewOpen} req={selectedRequest} onClose={closePreview} />
        <RejectModal open={rejectModalOpen} onClose={cancelReject} onConfirm={confirmReject} />
      </div>
    </div>
  );
}

/* ----------------- styles ----------------- */
const pageWrap: React.CSSProperties = { minHeight: "100vh", background: "linear-gradient(180deg,#fbf7f2 0%,#f6f1ea 100%)", padding: 24 };
const container: React.CSSProperties = { maxWidth: 1200, margin: "0 auto", background: "var(--card-bg, #fffaf6)", borderRadius: 20, padding: 28, boxShadow: "0 20px 40px rgba(39,35,30,0.04)" };
const mainGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 };
const mainColumn: React.CSSProperties = { gridColumn: "1 / 2" };
const sidebar: React.CSSProperties = { gridColumn: "2 / 3", position: "sticky", top: 28, alignSelf: "start" };

const recentItem: React.CSSProperties = { padding: 10, borderRadius: 10, background: "white", border: "1px solid rgba(44,43,40,0.04)" };

const successBanner: React.CSSProperties = { padding: 14, marginTop: 12, background: "linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)", border: "1px solid rgba(6,95,70,0.12)", borderRadius: 12, color: "#065f46", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 10 };
const errorBanner: React.CSSProperties = { padding: 14, marginTop: 12, background: "#fff5f5", border: "1px solid rgba(220,38,38,0.12)", borderRadius: 12, color: "#991b1b", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 10 };

const refreshButton: React.CSSProperties = { padding: "10px 12px", borderRadius: 10, border: "none", background: "var(--accent, #b99a7f)", color: "#fff", fontWeight: 600 };

const ghostBtn: React.CSSProperties = { padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(44,43,40,0.06)", background: "#fff" };
const primaryBtn: React.CSSProperties = { padding: "8px 12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#d6bca3,#b99a7f)", color: "#fff", fontWeight: 700 };
