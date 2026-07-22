import { useEffect, useState } from "react";
import { api, clearToken, getStoredToken } from "./api";
import type { User, View } from "./types";
import LoginPage from "./pages/LoginPage";
import Sidebar from "./components/Sidebar";
import DashboardView from "./pages/DashbordView";
import ApplicantsView from "./pages/ApplicantsView";
import logoImg from "./assets/logo.png";

type AuthState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "authenticated"; user: User }
  | { status: "session-expired" };

export default function App() {
  const [auth, setAuth] = useState<AuthState>({ status: "loading" });
  const [view, setView] = useState<View>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setAuth({ status: "unauthenticated" });
      return;
    }
    api
      .getMe()
      .then((res) => {
        if (res.ok && res.data) {
          setAuth({ status: "authenticated", user: res.data });
        } else {
          clearToken();
          setAuth({ status: "unauthenticated" });
        }
      })
      .catch(() => {
        setAuth({ status: "unauthenticated" });
      });
  }, []);

  function handleLogin(user: User) {
    setAuth({ status: "authenticated", user });
  }

  async function handleLogout() {
    await api.logout().catch(() => {});
    clearToken();
    setAuth({ status: "unauthenticated" });
  }

  function handleUnauthorized() {
    clearToken();
    setAuth({ status: "session-expired" });
  }

  if (auth.status === "loading") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#fdf8f2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LoadingSpinner />
      </div>
    );
  }

  if (auth.status === "session-expired") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#fdf8f2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e8dfd6",
            borderRadius: 12,
            padding: "40px 32px",
            textAlign: "center",
            maxWidth: 380,
            width: "100%",
            boxShadow: "0 2px 16px rgba(26,26,26,0.06)",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              background: "rgba(245, 130, 15, 0.08)",
              border: "1px solid rgba(245, 130, 15, 0.2)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="11"
                width="18"
                height="11"
                rx="2"
                stroke="#f5820f"
                strokeWidth="1.8"
              />
              <path
                d="M7 11V7a5 5 0 0110 0v4"
                stroke="#f5820f"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <circle cx="12" cy="16" r="1.5" fill="#f5820f" />
            </svg>
          </div>
          <img
            src={logoImg}
            alt="INFNOVA Technologies"
            style={{ height: 36, objectFit: "contain", marginBottom: 16 }}
          />
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#1a1a1a",
              marginBottom: 8,
              letterSpacing: "-0.01em",
            }}
          >
            Session expired
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "#a89d96",
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            Your session has expired after 1 hour of inactivity. Please sign in
            again to continue.
          </p>
          <button
            onClick={() => setAuth({ status: "unauthenticated" })}
            style={{
              width: "100%",
              padding: "11px",
              background: "#f5820f",
              border: "none",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Sign in again
          </button>
        </div>
      </div>
    );
  }

  if (auth.status === "unauthenticated") {
    return <LoginPage onLogin={handleLogin} />;
  }

  const { user } = auth;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Desktop sidebar */}
      <div
        className="lg-sidebar"
        style={{ width: 220, flexShrink: 0, height: "100%", display: "none" }}
      >
        <Sidebar
          user={user}
          view={view}
          onNavigate={setView}
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              zIndex: 30,
            }}
          />
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              bottom: 0,
              width: 240,
              zIndex: 40,
            }}
          >
            <Sidebar
              user={user}
              view={view}
              onNavigate={setView}
              onLogout={handleLogout}
              mobile
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </>
      )}

      {/* Main area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        {/* Mobile top bar */}
        <div
          className="mobile-topbar"
          style={{
            background: "#fff",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background: "none",
              border: "none",
              color: "#7a6e66",
              cursor: "pointer",
              padding: 4,
              display: "flex",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M3 5h14M3 10h14M3 15h14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <img
            src={logoImg}
            alt="INFNOVA Technologies"
            style={{ height: 28, objectFit: "contain" }}
          />
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", background: "#fdf8f2" }}>
          {view === "dashboard" ? (
            <DashboardView onUnauthorized={handleUnauthorized} />
          ) : (
            <ApplicantsView onUnauthorized={handleUnauthorized} />
          )}
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .lg-sidebar { display: block !important; }
          .mobile-topbar { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      style={{ animation: "spin 0.75s linear infinite" }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <circle
        cx="16"
        cy="16"
        r="12"
        stroke="rgba(245,130,15,0.15)"
        strokeWidth="3"
      />
      <path
        d="M16 4a12 12 0 0112 12"
        stroke="#f5820f"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
