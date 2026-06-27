import { useAuth } from "@workspace/replit-auth-web";
import { Link, useLocation } from "wouter";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function HamburgerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function HouseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7.5 18V13h5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2l1.5 4.5L16 8l-4.5 1.5L10 14l-1.5-4.5L4 8l4.5-1.5L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M16 14l.75 2.25L19 17l-2.25.75L16 20l-.75-2.25L13 17l2.25-.75L16 14z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.41 1.41M14.37 14.37l1.41 1.41M4.22 15.78l1.41-1.41M14.37 5.63l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", icon: <HouseIcon />, href: "/" },
  { label: "New Script", icon: <SparkleIcon />, href: "/" },
  { label: "History", icon: <ClockIcon />, href: "/history" },
  { label: "Settings", icon: <GearIcon />, href: "/settings" },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const sidebarContent = (isMobile: boolean) => (
    <>
      {/* Logo Area */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: "64px",
          flexShrink: 0,
          overflow: "hidden",
          padding: !isMobile && collapsed ? "0 14px" : "0 16px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, rgba(58,134,255,0.25) 0%, rgba(99,102,241,0.2) 100%)",
            border: "1px solid rgba(58,134,255,0.35)",
            boxShadow: "0 0 20px rgba(58,134,255,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: "16px",
            color: "#60a5fa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          R
        </div>

        <span
          style={{
            marginLeft: "10px",
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: "15px",
            letterSpacing: "-0.01em",
            color: "#e2e8f0",
            opacity: isMobile || !collapsed ? 1 : 0,
            transform: isMobile || !collapsed ? "translateX(0)" : "translateX(-10px)",
            transition: "opacity 300ms ease, transform 300ms ease",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          Retno
        </span>

        {!isMobile && (
          <button
            onClick={onToggle}
            style={{
              marginLeft: "auto",
              minWidth: "30px",
              width: "30px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
              color: "#4b5563",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              transition: "color 200ms ease, background 200ms ease",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#e2e8f0";
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#4b5563";
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
            aria-label="Toggle sidebar"
          >
            <HamburgerIcon />
          </button>
        )}

        {isMobile && (
          <button
            onClick={onMobileClose}
            style={{
              marginLeft: "auto",
              width: "30px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
              color: "#4b5563",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              flexShrink: 0,
            }}
            aria-label="Close menu"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Nav Items */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "4px 8px", flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/" ? location === "/" : location.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={isMobile ? onMobileClose : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                borderRadius: "12px",
                height: "44px",
                padding: !isMobile && collapsed ? "0 12px" : "0 14px",
                gap: "12px",
                color: isActive ? "#93c5fd" : "#6b7280",
                background: isActive
                  ? "linear-gradient(135deg, rgba(37,99,235,0.25) 0%, rgba(79,70,229,0.2) 100%)"
                  : "transparent",
                boxShadow: isActive
                  ? "0 0 16px rgba(59,130,246,0.15), inset 0 1px 0 rgba(255,255,255,0.06)"
                  : "none",
                border: isActive ? "1px solid rgba(59,130,246,0.2)" : "1px solid transparent",
                cursor: "pointer",
                textDecoration: "none",
                whiteSpace: "nowrap",
                overflow: "hidden",
                transition: "all 300ms cubic-bezier(0.4,0,0.2,1)",
                minHeight: "44px",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                  (e.currentTarget as HTMLElement).style.color = "#e2e8f0";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#6b7280";
                }
              }}
            >
              <span style={{ flexShrink: 0, display: "flex" }}>{item.icon}</span>
              <span
                style={{
                  opacity: isMobile || !collapsed ? 1 : 0,
                  transform: isMobile || !collapsed ? "translateX(0)" : "translateX(-8px)",
                  transition: "opacity 300ms ease, transform 300ms ease",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom avatar */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          marginBottom: "20px",
          padding: !isMobile && collapsed ? "0 14px" : "0 16px",
        }}
      >
        <div style={{ position: "relative", width: "38px", height: "38px", flexShrink: 0 }}>
          <div
            style={{
              position: "absolute",
              inset: "-2px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6, #6366f1, #8b5cf6)",
              backgroundSize: "200% 200%",
              animation: "gradientRing 3s ease-in-out infinite alternate",
            }}
          />
          <div
            style={{
              position: "relative",
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              background: "rgba(30,41,59,0.9)",
              border: "2px solid #02040a",
              color: "#60a5fa",
              fontSize: "12px",
              fontWeight: 700,
              fontFamily: "'Inter', sans-serif",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {isAuthenticated && user?.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
            ) : isAuthenticated && user ? (
              (user.firstName?.[0] ?? "U").toUpperCase()
            ) : (
              "AA"
            )}
          </div>
        </div>

        <div
          style={{
            marginLeft: "10px",
            opacity: isMobile || !collapsed ? 1 : 0,
            transform: isMobile || !collapsed ? "translateX(0)" : "translateX(-8px)",
            transition: "opacity 300ms ease, transform 300ms ease",
            pointerEvents: isMobile || !collapsed ? "auto" : "none",
          }}
        >
          <div style={{ fontSize: "13px", fontWeight: 500, color: "#e2e8f0", whiteSpace: "nowrap", fontFamily: "'Inter', sans-serif" }}>
            {isAuthenticated && user ? (user.firstName ?? user.email ?? "User") : "Abdul Ahad"}
          </div>
          <div style={{ fontSize: "11px", color: "#4b5563", whiteSpace: "nowrap", fontFamily: "'Inter', sans-serif" }}>
            {isAuthenticated ? "Pro" : "Free Plan"}
          </div>
        </div>
      </div>
    </>
  );

  const sharedStyle: React.CSSProperties = {
    top: 0,
    height: "100%",
    zIndex: 40,
    display: "flex",
    flexDirection: "column",
    background: "rgba(4,8,20,0.85)",
    backdropFilter: "blur(28px)",
    WebkitBackdropFilter: "blur(28px)",
    borderRight: "1px solid rgba(255,255,255,0.05)",
  };

  return (
    <>
      <style>{`
        @keyframes gradientRing {
          0%   { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        @media (max-width: 767px) {
          .sidebar-desktop { display: none !important; }
        }
        @media (min-width: 768px) {
          .sidebar-mobile { display: none !important; }
        }
      `}</style>

      {/* Desktop sidebar */}
      <aside
        className="sidebar-desktop"
        style={{
          ...sharedStyle,
          position: "fixed",
          left: 0,
          width: collapsed ? "68px" : "240px",
          transition: "width 500ms cubic-bezier(0.4,0,0.2,1)",
          overflow: "hidden",
        }}
      >
        {sidebarContent(false)}
      </aside>

      {/* Mobile sidebar overlay */}
      <aside
        className="sidebar-mobile"
        style={{
          ...sharedStyle,
          position: "fixed",
          left: 0,
          width: "260px",
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 350ms cubic-bezier(0.4,0,0.2,1)",
          overflow: "hidden",
        }}
      >
        {sidebarContent(true)}
      </aside>
    </>
  );
}
