import { useState, ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import AmbientGlow from "./AmbientGlow";

interface DashboardLayoutProps {
  children: ReactNode;
  breadcrumb?: string;
}

export default function DashboardLayout({ children, breadcrumb = "Retno" }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarWidth = collapsed ? 68 : 240;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#02040a",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <AmbientGlow />

      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 35,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            animation: "fadeIn 200ms ease both",
          }}
        />
      )}

      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <Header
        sidebarWidth={sidebarWidth}
        breadcrumb={breadcrumb}
        onMobileMenuOpen={() => setMobileOpen(true)}
      />

      <main
        style={{
          position: "relative",
          zIndex: 1,
          paddingTop: "64px",
          minHeight: "100vh",
          transition: "margin-left 500ms cubic-bezier(0.4,0,0.2,1)",
        }}
        className="ml-0 md:ml-[var(--sidebar-w,68px)]"
      >
        <style>{`
          @media (min-width: 768px) {
            main { margin-left: ${sidebarWidth}px !important; }
          }
        `}</style>
        {children}
      </main>

      <footer
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          paddingBottom: "16px",
          fontSize: "11px",
          color: "#374151",
          pointerEvents: "none",
          zIndex: 10,
          whiteSpace: "nowrap",
        }}
      >
        Developed by Abdul Ahad Ahmed
      </footer>
    </div>
  );
}
