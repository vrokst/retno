import { useEffect, useRef } from "react";

export default function AmbientGlow() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleVisibility() {
      if (!container) return;
      const orbs = container.querySelectorAll<HTMLElement>(".ambient-orb");
      if (document.hidden) {
        orbs.forEach((o) => (o.style.animationPlayState = "paused"));
      } else {
        orbs.forEach((o) => (o.style.animationPlayState = "running"));
      }
    }

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  return (
    <>
      <style>{`
        @keyframes orbFloat1 {
          0%   { transform: translate(-50%, -50%) scale(1);    }
          100% { transform: translate(-45%, -55%) scale(1.12); }
        }
        @keyframes orbFloat2 {
          0%   { transform: translate(0, 0) scale(1);           }
          100% { transform: translate(-50px, 35px) scale(1.10); }
        }
        @keyframes orbFloat3 {
          0%   { transform: translate(0, 0) scale(1);           }
          100% { transform: translate(35px, -45px) scale(1.08); }
        }
        .ambient-orb {
          will-change: transform, opacity;
        }
      `}</style>
      <div
        ref={containerRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        {/* Orb 1 — deep blue, center */}
        <div
          className="ambient-orb"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "900px",
            height: "900px",
            background: "radial-gradient(circle, rgba(30,64,175,0.22) 0%, transparent 68%)",
            filter: "blur(80px)",
            animation: "orbFloat1 9s ease-in-out infinite alternate",
          }}
        />

        {/* Orb 2 — deep purple, top-left */}
        <div
          className="ambient-orb"
          style={{
            position: "absolute",
            top: "-100px",
            left: "0%",
            width: "800px",
            height: "800px",
            background: "radial-gradient(circle, rgba(88,28,135,0.16) 0%, transparent 68%)",
            filter: "blur(100px)",
            animation: "orbFloat2 11s ease-in-out infinite alternate",
          }}
        />

        {/* Orb 3 — deep teal, bottom-right */}
        <div
          className="ambient-orb"
          style={{
            position: "absolute",
            bottom: "-120px",
            right: "0%",
            width: "800px",
            height: "800px",
            background: "radial-gradient(circle, rgba(15,118,110,0.12) 0%, transparent 68%)",
            filter: "blur(110px)",
            animation: "orbFloat3 13s ease-in-out infinite alternate",
          }}
        />
      </div>
    </>
  );
}
