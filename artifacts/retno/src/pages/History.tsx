import { useState, useEffect, useCallback, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ScriptCard from "@/components/features/ScriptCard";
import { exportAsTXT, exportAsMD, exportAsPDF, type ScriptData } from "@/utils/exportScripts";
import { apiFetch } from "@/utils/api";

interface HistoryRecord {
  id: string;
  inputText: string;
  inputType: string;
  scripts: ScriptData[];
  modelUsed: string | null;
  language: string | null;
  tone: string | null;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function ClockLargeIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="1.8" />
      <path d="M24 14v10l6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
      <path d="M7 2v7M4.5 6.5L7 9l2.5-2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 11h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
      <path d="M2 3.5h10M5.5 3.5V2.5h3v1M5.5 6v4M8.5 6v4M3 3.5l.7 8a.5.5 0 00.5.5h5.6a.5.5 0 00.5-.5l.7-8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 300ms ease" }}>
      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SkeletonCard() {
  return (
    <div style={{
      borderRadius: "16px",
      padding: "22px",
      background: "rgba(6,12,26,0.55)",
      border: "1px solid rgba(255,255,255,0.05)",
      display: "flex",
      flexDirection: "column",
      gap: "14px",
    }}>
      {[75, 45, 90].map((w, i) => (
        <div key={i} style={{
          height: "11px",
          borderRadius: "6px",
          width: `${w}%`,
          background: "rgba(255,255,255,0.04)",
          animation: `glowPulse 1.6s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  );
}

interface SmallBtnProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
}

function SmallBtn({ onClick, icon, label, danger = false }: SmallBtnProps) {
  const [pressing, setPressing] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseDown={() => setPressing(true)}
      onMouseUp={() => setPressing(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        padding: "6px 12px",
        borderRadius: "8px",
        border: danger ? "1px solid rgba(239,68,68,0.2)" : "1px solid rgba(255,255,255,0.07)",
        background: danger ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.04)",
        color: danger ? "#f87171" : "#9ca3af",
        fontSize: "11.5px",
        fontFamily: "'Inter', sans-serif",
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 200ms ease",
        whiteSpace: "nowrap",
        minHeight: "34px",
        transform: pressing ? "scale(0.96)" : "scale(1)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = danger ? "rgba(239,68,68,0.16)" : "rgba(255,255,255,0.09)";
        el.style.color = danger ? "#fca5a5" : "#e2e8f0";
      }}
      onMouseLeave={(e) => {
        setPressing(false);
        const el = e.currentTarget as HTMLElement;
        el.style.background = danger ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.04)";
        el.style.color = danger ? "#f87171" : "#9ca3af";
      }}
    >
      {icon}
      {label}
    </button>
  );
}

interface HistoryCardProps {
  record: HistoryRecord;
  onDelete: (id: string) => void;
  revealDelay: number;
}

function HistoryCard({ record, onDelete, revealDelay }: HistoryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [pressing, setPressing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const preview = record.inputText.length > 60
    ? record.inputText.slice(0, 60) + "…"
    : record.inputText;

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          observer.unobserve(el);
        }
      },
      { threshold: 0.06, rootMargin: "0px 0px -20px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      style={{
        borderRadius: "16px",
        background: "rgba(6,12,26,0.6)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.055)",
        overflow: "hidden",
        transition: `opacity 500ms ease ${revealDelay}ms, transform 500ms cubic-bezier(0.4,0,0.2,1) ${revealDelay}ms, box-shadow 300ms ease`,
        opacity: 0,
        transform: "translateY(24px)",
        willChange: "transform, opacity",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 28px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.07)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      {/* Top row */}
      <div style={{ padding: "18px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "10px" }}>
          <p style={{ fontSize: "14px", fontWeight: 500, color: "#e2e8f0", fontFamily: "'Inter', sans-serif", margin: 0, flex: 1, minWidth: 0, wordBreak: "break-word" }}>
            {preview}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
            <span style={{
              fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: "9999px",
              background: record.inputType === "youtube" ? "rgba(239,68,68,0.12)" : "rgba(58,134,255,0.12)",
              border: record.inputType === "youtube" ? "1px solid rgba(239,68,68,0.2)" : "1px solid rgba(58,134,255,0.2)",
              color: record.inputType === "youtube" ? "#f87171" : "#60a5fa",
              letterSpacing: "0.04em", fontFamily: "'Inter', sans-serif",
            }}>
              {record.inputType === "youtube" ? "YouTube" : "Text"}
            </span>
            <span style={{
              fontSize: "11px", color: "#4b5563", fontFamily: "Menlo, monospace",
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: "6px", padding: "2px 7px",
            }}>
              {timeAgo(record.createdAt)}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
          <span style={{ fontSize: "12px", color: "#6b7280", fontFamily: "'Inter', sans-serif" }}>5 scripts generated</span>
          {record.modelUsed && (
            <span style={{ fontSize: "11px", color: "#374151", fontFamily: "Menlo, monospace" }}>{record.modelUsed}</span>
          )}
        </div>
      </div>

      {/* Bottom actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,0.04)", flexWrap: "wrap" }}>
        <button
          onClick={() => setExpanded((v) => !v)}
          onMouseDown={() => setPressing(true)}
          onMouseUp={() => setPressing(false)}
          onMouseLeave={() => setPressing(false)}
          style={{
            display: "flex", alignItems: "center", gap: "5px", padding: "6px 12px",
            borderRadius: "8px", border: "1px solid rgba(58,134,255,0.2)",
            background: "rgba(58,134,255,0.08)", color: "#60a5fa",
            fontSize: "11.5px", fontFamily: "'Inter', sans-serif", fontWeight: 500, cursor: "pointer",
            transition: "all 200ms ease", minHeight: "34px",
            transform: pressing ? "scale(0.96)" : "scale(1)",
          }}
        >
          <ChevronIcon open={expanded} />
          {expanded ? "Collapse" : "View Scripts"}
        </button>
        <SmallBtn onClick={() => exportAsTXT(record.scripts)} icon={<DownloadIcon />} label="TXT" />
        <SmallBtn onClick={() => exportAsMD(record.scripts)} icon={<DownloadIcon />} label="MD" />
        <SmallBtn onClick={() => exportAsPDF(record.scripts)} icon={<DownloadIcon />} label="PDF" />
        <div style={{ marginLeft: "auto" }}>
          <SmallBtn onClick={() => onDelete(record.id)} icon={<TrashIcon />} label="Delete" danger />
        </div>
      </div>

      {expanded && (
        <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {record.scripts.map((script, i) => (
            <ScriptCard key={script.id} script={script} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function History() {
  const [status, setStatus] = useState<"loading" | "empty" | "loaded">("loading");
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const headerRef = useRef<HTMLDivElement>(null);

  const fetchHistory = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await apiFetch("/api/history");
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as HistoryRecord[];
      setRecords(data);
      setStatus(data.length === 0 ? "empty" : "loaded");
    } catch {
      setStatus("empty");
    }
  }, []);

  useEffect(() => {
    fetchHistory();
    const el = headerRef.current;
    if (!el) return;
    const timer = setTimeout(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 50);
    return () => clearTimeout(timer);
  }, [fetchHistory]);

  async function handleDelete(id: string) {
    try {
      await apiFetch(`/api/history/${id}`, { method: "DELETE" });
      setRecords((prev) => {
        const next = prev.filter((r) => r.id !== id);
        if (next.length === 0) setStatus("empty");
        return next;
      });
    } catch {
      // silent
    }
  }

  return (
    <DashboardLayout breadcrumb="History">
      <div style={{ padding: "48px 32px 80px", minHeight: "calc(100vh - 64px)", maxWidth: "900px" }}>
        {/* Page header */}
        <div
          ref={headerRef}
          style={{
            marginBottom: "32px",
            opacity: 0,
            transform: "translateY(16px)",
            transition: "opacity 600ms ease, transform 600ms ease",
            willChange: "transform, opacity",
          }}
        >
          <h1 style={{ fontSize: "2rem", fontWeight: 300, color: "#ffffff", fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em", marginBottom: "8px" }}>
            Script History
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#6b7280", fontFamily: "'Inter', sans-serif" }}>
            Your last 30 days of generated scripts
          </p>
        </div>

        {/* Loading */}
        {status === "loading" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty */}
        {status === "empty" && (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: "60px" }}>
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: "20px",
              borderRadius: "20px", padding: "52px 48px",
              background: "rgba(6,12,26,0.55)",
              backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.05)",
              maxWidth: "380px", width: "100%",
              animation: "slideUp 0.5s ease-out 0.1s both",
            }}>
              <div style={{ color: "#374151" }}><ClockLargeIcon /></div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "1rem", fontWeight: 500, color: "#6b7280", fontFamily: "'Inter', sans-serif", marginBottom: "6px" }}>
                  No scripts yet
                </p>
                <p style={{ fontSize: "0.875rem", color: "#374151", fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>
                  Your generated scripts will appear here automatically
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loaded */}
        {status === "loaded" && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {records.map((record, i) => (
                <HistoryCard key={record.id} record={record} onDelete={handleDelete} revealDelay={i * 60} />
              ))}
            </div>
            <p style={{ textAlign: "center", fontSize: "11px", color: "#374151", fontFamily: "'Inter', sans-serif", marginTop: "32px" }}>
              Scripts auto-delete after 30 days
            </p>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
