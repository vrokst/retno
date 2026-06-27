import { useAuth } from "@workspace/replit-auth-web";

interface HeaderProps {
  sidebarWidth: number;
  breadcrumb: string;
  onMobileMenuOpen: () => void;
}

function HamburgerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2.5 13.5c0-2.485 2.462-4.5 5.5-4.5s5.5 2.015 5.5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export default function Header({ sidebarWidth, breadcrumb, onMobileMenuOpen }: HeaderProps) {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();

  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          .header-root { left: 0 !important; }
          .header-hamburger { display: flex !important; }
        }
        @media (min-width: 768px) {
          .header-hamburger { display: none !important; }
        }
      `}</style>
      <header
        className="header-root"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          left: `${sidebarWidth}px`,
          zIndex: 30,
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          background: "rgba(5,11,24,0.4)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          transition: "left 500ms cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Mobile hamburger */}
          <button
            className="header-hamburger"
            onClick={onMobileMenuOpen}
            style={{
              display: "none",
              width: "36px",
              height: "36px",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "9px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "#9ca3af",
              cursor: "pointer",
              transition: "all 200ms ease",
              flexShrink: 0,
            }}
            aria-label="Open menu"
          >
            <HamburgerIcon />
          </button>

          <span style={{ fontSize: "0.875rem", color: "#9ca3af", fontFamily: "'Inter', sans-serif" }}>
            {breadcrumb}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Online badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              borderRadius: "9999px",
              padding: "5px 12px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <span style={{ position: "relative", display: "flex", width: "8px", height: "8px" }}>
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: "#4ade80",
                  opacity: 0.75,
                  animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite",
                }}
              />
              <span style={{ position: "relative", borderRadius: "50%", width: "8px", height: "8px", background: "#4ade80" }} />
            </span>
            <span
              style={{
                fontFamily: "Menlo, monospace",
                fontSize: "10px",
                fontWeight: 600,
                color: "#4ade80",
                letterSpacing: "0.08em",
              }}
            >
              ONLINE
            </span>
          </div>

          {/* Auth */}
          {!isLoading && (
            isAuthenticated && user ? (
              user.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt={user.firstName ?? "User"}
                  loading="lazy"
                  onClick={logout}
                  title="Click to log out"
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    border: "1px solid rgba(58,134,255,0.3)",
                    objectFit: "cover",
                    cursor: "pointer",
                    transition: "transform 200ms ease",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.05)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                />
              ) : (
                <button
                  onClick={logout}
                  title="Log out"
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "rgba(58,134,255,0.18)",
                    border: "1px solid rgba(58,134,255,0.3)",
                    color: "#3a86ff",
                    fontSize: "12px",
                    fontWeight: 700,
                    fontFamily: "'Inter', sans-serif",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "transform 200ms ease",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.05)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                >
                  {(user.firstName?.[0] ?? "U").toUpperCase()}
                </button>
              )
            ) : (
              <button
                onClick={login}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  background: "rgba(58,134,255,0.1)",
                  border: "1px solid rgba(58,134,255,0.25)",
                  color: "#3a86ff",
                  fontSize: "12px",
                  fontWeight: 500,
                  fontFamily: "'Inter', sans-serif",
                  cursor: "pointer",
                  transition: "all 200ms ease",
                  minHeight: "34px",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "rgba(58,134,255,0.2)";
                  el.style.borderColor = "rgba(58,134,255,0.4)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "rgba(58,134,255,0.1)";
                  el.style.borderColor = "rgba(58,134,255,0.25)";
                }}
              >
                <UserIcon />
                Log in
              </button>
            )
          )}
        </div>
      </header>
    </>
  );
}
