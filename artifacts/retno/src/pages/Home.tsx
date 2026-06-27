import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ScriptCard from "@/components/features/ScriptCard";
import {
  exportAsTXT,
  exportAsMD,
  exportAsPDF,
  formatAllScriptsForClipboard,
  type ScriptData,
} from "@/utils/exportScripts";
import { apiFetch } from "@/utils/api";

type PageState = "idle" | "loading" | "success";

const LOADING_MESSAGES = [
  "Reading source…",
  "Generating hooks…",
  "Writing scripts…",
  "Finalizing…",
];

const SUGGESTION_CARDS = [
  {
    emoji: "🎬",
    title: "Generate from YouTube",
    description: "Paste any YouTube URL and get 5 viral scripts instantly",
    placeholder: "https://youtube.com/watch?v=...",
  },
  {
    emoji: "💡",
    title: "Write from Raw Idea",
    description: "Type any concept and transform it into scroll-stopping hooks",
    placeholder: "My idea: how to build habits that actually stick...",
  },
  {
    emoji: "📄",
    title: "Paste Article or Text",
    description: "Convert any long content into short-form viral scripts",
    placeholder: "Paste your article or text here...",
  },
  {
    emoji: "🔥",
    title: "Trending Hook Formats",
    description: "Generate scripts using the latest viral hook structures",
    placeholder: "Top 10 productivity hacks nobody talks about...",
  },
];

function SpinnerIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      style={{ animation: "spin 0.8s linear infinite", willChange: "transform" }}
    >
      <circle cx="8" cy="8" r="6.5" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      <path
        d="M8 1.5A6.5 6.5 0 0114.5 8"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CopyAllIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 10V2.5A.5.5 0 012.5 2H10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <path d="M7 2v7M4.5 6.5L7 9l2.5-2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 11h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <path d="M12 7A5 5 0 112.5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M2.5 2v2.5H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface ActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  variant?: "default" | "primary";
}

function ActionButton({ onClick, icon, label, variant = "default" }: ActionButtonProps) {
  const [pressing, setPressing] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseDown={() => setPressing(true)}
      onMouseUp={() => setPressing(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 14px",
        borderRadius: "9px",
        border: variant === "primary" ? "1px solid rgba(58,134,255,0.3)" : "1px solid rgba(255,255,255,0.07)",
        background: variant === "primary" ? "rgba(58,134,255,0.12)" : "rgba(255,255,255,0.04)",
        color: variant === "primary" ? "#3a86ff" : "#9ca3af",
        fontSize: "12px",
        fontFamily: "'Inter', sans-serif",
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 200ms ease",
        whiteSpace: "nowrap",
        transform: pressing ? "scale(0.96)" : "scale(1)",
        minHeight: "36px",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = variant === "primary" ? "rgba(58,134,255,0.2)" : "rgba(255,255,255,0.09)";
        el.style.color = variant === "primary" ? "#60a5fa" : "#e2e8f0";
      }}
      onMouseLeave={(e) => {
        setPressing(false);
        const el = e.currentTarget as HTMLElement;
        el.style.background = variant === "primary" ? "rgba(58,134,255,0.12)" : "rgba(255,255,255,0.04)";
        el.style.color = variant === "primary" ? "#3a86ff" : "#9ca3af";
      }}
    >
      {icon}
      {label}
    </button>
  );
}

interface ToastProps {
  message: string;
  type: "error" | "success";
  onClose: () => void;
}

function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        bottom: "32px",
        right: "24px",
        zIndex: 100,
        maxWidth: "360px",
        borderRadius: "12px",
        padding: "14px 18px",
        background: type === "error" ? "rgba(220,38,38,0.15)" : "rgba(34,197,94,0.15)",
        border: `1px solid ${type === "error" ? "rgba(220,38,38,0.3)" : "rgba(34,197,94,0.3)"}`,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        color: type === "error" ? "#fca5a5" : "#86efac",
        fontSize: "13px",
        fontFamily: "'Inter', sans-serif",
        animation: "slideUp 0.3s ease-out both",
        cursor: "pointer",
        lineHeight: 1.5,
      }}
    >
      {message}
    </div>
  );
}

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [pageState, setPageState] = useState<PageState>("idle");
  const [scripts, setScripts] = useState<ScriptData[]>([]);
  const [inputPreview, setInputPreview] = useState("");
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [sendPressing, setSendPressing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const loadingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const suggestionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Stagger scroll reveal on suggestion cards
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = "1";
            (entry.target as HTMLElement).style.transform = "scale(1) translateY(0)";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05 }
    );
    suggestionRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  function startLoadingMessages() {
    let idx = 0;
    setLoadingMsg(LOADING_MESSAGES[0]);
    loadingIntervalRef.current = setInterval(() => {
      idx = (idx + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[idx]);
    }, 1800);
  }

  function stopLoadingMessages() {
    if (loadingIntervalRef.current) {
      clearInterval(loadingIntervalRef.current);
      loadingIntervalRef.current = null;
    }
  }

  async function handleGenerate() {
    const trimmed = inputValue.trim();
    if (!trimmed || pageState === "loading") return;
    setInputPreview(trimmed.length > 80 ? trimmed.slice(0, 80) + "…" : trimmed);
    setPageState("loading");
    startLoadingMessages();
    try {
      const response = await apiFetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({ input: trimmed }),
      });
      const data = (await response.json()) as
        | { success: true; scripts: ScriptData[]; modelUsed: string; inputType: string }
        | { success: false; error: string };
      stopLoadingMessages();
      if (!data.success) {
        setToast({ message: data.error, type: "error" });
        setPageState("idle");
        return;
      }
      setScripts(data.scripts);
      setPageState("success");
    } catch {
      stopLoadingMessages();
      setToast({ message: "Network error. Please check your connection and try again.", type: "error" });
      setPageState("idle");
    }
  }

  function handleStartOver() {
    setPageState("idle");
    setScripts([]);
    setInputValue("");
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  async function handleCopyAll() {
    const text = formatAllScriptsForClipboard(scripts);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  }

  const isLoading = pageState === "loading";
  const canSend = !!inputValue.trim() && !isLoading;

  return (
    <DashboardLayout breadcrumb="Home">
      <style>{`
        @keyframes rotateBorder {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .input-glow-ring {
          position: absolute;
          inset: -1.5px;
          border-radius: 9999px;
          background: linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6, #3b82f6);
          background-size: 300% 300%;
          pointer-events: none;
          z-index: 0;
        }
        .input-glow-ring.focused {
          animation: rotateBorder 2s linear infinite;
          opacity: 1;
          filter: blur(2px);
        }
        .input-glow-ring.unfocused {
          opacity: 0.35;
          filter: blur(6px);
          background: linear-gradient(to right, rgba(37,99,235,0.5), rgba(99,102,241,0.4), rgba(124,58,237,0.5));
          transition: opacity 400ms ease;
        }
        .loading-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #3a86ff;
          animation: loadDot 1.2s ease-in-out infinite;
        }
        @keyframes loadDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1; }
        }
        @media (max-width: 640px) {
          .suggestion-grid { grid-template-columns: 1fr !important; }
          .home-title { font-size: 2.2rem !important; }
          .home-actions { gap: 6px !important; }
          .results-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── SUCCESS STATE ──────────────────────────── */}
      {pageState === "success" && (
        <div style={{ padding: "40px 24px 100px", animation: "fadeIn 0.5s ease-out both" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "32px",
            }}
          >
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#ffffff", fontFamily: "'Inter', sans-serif", marginBottom: "6px", letterSpacing: "-0.01em" }}>
                5 Scripts Generated
              </h2>
              <p style={{ fontSize: "0.8125rem", color: "#6b7280", fontFamily: "'Inter', sans-serif", maxWidth: "480px" }}>
                {inputPreview}
              </p>
            </div>
            <div className="home-actions" style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
              <ActionButton onClick={handleCopyAll} icon={<CopyAllIcon />} label={copiedAll ? "Copied!" : "Copy All"} />
              <ActionButton onClick={() => exportAsTXT(scripts)} icon={<DownloadIcon />} label="Export TXT" />
              <ActionButton onClick={() => exportAsMD(scripts)} icon={<DownloadIcon />} label="Export MD" />
              <ActionButton onClick={() => exportAsPDF(scripts)} icon={<DownloadIcon />} label="Export PDF" />
              <ActionButton onClick={handleStartOver} icon={<RefreshIcon />} label="Start Over" variant="primary" />
            </div>
          </div>

          <div
            className="results-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(480px, 1fr))", gap: "16px" }}
          >
            {scripts.map((script, i) => (
              <ScriptCard key={script.id} script={script} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* ── IDLE + LOADING STATE (shared UI) ──────── */}
      {(pageState === "idle" || pageState === "loading") && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "calc(100vh - 64px)",
            padding: "0 20px 80px",
          }}
        >
          {/* Heading */}
          <div style={{ textAlign: "center", marginBottom: "44px", animation: "fadeIn 0.6s ease-out both" }}>
            <h1
              className="home-title"
              style={{
                fontSize: "3.5rem",
                fontWeight: 300,
                color: "#ffffff",
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              What should we create today?
            </h1>
            <p style={{ fontSize: "0.95rem", color: "#4b5563", marginTop: "12px", fontFamily: "'Inter', sans-serif" }}>
              Paste a link, drop an idea, or type anything.
            </p>
          </div>

          {/* Input Bar */}
          <div style={{ width: "100%", maxWidth: "720px", animation: "slideUp 0.5s ease-out 0.1s both" }}>
            <div style={{ position: "relative", borderRadius: "9999px" }}>
              <div className={`input-glow-ring ${isFocused ? "focused" : "unfocused"}`} />

              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  borderRadius: "9999px",
                  padding: "8px 8px 8px 12px",
                  background: "rgba(6,11,25,0.92)",
                  backdropFilter: "blur(28px)",
                  WebkitBackdropFilter: "blur(28px)",
                  border: isFocused ? "1px solid transparent" : "1px solid rgba(255,255,255,0.06)",
                  boxShadow: isFocused
                    ? "0 0 0 1px rgba(59,130,246,0.15), 0 8px 32px rgba(59,130,246,0.12)"
                    : "0 4px 16px rgba(0,0,0,0.3)",
                  transition: "border-color 300ms ease, box-shadow 400ms ease",
                }}
              >
                {/* Model indicator */}
                <button
                  type="button"
                  disabled={isLoading}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    borderRadius: "9999px",
                    padding: "6px 12px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    color: "#9ca3af",
                    fontSize: "12px",
                    fontFamily: "'Inter', sans-serif",
                    cursor: "pointer",
                    transition: "background 200ms ease",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; }}
                >
                  Gemini Flash
                  <ChevronDownIcon />
                </button>

                {/* Text input */}
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  placeholder={isLoading ? loadingMsg : "Paste a YouTube link, idea, or text…"}
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    fontSize: "0.95rem",
                    color: isLoading ? "#4b5563" : "#e2e8f0",
                    fontFamily: "'Inter', sans-serif",
                    caretColor: "#3a86ff",
                    minWidth: 0,
                    transition: "color 300ms ease",
                  }}
                  className="placeholder:text-[#374151]"
                />

                {/* Send / Spinner button */}
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={!canSend}
                  onMouseDown={() => setSendPressing(true)}
                  onMouseUp={() => setSendPressing(false)}
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    border: "none",
                    background: isLoading
                      ? "rgba(58,134,255,0.5)"
                      : canSend
                      ? "#3a86ff"
                      : "rgba(58,134,255,0.3)",
                    color: "#ffffff",
                    cursor: canSend ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: canSend && !isLoading ? "0 0 20px rgba(58,134,255,0.4)" : "none",
                    transition: "background 200ms ease, box-shadow 200ms ease, transform 150ms ease",
                    transform: sendPressing && canSend ? "scale(0.92)" : "scale(1)",
                    willChange: "transform",
                  }}
                  onMouseEnter={(e) => {
                    if (canSend && !isLoading) {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = "#2563eb";
                      el.style.boxShadow = "0 0 28px rgba(58,134,255,0.6)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    setSendPressing(false);
                    if (canSend && !isLoading) {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = "#3a86ff";
                      el.style.boxShadow = "0 0 20px rgba(58,134,255,0.4)";
                    }
                  }}
                  aria-label={isLoading ? "Generating…" : "Generate"}
                >
                  {isLoading ? <SpinnerIcon /> : <SendIcon />}
                </button>
              </div>
            </div>

            {/* Loading status strip below input */}
            <div style={{ height: "28px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "10px" }}>
              {isLoading && (
                <>
                  <div style={{ display: "flex", gap: "5px" }}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="loading-dot" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                  <span style={{ fontSize: "12px", color: "#4b5563", fontFamily: "'Inter', sans-serif", transition: "opacity 300ms ease" }}>
                    {loadingMsg}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Suggestion Cards */}
          <div
            className="suggestion-grid"
            style={{
              width: "100%",
              maxWidth: "720px",
              marginTop: "28px",
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "12px",
            }}
          >
            {SUGGESTION_CARDS.map((card, i) => (
              <button
                key={card.title}
                type="button"
                ref={(el) => { suggestionRefs.current[i] = el; }}
                onClick={() => {
                  if (!isLoading) {
                    setInputValue(card.placeholder);
                    inputRef.current?.focus();
                  }
                }}
                style={{
                  textAlign: "left",
                  borderRadius: "16px",
                  padding: "20px",
                  background: "rgba(8,14,30,0.55)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  transition: "all 400ms cubic-bezier(0.4,0,0.2,1)",
                  opacity: 0,
                  transform: `scale(0.97) translateY(12px)`,
                  willChange: "transform, opacity",
                  minHeight: "44px",
                }}
                onMouseEnter={(e) => {
                  if (isLoading) return;
                  const el = e.currentTarget as HTMLElement;
                  el.style.border = "1px solid rgba(59,130,246,0.3)";
                  el.style.background = "rgba(10,18,42,0.75)";
                  el.style.transform = "translateY(-4px) scale(1)";
                  el.style.boxShadow = "0 8px 32px rgba(59,130,246,0.12), 0 0 0 1px rgba(59,130,246,0.1)";
                }}
                onMouseLeave={(e) => {
                  if (isLoading) return;
                  const el = e.currentTarget as HTMLElement;
                  el.style.border = "1px solid rgba(255,255,255,0.05)";
                  el.style.background = "rgba(8,14,30,0.55)";
                  el.style.transform = "translateY(0) scale(1)";
                  el.style.boxShadow = "0 4px 16px rgba(0,0,0,0.2)";
                }}
              >
                <div style={{ fontSize: "30px", marginBottom: "10px", lineHeight: 1 }}>{card.emoji}</div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#e2e8f0", fontFamily: "'Inter', sans-serif", marginBottom: "6px", letterSpacing: "-0.01em" }}>
                  {card.title}
                </div>
                <div style={{ fontSize: "12.5px", color: "#4b5563", fontFamily: "'Inter', sans-serif", lineHeight: 1.55 }}>
                  {card.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </DashboardLayout>
  );
}
