export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export type ApplicantStatus =
  | "pending"
  | "shortlisted"
  | "accepted"
  | "rejected";
export type ApplicantTrack =
  | "frontend"
  | "backend"
  | "ui-ux"
  | "data-analytics"
  | "mobile";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export interface ApplicantSummary {
  id: string;
  fullName: string;
  email: string;
  country: string;
  track: ApplicantTrack;
  status: ApplicantStatus;
  applicationDate: string;
}

export interface Applicant extends ApplicantSummary {
  phoneNumber: string;
  skills: string[];
  experienceLevel: ExperienceLevel;
  portfolioUrl: string | null;
  githubUrl: string | null;
  linkedInUrl: string | null;
  motivation: string | null;
  notes: string | null;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedApplicants {
  data: ApplicantSummary[];
  meta: PaginationMeta;
}

export interface DashboardSummary {
  totalApplicants: number;
  byStatus: Record<string, number>;
  byTrack: Record<string, number>;
}

export interface ReferenceItem {
  value: string;
  label: string;
}

export type View = "dashboard" | "applicants";

export type ApiError = "session-expired" | "error";
