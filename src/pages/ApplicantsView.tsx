import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api";
import type {
  ApplicantStatus,
  ApplicantSummary,
  PaginationMeta,
  ReferenceItem,
} from "../types";
import StatusBadge from "./StatusBadge";
import ApplicantDetail from "./ApplicantDetail";

interface Props {
  onUnauthorized: () => void;
}

interface Filters {
  search: string;
  status: string;
  track: string;
  country: string;
  experienceLevel: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  page: number;
}

const LIMIT = 10;

const trackLabels: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  "ui-ux": "UI/UX",
  "data-analytics": "Data Analytics",
  mobile: "Mobile",
};

export default function ApplicantsView({ onUnauthorized }: Props) {
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "",
    track: "",
    country: "",
    experienceLevel: "",
    sortBy: "",
    sortOrder: "asc",
    page: 1,
  });
  const [applicants, setApplicants] = useState<ApplicantSummary[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: LIMIT,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [tracks, setTracks] = useState<ReferenceItem[]>([]);
  const [statuses, setStatuses] = useState<ReferenceItem[]>([]);
  const [countries, setCountries] = useState<ReferenceItem[]>([]);
  const [expLevels, setExpLevels] = useState<ReferenceItem[]>([]);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    Promise.all([
      api.getTracks(),
      api.getStatuses(),
      api.getCountries(),
      api.getExperienceLevels(),
    ])
      .then(([t, s, c, e]) => {
        if (t.ok && t.data) setTracks(t.data.data);
        if (s.ok && s.data) setStatuses(s.data.data);
        if (c.ok && c.data) setCountries(c.data.data);
        if (e.ok && e.data) setExpLevels(e.data.data);
      })
      .catch(() => {});
  }, []);

  const fetchApplicants = useCallback(
    async (f: Filters, search: string) => {
      setLoading(true);
      setError(false);
      try {
        const res = await api.getApplicants({
          page: f.page,
          limit: LIMIT,
          search: search || undefined,
          status: f.status || undefined,
          track: f.track || undefined,
          country: f.country || undefined,
          experienceLevel: f.experienceLevel || undefined,
          sortBy: f.sortBy || undefined,
          sortOrder: f.sortBy ? f.sortOrder : undefined,
        });
        if (res.status === 401) {
          onUnauthorized();
          return;
        }
        if (res.ok && res.data) {
          setApplicants(res.data.data);
          setMeta(res.data.meta);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    [onUnauthorized],
  );

  useEffect(() => {
    fetchApplicants(filters, debouncedSearch);
  }, [filters, debouncedSearch, fetchApplicants]);

  function handleSearch(value: string) {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(value);
      setFilters((f) => ({ ...f, search: value, page: 1 }));
    }, 350);
  }

  // ✅ Fixed: preserve the new page value when key === "page"
  function setFilter(key: keyof Filters, value: string | number) {
    setFilters((f) => ({
      ...f,
      [key]: value,
      page: key === "page" ? (value as number) : 1,
    }));
  }

  function handleClearFilters() {
    setFilters((f) => ({
      ...f,
      status: "",
      track: "",
      country: "",
      experienceLevel: "",
      page: 1,
    }));
  }

  function toggleSort(col: string) {
    setFilters((f) => ({
      ...f,
      page: 1,
      sortBy: col,
      sortOrder: f.sortBy === col && f.sortOrder === "asc" ? "desc" : "asc",
    }));
  }

  function handleStatusUpdated(id: string, status: ApplicantStatus) {
    setApplicants((list) =>
      list.map((a) => (a.id === id ? { ...a, status } : a)),
    );
  }

  const sortArrow = (col: string) => {
    if (filters.sortBy !== col) return <SortIcon />;
    return filters.sortOrder === "asc" ? <SortAscIcon /> : <SortDescIcon />;
  };

  const hasFilters =
    filters.status ||
    filters.track ||
    filters.country ||
    filters.experienceLevel;

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 22,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#1a1a1a",
              letterSpacing: "-0.02em",
              marginBottom: 4,
            }}
          >
            Applicants
          </h1>
          <p style={{ fontSize: 13, color: "#a89d96" }}>
            {meta.total > 0
              ? `${meta.total} applicant${meta.total !== 1 ? "s" : ""}`
              : "No applicants found"}
          </p>
        </div>
      </div>

      {/* Filters row */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e8dfd6",
          borderRadius: 10,
          padding: "14px 16px",
          marginBottom: 16,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 220px", minWidth: 180 }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#a89d96",
            }}
          >
            <circle
              cx="6"
              cy="6"
              r="4.5"
              stroke="currentColor"
              strokeWidth="1.3"
            />
            <path
              d="M10 10l2.5 2.5"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="text"
            placeholder="Search name or email…"
            defaultValue={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              width: "100%",
              paddingLeft: 32,
              paddingRight: 12,
              paddingTop: 7,
              paddingBottom: 7,
              border: "1px solid #e8dfd6",
              borderRadius: 6,
              fontSize: 13,
              color: "#1a1a1a",
              background: "#fef9f4",
              outline: "none",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#f5820f")}
            onBlur={(e) => (e.target.style.borderColor = "#e8dfd6")}
          />
        </div>

        <FilterSelect
          value={filters.status}
          onChange={(v) => setFilter("status", v)}
          options={statuses}
          placeholder="Status"
        />
        <FilterSelect
          value={filters.track}
          onChange={(v) => setFilter("track", v)}
          options={tracks}
          placeholder="Track"
        />
        <FilterSelect
          value={filters.country}
          onChange={(v) => setFilter("country", v)}
          options={countries}
          placeholder="Country"
        />
        <FilterSelect
          value={filters.experienceLevel}
          onChange={(v) => setFilter("experienceLevel", v)}
          options={expLevels}
          placeholder="Experience"
        />

        {hasFilters && (
          <button
            onClick={handleClearFilters}
            style={{
              padding: "7px 12px",
              background: "none",
              border: "1px solid #e8dfd6",
              borderRadius: 6,
              fontSize: 12,
              color: "#a89d96",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#ef4444";
              e.currentTarget.style.color = "#ef4444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e8dfd6";
              e.currentTarget.style.color = "#a89d96";
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e8dfd6",
          borderRadius: 10,
          overflow: "hidden",
          marginBottom: 16,
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid #f0e8df",
                  background: "#fef9f4",
                }}
              >
                <Th sortable onClick={() => toggleSort("fullName")}>
                  Name {sortArrow("fullName")}
                </Th>
                <Th sortable onClick={() => toggleSort("track")}>
                  Track {sortArrow("track")}
                </Th>
                <Th sortable onClick={() => toggleSort("status")}>
                  Status {sortArrow("status")}
                </Th>
                <Th>Country</Th>
                <Th sortable onClick={() => toggleSort("applicationDate")}>
                  Applied {sortArrow("applicationDate")}
                </Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: LIMIT }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))
              ) : error ? (
                <tr>
                  <td colSpan={6}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        padding: "48px 0",
                        gap: 12,
                      }}
                    >
                      <div style={{ fontSize: 28, color: "#e8dfd6" }}>⚠</div>
                      <p style={{ fontSize: 14, color: "#a89d96" }}>
                        Failed to load applicants.
                      </p>
                      <button
                        onClick={() =>
                          fetchApplicants(filters, debouncedSearch)
                        }
                        style={retryBtnStyle}
                      >
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : applicants.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        padding: "56px 0",
                        gap: 10,
                      }}
                    >
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 40 40"
                        fill="none"
                        style={{ color: "#e8dfd6" }}
                      >
                        <circle
                          cx="20"
                          cy="16"
                          r="8"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M6 36c0-7.732 6.268-14 14-14s14 6.268 14 14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                      <p
                        style={{
                          fontSize: 14,
                          color: "#a89d96",
                          fontWeight: 500,
                        }}
                      >
                        No applicants found
                      </p>
                      <p style={{ fontSize: 12, color: "#c5b8af" }}>
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                applicants.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => setSelectedId(a.id)}
                    style={{
                      borderBottom: "1px solid #fdf5ec",
                      cursor: "pointer",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#fef9f4")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td style={tdStyle}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            background: "#fff3e0",
                            borderRadius: 8,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#f5820f",
                            flexShrink: 0,
                          }}
                        >
                          {a.fullName.charAt(0)}
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: "#1a1a1a",
                            }}
                          >
                            {a.fullName}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#a89d96",
                              fontFamily: "var(--font-mono)",
                            }}
                          >
                            {a.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          fontSize: 12,
                          color: "#5a5148",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {trackLabels[a.track] ?? a.track}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <StatusBadge status={a.status} />
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: 13, color: "#7a6e66" }}>
                        {a.country}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          fontSize: 12,
                          color: "#a89d96",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {new Date(a.applicationDate).toLocaleDateString(
                          "en-GB",
                          { day: "numeric", month: "short", year: "numeric" },
                        )}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        style={{ color: "#e8dfd6" }}
                      >
                        <path
                          d="M5.5 3L9.5 7l-4 4"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && !error && meta.totalPages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <p
            style={{
              fontSize: 13,
              color: "#a89d96",
              fontFamily: "var(--font-mono)",
            }}
          >
            Page {meta.page} of {meta.totalPages} · {meta.total} total
          </p>
          <div style={{ display: "flex", gap: 4 }}>
            <PageBtn
              disabled={meta.page <= 1}
              onClick={() => setFilter("page", meta.page - 1)}
            >
              ← Prev
            </PageBtn>
            {getPageNumbers(meta.page, meta.totalPages).map((p, i) =>
              p === "…" ? (
                <span
                  key={`ellipsis-${i}`}
                  style={{ padding: "6px 8px", fontSize: 13, color: "#a89d96" }}
                >
                  …
                </span>
              ) : (
                <PageBtn
                  key={p}
                  active={p === meta.page}
                  onClick={() => setFilter("page", p as number)}
                >
                  {p}
                </PageBtn>
              ),
            )}
            <PageBtn
              disabled={meta.page >= meta.totalPages}
              onClick={() => setFilter("page", meta.page + 1)}
            >
              Next →
            </PageBtn>
          </div>
        </div>
      )}

      {/* Detail panel */}
      <ApplicantDetail
        applicantId={selectedId}
        onClose={() => setSelectedId(null)}
        onUnauthorized={onUnauthorized}
        onStatusUpdated={handleStatusUpdated}
      />
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: ReferenceItem[];
  placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: "7px 10px",
        border: "1px solid #e8dfd6",
        borderRadius: 6,
        fontSize: 13,
        color: value ? "#1a1a1a" : "#a89d96",
        background: "#fef9f4",
        outline: "none",
        cursor: "pointer",
        minWidth: 120,
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Th({
  children,
  sortable,
  onClick,
}: {
  children?: React.ReactNode;
  sortable?: boolean;
  onClick?: () => void;
}) {
  return (
    <th
      onClick={sortable ? onClick : undefined}
      style={{
        padding: "10px 16px",
        textAlign: "left",
        fontSize: 11,
        fontFamily: "var(--font-mono)",
        fontWeight: 500,
        color: "#a89d96",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        userSelect: "none",
        cursor: sortable ? "pointer" : "default",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        {children}
      </span>
    </th>
  );
}

const tdStyle: React.CSSProperties = {
  padding: "12px 16px",
  verticalAlign: "middle",
};

function SkeletonRow() {
  return (
    <tr style={{ borderBottom: "1px solid #fdf5ec" }}>
      <td style={tdStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            className="skeleton"
            style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0 }}
          />
          <div>
            <div
              className="skeleton"
              style={{
                width: 120,
                height: 13,
                borderRadius: 4,
                marginBottom: 5,
              }}
            />
            <div
              className="skeleton"
              style={{ width: 160, height: 11, borderRadius: 4 }}
            />
          </div>
        </div>
      </td>
      {[80, 70, 80, 90].map((w, i) => (
        <td key={i} style={tdStyle}>
          <div
            className="skeleton"
            style={{ width: w, height: 13, borderRadius: 4 }}
          />
        </td>
      ))}
      <td style={tdStyle} />
    </tr>
  );
}

function PageBtn({
  children,
  onClick,
  disabled,
  active,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "6px 10px",
        border: "1px solid",
        borderColor: active ? "#f5820f" : "#e8dfd6",
        borderRadius: 6,
        fontSize: 13,
        background: active ? "#f5820f" : "#fff",
        color: active ? "#fff" : disabled ? "#e8dfd6" : "#5a5148",
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "var(--font-mono)",
        transition: "all 0.15s",
        minWidth: 34,
      }}
    >
      {children}
    </button>
  );
}

function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  if (current > 3) pages.push("…");
  for (
    let i = Math.max(2, current - 1);
    i <= Math.min(total - 1, current + 1);
    i++
  )
    pages.push(i);
  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}

function SortIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      style={{ opacity: 0.35 }}
    >
      <path
        d="M3 4l2-2 2 2M3 6l2 2 2-2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SortAscIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      style={{ color: "#f5820f" }}
    >
      <path
        d="M3 6l2-3 2 3"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SortDescIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      style={{ color: "#f5820f" }}
    >
      <path
        d="M3 4l2 3 2-3"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const retryBtnStyle: React.CSSProperties = {
  padding: "7px 18px",
  background: "#f5820f",
  border: "none",
  borderRadius: 6,
  color: "#fff",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
};
