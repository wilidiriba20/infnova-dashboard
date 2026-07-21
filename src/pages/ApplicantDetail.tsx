import { useEffect, useState } from "react";
import { api } from "../api";
import type { Applicant, ApplicantStatus } from "../types";
import StatusBadge from "../components/StatusBadge";

interface Props {
  applicantId: string | null;
  onClose: () => void;
  onUnauthorized: () => void;
  onStatusUpdated: (id: string, status: ApplicantStatus) => void;
}

const trackLabels: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  "ui-ux": "UI/UX",
  "data-analytics": "Data Analytics",
  mobile: "Mobile",
};

const expLabels: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const statuses: ApplicantStatus[] = [
  "pending",
  "shortlisted",
  "accepted",
  "rejected",
];

export default function ApplicantDetail({
  applicantId,
  onClose,
  onUnauthorized,
  onStatusUpdated,
}: Props) {
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [status, setStatus] = useState<ApplicantStatus>("pending");
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusSaved, setStatusSaved] = useState(false);
  const [notes, setNotes] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const open = !!applicantId;

  useEffect(() => {
    if (!applicantId) {
      setApplicant(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(false);
    setStatusSaved(false);
    setNotesSaved(false);
    api
      .getApplicant(applicantId)
      .then((res) => {
        if (cancelled) return;
        if (res.status === 401) {
          onUnauthorized();
          return;
        }
        if (res.ok && res.data) {
          setApplicant(res.data);
          setStatus(res.data.status as ApplicantStatus);
          setNotes(res.data.notes ?? "");
        } else {
          setError(true);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [applicantId]);

  async function saveStatus() {
    if (!applicant) return;
    setStatusSaving(true);
    const res = await api.updateStatus(applicant.id, status);
    if (res.status === 401) {
      onUnauthorized();
      return;
    }
    if (res.ok) {
      onStatusUpdated(applicant.id, status);
      setApplicant((a) => (a ? { ...a, status } : a));
      setStatusSaved(true);
      setTimeout(() => setStatusSaved(false), 2000);
    }
    setStatusSaving(false);
  }

  async function saveNotes() {
    if (!applicant) return;
    setNotesSaving(true);
    const res = await api.updateNotes(applicant.id, notes || null);
    if (res.status === 401) {
      onUnauthorized();
      return;
    }
    if (res.ok) {
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    }
    setNotesSaving(false);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(26,26,26,0.25)",
          zIndex: 40,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.25s",
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Panel */}
      <div
        className={`slide-panel ${open ? "open" : ""}`}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(520px, 100vw)",
          background: "#fff",
          borderLeft: "1px solid #e8dfd6",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-8px 0 40px rgba(26,26,26,0.08)",
        }}
      >
        {/* Panel header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #f0e8df",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontFamily: "var(--font-mono)",
              color: "#a89d96",
              letterSpacing: "0.04em",
            }}
          >
            Applicant Detail
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "1px solid #e8dfd6",
              borderRadius: 6,
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#a89d96",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#fef9f4";
              e.currentTarget.style.color = "#1a1a1a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.color = "#a89d96";
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M11 3L3 11M3 3l8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 0 32px" }}>
          {loading && <PanelSkeleton />}
          {error && !loading && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 300,
                gap: 12,
              }}
            >
              <p style={{ color: "#a89d96", fontSize: 14 }}>
                Failed to load applicant.
              </p>
            </div>
          )}
          {!loading && !error && applicant && (
            <div>
              {/* Identity */}
              <div
                style={{
                  padding: "20px 22px",
                  borderBottom: "1px solid #f0e8df",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      background: "#fff3e0",
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#f5820f",
                      flexShrink: 0,
                    }}
                  >
                    {applicant.fullName.charAt(0)}
                  </div>
                  <div>
                    <h2
                      style={{
                        fontSize: 17,
                        fontWeight: 600,
                        color: "#1a1a1a",
                        letterSpacing: "-0.01em",
                        marginBottom: 2,
                      }}
                    >
                      {applicant.fullName}
                    </h2>
                    <p style={{ fontSize: 13, color: "#7a6e66" }}>
                      {applicant.email}
                    </p>
                    <p style={{ fontSize: 12, color: "#a89d96", marginTop: 2 }}>
                      {applicant.phoneNumber}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <StatusBadge status={applicant.status} />
                  <Tag>{trackLabels[applicant.track] ?? applicant.track}</Tag>
                  <Tag>{applicant.country}</Tag>
                  <Tag>
                    {expLabels[applicant.experienceLevel] ??
                      applicant.experienceLevel}
                  </Tag>
                </div>
              </div>

              {/* Details */}
              <div
                style={{
                  padding: "18px 22px",
                  borderBottom: "1px solid #f0e8df",
                }}
              >
                <SectionTitle>Details</SectionTitle>
                <Grid2>
                  <Field label="Applied">
                    {new Date(applicant.applicationDate).toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "short", year: "numeric" },
                    )}
                  </Field>
                  <Field label="Track">
                    {trackLabels[applicant.track] ?? applicant.track}
                  </Field>
                  <Field label="Country">{applicant.country}</Field>
                  <Field label="Experience">
                    {expLabels[applicant.experienceLevel] ??
                      applicant.experienceLevel}
                  </Field>
                </Grid2>
              </div>

              {/* Skills */}
              {applicant.skills.length > 0 && (
                <div
                  style={{
                    padding: "18px 22px",
                    borderBottom: "1px solid #f0e8df",
                  }}
                >
                  <SectionTitle>Skills</SectionTitle>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {applicant.skills.map((s) => (
                      <span
                        key={s}
                        style={{
                          padding: "3px 10px",
                          background: "#fef9f4",
                          border: "1px solid #e8dfd6",
                          borderRadius: 20,
                          fontSize: 12,
                          color: "#5a5148",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              {(applicant.portfolioUrl ||
                applicant.githubUrl ||
                applicant.linkedInUrl) && (
                <div
                  style={{
                    padding: "18px 22px",
                    borderBottom: "1px solid #f0e8df",
                  }}
                >
                  <SectionTitle>Links</SectionTitle>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {applicant.portfolioUrl && (
                      <ExternalLink
                        href={applicant.portfolioUrl}
                        label="Portfolio"
                      />
                    )}
                    {applicant.githubUrl && (
                      <ExternalLink href={applicant.githubUrl} label="GitHub" />
                    )}
                    {applicant.linkedInUrl && (
                      <ExternalLink
                        href={applicant.linkedInUrl}
                        label="LinkedIn"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Motivation */}
              {applicant.motivation && (
                <div
                  style={{
                    padding: "18px 22px",
                    borderBottom: "1px solid #f0e8df",
                  }}
                >
                  <SectionTitle>Motivation</SectionTitle>
                  <p
                    style={{ fontSize: 13, color: "#5a5148", lineHeight: 1.7 }}
                  >
                    {applicant.motivation}
                  </p>
                </div>
              )}

              {/* Status update */}
              <div
                style={{
                  padding: "18px 22px",
                  borderBottom: "1px solid #f0e8df",
                }}
              >
                <SectionTitle>Update Status</SectionTitle>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as ApplicantStatus)
                    }
                    style={{
                      flex: 1,
                      padding: "8px 10px",
                      border: "1px solid #e8dfd6",
                      borderRadius: 6,
                      fontSize: 13,
                      color: "#1a1a1a",
                      background: "#fef9f4",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={saveStatus}
                    disabled={statusSaving || status === applicant.status}
                    style={{
                      padding: "8px 16px",
                      background: statusSaved
                        ? "#22c55e"
                        : status === applicant.status
                          ? "#f5ede3"
                          : "#f5820f",
                      color: statusSaved
                        ? "#fff"
                        : status === applicant.status
                          ? "#c5b8af"
                          : "#fff",
                      border: "none",
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 500,
                      cursor:
                        status === applicant.status ? "not-allowed" : "pointer",
                      transition: "all 0.2s",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {statusSaved ? "✓ Saved" : statusSaving ? "…" : "Save"}
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div style={{ padding: "18px 22px" }}>
                <SectionTitle>Internal Notes</SectionTitle>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this applicant…"
                  maxLength={1000}
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e8dfd6",
                    borderRadius: 6,
                    fontSize: 13,
                    color: "#3d3632",
                    lineHeight: 1.6,
                    resize: "vertical",
                    outline: "none",
                    fontFamily: "inherit",
                    marginBottom: 10,
                    transition: "border-color 0.15s",
                    background: "#fef9f4",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#f5820f")}
                  onBlur={(e) => (e.target.style.borderColor = "#e8dfd6")}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: "#a89d96",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {notes.length}/1000
                  </span>
                  <button
                    onClick={saveNotes}
                    disabled={notesSaving}
                    style={{
                      padding: "7px 16px",
                      background: notesSaved ? "#22c55e" : "#f5820f",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {notesSaved ? "✓ Saved" : notesSaving ? "…" : "Save notes"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 10,
        fontFamily: "var(--font-mono)",
        color: "#a89d96",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        marginBottom: 12,
      }}
    >
      {children}
    </p>
  );
}

function Grid2({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p
        style={{
          fontSize: 11,
          color: "#a89d96",
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.04em",
          marginBottom: 3,
        }}
      >
        {label}
      </p>
      <p style={{ fontSize: 13, color: "#1a1a1a", fontWeight: 500 }}>
        {children}
      </p>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        padding: "2px 8px",
        background: "#fef9f4",
        border: "1px solid #e8dfd6",
        borderRadius: 4,
        fontSize: 12,
        color: "#7a6e66",
        fontFamily: "var(--font-mono)",
      }}
    >
      {children}
    </span>
  );
}

function ExternalLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 13,
        color: "#f5820f",
        textDecoration: "none",
        transition: "opacity 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path
          d="M2 10L10 2M10 2H5M10 2v5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
      <span
        style={{
          color: "#c5b8af",
          fontSize: 12,
          fontFamily: "var(--font-mono)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: 260,
        }}
      >
        {href}
      </span>
    </a>
  );
}

function PanelSkeleton() {
  return (
    <div style={{ padding: "20px 22px" }}>
      <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
        <div
          className="skeleton"
          style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0 }}
        />
        <div style={{ flex: 1 }}>
          <div
            className="skeleton"
            style={{
              width: "60%",
              height: 17,
              borderRadius: 4,
              marginBottom: 8,
            }}
          />
          <div
            className="skeleton"
            style={{ width: "80%", height: 13, borderRadius: 4 }}
          />
        </div>
      </div>
      {[120, 100, 80, 140].map((w, i) => (
        <div
          key={i}
          className="skeleton"
          style={{ width: w, height: 12, borderRadius: 4, marginBottom: 10 }}
        />
      ))}
    </div>
  );
}
