import type {
  User,
  Applicant,
  ApplicantSummary,
  PaginatedApplicants,
  DashboardSummary,
  ReferenceItem,
} from "./types";

const BASE = "https://infnova-intern.vercel.app/api";
const TOKEN_KEY = "infnova_token";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

interface ApiResponse<T> {
  data: T | null;
  status: number;
  ok: boolean;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string> | undefined),
    },
  });
  let data: T | null = null;
  if (res.status !== 204) {
    try {
      data = (await res.json()) as T;
    } catch {
      data = null;
    }
  }
  return { data, status: res.status, ok: res.ok };
}

export const api = {
  login(email: string, password: string) {
    return request<{
      accessToken: string;
      tokenType: string;
      expiresIn: number;
      user: User;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  logout() {
    return request<void>("/auth/logout", { method: "POST" });
  },

  getMe() {
    return request<User>("/auth/me");
  },

  getApplicants(params: Record<string, string | number | boolean | undefined>) {
    const qs = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(
        ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
      )
      .join("&");
    return request<PaginatedApplicants>(`/applicants${qs ? `?${qs}` : ""}`);
  },

  getApplicant(id: string) {
    return request<Applicant>(`/applicants/${id}`);
  },

  updateStatus(id: string, status: string) {
    return request<ApplicantSummary>(`/applicants/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  updateNotes(id: string, notes: string | null) {
    return request<{ id: string; notes: string | null; updatedAt: string }>(
      `/applicants/${id}/notes`,
      { method: "PATCH", body: JSON.stringify({ notes }) },
    );
  },

  getDashboardSummary() {
    return request<DashboardSummary>("/dashboard/summary");
  },

  getTracks() {
    return request<{ data: ReferenceItem[] }>("/tracks");
  },

  getStatuses() {
    return request<{ data: ReferenceItem[] }>("/application-statuses");
  },

  getCountries() {
    return request<{ data: ReferenceItem[] }>("/countries");
  },

  getExperienceLevels() {
    return request<{ data: ReferenceItem[] }>("/experience-levels");
  },

  resetSession() {
    return request<void>("/session/reset", { method: "POST" });
  },
};
