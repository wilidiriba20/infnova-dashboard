import type { ApplicantStatus } from "../types";

const styles: Record<
  ApplicantStatus,
  { bg: string; text: string; border: string; label: string }
> = {
  pending: {
    bg: "#fffbeb",
    text: "#92400e",
    border: "#fde68a",
    label: "Pending",
  },
  shortlisted: {
    bg: "#eff6ff",
    text: "#1e40af",
    border: "#bfdbfe",
    label: "Shortlisted",
  },
  accepted: {
    bg: "#f0fdf4",
    text: "#166534",
    border: "#bbf7d0",
    label: "Accepted",
  },
  rejected: {
    bg: "#fef2f2",
    text: "#991b1b",
    border: "#fecaca",
    label: "Rejected",
  },
};

export default function StatusBadge({ status }: { status: ApplicantStatus }) {
  const s = styles[status] ?? {
    bg: "#f8fafc",
    text: "#475569",
    border: "#e2e8f0",
    label: status,
  };
  return (
    <span
      style={{
        backgroundColor: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: 4,
        fontSize: 11,
        fontFamily: "var(--font-mono)",
        fontWeight: 500,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
}
