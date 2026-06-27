import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface SelectFieldProps {
  label: string;
  description: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SelectField({ label, description, value, options, onChange }: SelectFieldProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px", flexWrap: "wrap" }}>
      <div>
        <div style={{ fontSize: "0.9375rem", fontWeight: 500, color: "#e2e8f0", fontFamily: "'Inter', sans-serif", marginBottom: "4px" }}>
          {label}
        </div>
        <div style={{ fontSize: "0.8125rem", color: "#4b5563", fontFamily: "'Inter', sans-serif" }}>
          {description}
        </div>
      </div>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            appearance: "none",
            WebkitAppearance: "none",
            paddingLeft: "16px",
            paddingRight: "40px",
            paddingTop: "10px",
            paddingBottom: "10px",
            borderRadius: "12px",
            background: "rgba(8,14,30,0.8)",
            border: "1px solid rgba(255,255,255,0.09)",
            color: "#e2e8f0",
            fontSize: "0.875rem",
            fontFamily: "'Inter', sans-serif",
            cursor: "pointer",
            outline: "none",
            minWidth: "190px",
            transition: "border-color 200ms ease, box-shadow 200ms ease",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "rgba(59,130,246,0.45)";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {options.map((opt) => (
            <option key={opt} value={opt} style={{ background: "#050b18", color: "#e2e8f0" }}>
              {opt}
            </option>
          ))}
        </select>
        <div style={{ position: "absolute", right: "13px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#4b5563" }}>
          <ChevronDownIcon />
        </div>
      </div>
    </div>
  );
}

interface RevealCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  delay?: number;
}

function RevealCard({ title, subtitle, children, delay = 0 }: RevealCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        borderRadius: "20px",
        padding: "28px 32px",
        background: "rgba(6,12,26,0.6)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
        opacity: 0,
        transform: "translateY(20px)",
        transition: `opacity 500ms ease ${delay}ms, transform 500ms cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
        willChange: "transform, opacity",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#e2e8f0", fontFamily: "'Inter', sans-serif", marginBottom: "4px" }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: "0.8125rem", color: "#4b5563", fontFamily: "'Inter', sans-serif" }}>
            {subtitle}
          </p>
        )}
      </div>
      <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", marginBottom: "22px" }} />
      {children}
    </div>
  );
}

const LANGUAGE_OPTIONS = ["English", "Urdu", "Hindi", "Spanish", "Arabic", "French", "Portuguese", "German"];
const TONE_OPTIONS = ["Viral & Energetic", "Professional", "Casual & Fun", "Educational", "Motivational", "Inspirational"];

export default function Settings() {
  const [language, setLanguage] = useState("English");
  const [tone, setTone] = useState("Viral & Energetic");
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const timer = setTimeout(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DashboardLayout breadcrumb="Settings">
      <div style={{ padding: "48px 32px 80px", minHeight: "calc(100vh - 64px)", maxWidth: "780px" }}>
        {/* Page header */}
        <div
          ref={headerRef}
          style={{
            marginBottom: "36px",
            opacity: 0,
            transform: "translateY(16px)",
            transition: "opacity 600ms ease, transform 600ms ease",
            willChange: "transform, opacity",
          }}
        >
          <h1 style={{ fontSize: "2rem", fontWeight: 300, color: "#ffffff", fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em", marginBottom: "8px" }}>
            Settings
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#6b7280", fontFamily: "'Inter', sans-serif" }}>
            Customize your Retno experience
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <RevealCard title="Output Language" subtitle="Choose the language for your generated scripts" delay={80}>
            <SelectField
              label="Language"
              description="All generated scripts will be in this language"
              value={language}
              options={LANGUAGE_OPTIONS}
              onChange={setLanguage}
            />
          </RevealCard>

          <RevealCard title="Default Tone" subtitle="Set the default tone for your viral scripts" delay={160}>
            <SelectField
              label="Tone"
              description="Controls the energy and style of generated hooks"
              value={tone}
              options={TONE_OPTIONS}
              onChange={setTone}
            />
          </RevealCard>

          <RevealCard title="Session & History" subtitle="How your scripts are stored" delay={240}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "14px 16px", borderRadius: "12px", background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.12)" }}>
                <div style={{ fontSize: "18px", flexShrink: 0, marginTop: "2px" }}>💾</div>
                <div>
                  <div style={{ fontSize: "13.5px", fontWeight: 500, color: "#93c5fd", fontFamily: "'Inter', sans-serif", marginBottom: "4px" }}>
                    Auto-save enabled
                  </div>
                  <div style={{ fontSize: "12.5px", color: "#4b5563", fontFamily: "'Inter', sans-serif", lineHeight: 1.55 }}>
                    Scripts are saved automatically after generation and stored for 30 days. Log in to sync across devices.
                  </div>
                </div>
              </div>
            </div>
          </RevealCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
