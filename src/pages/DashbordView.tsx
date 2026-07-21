import { useEffect, useState } from "react";
import { api } from "../api";
import type { DashboardSummary } from "../types";

interface Props {
  onUnauthorized: () => void;
}

const trackLabels: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  "ui-ux": "UI/UX",
  "data-analytics": "Data Analytics",
  mobile: "Mobile",
};

const statusConfig: Record<string, { color: string; label: string }> = {
  pending: { color: "#f59e0b", label: "Pending" },
  shortlisted: { color: "#3b82f6", label: "Shortlisted" },
  accepted: { color: "#22c55e", label: "Accepted" },
  rejected: { color: "#ef4444", label: "Rejected" },
};

const trackColors = ["#f5820f", "#f5a843", "#d06a00", "#e8a000", "#c45e00"];

export default function DashboardView({ onUnauthorized }: Props) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const res = await api.getDashboardSummary();
      if (res.status === 401) {
        onUnauthorized();
        return;
      }
      if (res.ok && res.data) {
        setSummary(res.data);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error)
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 320,
          gap: 12,
        }}
      >
        <div style={{ fontSize: 32 }}>⚠</div>
        <p style={{ color: "#a89d96", fontSize: 14 }}>
          Failed to load dashboard data.
        </p>
        <button onClick={load} style={retryBtnStyle}>
          Retry
        </button>
      </div>
    );
  if (!summary) return null;

  const statusEntries = Object.entries(summary.byStatus);
  const trackEntries = Object.entries(summary.byTrack);
  const maxStatus = Math.max(...statusEntries.map(([, v]) => v), 1);
  const maxTrack = Math.max(...trackEntries.map(([, v]) => v), 1);

  return (
    <div style={{ padding: "28px 32px", maxWidth: 960, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#1a1a1a",
            letterSpacing: "-0.02em",
            marginBottom: 4,
          }}
        >
          Dashboard
        </h1>
        <p style={{ fontSize: 13, color: "#a89d96" }}>
          Overview of internship applications
        </p>
      </div>

      {/* Total card */}
      <div
        style={{
          background: "#f5820f",
          borderRadius: 12,
          padding: "24px 28px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -30,
            top: -30,
            width: 160,
            height: 160,
            background: "rgba(255,255,255,0.07)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 60,
            bottom: -40,
            width: 120,
            height: 120,
            background: "rgba(255,255,255,0.05)",
            borderRadius: "50%",
          }}
        />
        <div>
          <p
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.65)",
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Total Applicants
          </p>
          <p
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            {summary.totalApplicants}
          </p>
        </div>
        <div
          style={{
            width: 56,
            height: 56,
            background: "rgba(255,255,255,0.15)",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <circle cx="9" cy="7" r="4" fill="white" opacity="0.9" />
            <path
              d="M2 20c0-3.314 3.134-6 7-6s7 2.686 7 6"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.9"
            />
            <path
              d="M16 10a3 3 0 100-6"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity="0.55"
            />
            <path
              d="M20 20c0-2.4-1.8-4.2-3-4.8"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity="0.55"
            />
          </svg>
        </div>
      </div>

      {/* Two columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* By Status */}
        <div style={cardStyle}>
          <p style={sectionLabel}>By Status</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {statusEntries.map(([key, count]) => {
              const cfg = statusConfig[key] ?? { color: "#a89d96", label: key };
              const pct = (count / maxStatus) * 100;
              return (
                <div key={key}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        fontSize: 13,
                        color: "#3d3632",
                        fontWeight: 500,
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: cfg.color,
                          flexShrink: 0,
                        }}
                      />
                      {cfg.label}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 13,
                        color: "#1a1a1a",
                        fontWeight: 500,
                      }}
                    >
                      {count}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 4,
                      background: "#f5ede3",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: cfg.color,
                        borderRadius: 4,
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* By Track */}
        <div style={cardStyle}>
          <p style={sectionLabel}>By Track</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {trackEntries.map(([key, count], i) => {
              const pct = (count / maxTrack) * 100;
              const color = trackColors[i % trackColors.length];
              return (
                <div key={key}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        fontSize: 13,
                        color: "#3d3632",
                        fontWeight: 500,
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 2,
                          background: color,
                          flexShrink: 0,
                        }}
                      />
                      {trackLabels[key] ?? key}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 13,
                        color: "#1a1a1a",
                        fontWeight: 500,
                      }}
                    >
                      {count}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 4,
                      background: "#f5ede3",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: color,
                        borderRadius: 4,
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div style={{ padding: "28px 32px", maxWidth: 960, margin: "0 auto" }}>
      <div
        className="skeleton"
        style={{ width: 160, height: 22, borderRadius: 6, marginBottom: 8 }}
      />
      <div
        className="skeleton"
        style={{ width: 260, height: 14, borderRadius: 4, marginBottom: 28 }}
      />
      <div
        className="skeleton"
        style={{ height: 108, borderRadius: 12, marginBottom: 20 }}
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {[0, 1].map((i) => (
          <div key={i} style={cardStyle}>
            <div
              className="skeleton"
              style={{
                width: 80,
                height: 12,
                borderRadius: 4,
                marginBottom: 20,
              }}
            />
            {[0, 1, 2, 3].map((j) => (
              <div key={j} style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <div
                    className="skeleton"
                    style={{ width: 80, height: 13, borderRadius: 4 }}
                  />
                  <div
                    className="skeleton"
                    style={{ width: 24, height: 13, borderRadius: 4 }}
                  />
                </div>
                <div
                  className="skeleton"
                  style={{ height: 4, borderRadius: 4 }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e8dfd6",
  borderRadius: 10,
  padding: "20px 22px",
};

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  fontFamily: "var(--font-mono)",
  color: "#a89d96",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  marginBottom: 18,
};

const retryBtnStyle: React.CSSProperties = {
  padding: "8px 20px",
  background: "#f5820f",
  border: "none",
  borderRadius: 6,
  color: "#fff",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
};
