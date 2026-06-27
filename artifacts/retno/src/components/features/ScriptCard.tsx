import { useState, useRef, useEffect } from "react";
import { formatScriptForClipboard, type ScriptData } from "@/utils/exportScripts";

interface ScriptCardProps {
  script: ScriptData;
  index: number;
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 10V2.5A.5.5 0 012.5 2H10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2.5 7l3 3 6-6" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface SectionProps {
  label: string;
  content: string;
  labelColor: string;
  italic?: boolean;
}

function Section({ label, content, labelColor, italic = false }: SectionProps) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <div
        style={{
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.12em",
          color: labelColor,
          textTransform: "uppercase",
          marginBottom: "6px",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {label}
      </div>
      <p
        style={{
          fontSize: "13.5px",
          color: "#e2e8f0",
          fontFamily: "'Inter', sans-serif",
          lineHeight: 1.65,
          margin: 0,
          fontStyle: italic ? "italic" : "normal",
        }}
      >
        {content}
      </p>
    </div>
  );
}

export default function ScriptCard({ script, index }: ScriptCardProps) {
  const [copied, setCopied] = useState(false);
  const [pressing, setPressing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Intersection Observer scroll-reveal
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
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatScriptForClipboard(script));
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = formatScriptForClipboard(script);
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      ref={cardRef}
      style={{
        borderRadius: "18px",
        background: "rgba(5,11,24,0.6)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.05)",
        overflow: "hidden",
        // Start hidden for scroll reveal
        opacity: 0,
        transform: `translateY(30px)`,
        transition: `opacity 500ms ease ${index * 80}ms, transform 500ms cubic-bezier(0.4,0,0.2,1) ${index * 80}ms, box-shadow 300ms ease`,
        willChange: "transform, opacity",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(59,130,246,0.1)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          background: "rgba(5,11,24,0.4)",
        }}
      >
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#e2e8f0", fontFamily: "'Inter', sans-serif" }}>
          Script {index + 1}
        </span>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "#3a86ff",
            background: "rgba(58,134,255,0.12)",
            border: "1px solid rgba(58,134,255,0.2)",
            borderRadius: "9999px",
            padding: "3px 10px",
            letterSpacing: "0.02em",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {script.hookType}
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: "20px 20px 4px" }}>
        <Section label="Hook" content={script.hook} labelColor="#3a86ff" />
        <Section label="Body" content={script.body} labelColor="#9ca3af" />
        <Section label="Call to Action" content={script.cta} labelColor="#9ca3af" />
        <Section label="Visual Cues" content={script.visualCues} labelColor="#a78bfa" italic />

        {/* Hashtags */}
        <div style={{ marginBottom: "16px" }}>
          <div
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: "#9ca3af",
              textTransform: "uppercase",
              marginBottom: "8px",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Hashtags
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {script.hashtags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: "11.5px",
                  color: "#9ca3af",
                  background: "rgba(5,11,24,0.8)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "9999px",
                  padding: "3px 10px",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                #{tag.replace(/^#/, "")}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div
        style={{
          padding: "12px 20px",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <button
          onClick={handleCopy}
          onMouseDown={() => setPressing(true)}
          onMouseUp={() => setPressing(false)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "7px 14px",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.08)",
            background: copied ? "rgba(74,222,128,0.08)" : "rgba(255,255,255,0.05)",
            color: copied ? "#4ade80" : "#9ca3af",
            fontSize: "12px",
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 200ms ease",
            transform: pressing ? "scale(0.96)" : "scale(1)",
            minHeight: "36px",
            minWidth: "44px",
          }}
          onMouseEnter={(e) => {
            if (!copied) {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.10)";
              (e.currentTarget as HTMLElement).style.color = "#e2e8f0";
            }
          }}
          onMouseLeave={(e) => {
            setPressing(false);
            if (!copied) {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
              (e.currentTarget as HTMLElement).style.color = "#9ca3af";
            }
          }}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? "Copied!" : "Copy Script"}
        </button>
      </div>
    </div>
  );
}
