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

const ClipboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
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

const InboxIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
  </svg>
);

export default function AdminPendingCourses() {
  const [requests, setRequests] = useState<CourseRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [allRequests, setAllRequests] = useState<CourseRequest[]>([]);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CourseRequest | null>(null);
  const [query, setQuery] = useState<{ search?: string; sort?: string }>({});

  useEffect(() => { fetchRequests(); }, []);

const fetchRequests = async () => {
  setLoading(true);
  try {
    const res = await http.get(endpoints.admin.courseRequests);
    const data = res.data as CourseRequest[];

    const sorted = [...data].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setAllRequests(sorted);

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
      setSuccessMessage("Zahtev za kurs odobren");
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

      setSuccessMessage("Zahtev za kurs odbijen");
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

  const recent = allRequests.slice(0, 5);


  return (
    <div style={pageWrap}>
      <div style={container}>
        <div style={mainGrid}>
          {/* Left - main content */}
          <div style={mainColumn}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, color: "#63628B", fontSize: 26, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "#56629A" }}>
                    <ClipboardIcon />
                  </span>
                  Zahtevi za kurseve
                </h2>
                <p style={{ margin: "6px 0 0", color: "#8B7762", fontSize: 15 }}>
                  Administratorski pregled novih kurseva
                </p>
              </div>
            </div>

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

            <div style={{ marginTop: 16 }}>
              <FiltersBar onChange={(q) => setQuery((prev) => ({ ...prev, ...q }))} />
            </div>

            <div style={{ marginTop: 20 }}>
              {loading ? (
                <div style={{ display: "grid", gap: 14 }}>
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
                    <div style={emptyState}>
                      <div style={{ marginBottom: 16, color: "#56629A", display: "flex", justifyContent: "center" }}>
                        <InboxIcon />
                      </div>
                      Nema zahteva za kurseve.
                      <div style={{ marginTop: 16 }}>
                        <button onClick={fetchRequests} style={refreshButton}>
                          Osveži
                        </button>
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

            <div style={sidebarSection}>
              <div style={sidebarTitle}>
                Poslednjih {recent.length} zahteva
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {recent.length === 0 && (
                  <div style={{ color: "#8B7762", fontStyle: "italic", fontSize: 13 }}>
                    Nema nedavnih zahteva
                  </div>
                )}
                {recent.map((r) => (
                  <div key={r.id} style={recentItem}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#63628B" }}>
                      {r.name}
                    </div>
                    <div style={{ fontSize: 12, color: "#8B7762", marginTop: 4 }}>
                      {r.professorName} • {new Date(r.createdAt).toLocaleString("sr-RS")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <PreviewModal open={previewOpen} req={selectedRequest} onClose={closePreview} />
        <RejectModal open={rejectModalOpen} onClose={cancelReject} onConfirm={confirmReject} />
      </div>
    </div>
  );
}

/* ----------------- Styles ----------------- */
const pageWrap: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #F3F2FB 0%, #FBF7F2 100%)",
  padding: 24,
};

const container: React.CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  background: "#FFFFFF",
  borderRadius: 20,
  padding: 28,
  boxShadow: "0 20px 40px rgba(99,98,139,0.08)",
};

const mainGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 320px",
  gap: 24,
};

const mainColumn: React.CSSProperties = {
  gridColumn: "1 / 2",
};

const sidebar: React.CSSProperties = {
  gridColumn: "2 / 3",
  position: "sticky",
  top: 28,
  alignSelf: "start",
  display: "grid",
  gap: 20,
};

const sidebarSection: React.CSSProperties = {
  padding: 18,
  background: "#F3F2FB",
  borderRadius: 14,
  border: "1px solid rgba(86,98,154,0.1)",
  boxShadow: "0 2px 8px rgba(99,98,139,0.06)",
};

const sidebarTitle: React.CSSProperties = {
  fontSize: 13,
  color: "#56629A",
  marginBottom: 12,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const recentItem: React.CSSProperties = {
  padding: 12,
  borderRadius: 10,
  background: "#FFFFFF",
  border: "1px solid rgba(86,98,154,0.08)",
  transition: "all 0.2s",
};

const successBanner: React.CSSProperties = {
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
};

const errorBanner: React.CSSProperties = {
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
};

const emptyState: React.CSSProperties = {
  textAlign: "center",
  padding: 60,
  color: "#8B7762",
  fontStyle: "italic",
  background: "#F3F2FB",
  borderRadius: 16,
  boxShadow: "0 2px 8px rgba(99,98,139,0.06)",
};

const refreshButton: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: 10,
  border: "none",
  background: "linear-gradient(135deg, #56629A, #63628B)",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 2px 8px rgba(86,98,154,0.2)",
  transition: "all 0.2s",
};