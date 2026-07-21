import React from "react";
import type { User, View } from "../types";
import logoImg from "../assets/logo.png";

interface Props {
  user: User;
  view: View;
  onNavigate: (v: View) => void;
  onLogout: () => void;
  mobile?: boolean;
  onClose?: () => void;
}

const navItems: { id: View; label: string; icon: React.ReactElement }[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" />
        <rect
          x="9"
          y="1"
          width="6"
          height="6"
          rx="1.5"
          fill="currentColor"
          opacity="0.5"
        />
        <rect
          x="1"
          y="9"
          width="6"
          height="6"
          rx="1.5"
          fill="currentColor"
          opacity="0.5"
        />
        <rect
          x="9"
          y="9"
          width="6"
          height="6"
          rx="1.5"
          fill="currentColor"
          opacity="0.3"
        />
      </svg>
    ),
  },
  {
    id: "applicants",
    label: "Applicants",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="6" cy="5" r="3" fill="currentColor" />
        <path
          d="M1 13c0-2.761 2.239-5 5-5s5 2.239 5 5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M11 8.5a2.5 2.5 0 100-5"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path
          d="M13.5 13c0-2-1.5-3.5-2.5-4"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          opacity="0.6"
        />
      </svg>
    ),
  },
];

export default function Sidebar({
  user,
  view,
  onNavigate,
  onLogout,
  mobile,
  onClose,
}: Props) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "18px 20px 16px",
          borderBottom: "1px solid #2d2d2d",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <img
          src={logoImg}
          alt="INFNOVA Technologies"
          style={{ height: 36, objectFit: "contain", objectPosition: "left" }}
        />
        {mobile && (
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#7a6e66",
              cursor: "pointer",
              padding: 4,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M15 5L5 15M5 5l10 10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav
        style={{
          padding: "12px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <p
          style={{
            fontSize: 10,
            fontFamily: "var(--font-mono)",
            color: "#454545",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "4px 8px 8px",
          }}
        >
          Navigation
        </p>
        {navItems.map((item) => {
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                onClose?.();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 10px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
                background: active ? "rgba(245, 130, 15, 0.12)" : "transparent",
                color: active ? "#f5820f" : "#7a6e66",
                fontSize: 14,
                fontWeight: active ? 500 : 400,
                transition: "all 0.15s",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.color = "#b5a99f";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#7a6e66";
                }
              }}
            >
              {active && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 3,
                    height: 20,
                    background: "#f5820f",
                    borderRadius: "0 2px 2px 0",
                  }}
                />
              )}
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer / user */}
      <div style={{ borderTop: "1px solid #2d2d2d", padding: "14px 16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              background: "#2d2d2d",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 600,
              color: "#f5820f",
              flexShrink: 0,
            }}
          >
            {user.fullName.charAt(0)}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "#e8dfd6",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.fullName}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#555555",
                fontFamily: "var(--font-mono)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.role}
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            padding: "8px 10px",
            borderRadius: 6,
            border: "none",
            background: "transparent",
            color: "#7a6e66",
            fontSize: 13,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.08)";
            e.currentTarget.style.color = "#f87171";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#7a6e66";
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M5 12H2.5A1.5 1.5 0 011 10.5v-7A1.5 1.5 0 012.5 2H5M9.5 10L13 7m0 0L9.5 4M13 7H5"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Sign out
        </button>
      </div>
    </div>
  );
}
