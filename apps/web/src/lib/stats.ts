import type { ApplicationStatus } from "./applications";

export interface Stats {
  total: number;
  byStatus: Record<ApplicationStatus, number>;
  submitted: number;
  active: number;
  interviewRate: number;
  offerRate: number;
  weekly: { weekStart: string; count: number }[];
}

export const formatPercent = (rate: number) => `${Math.round(rate * 100)}%`;

/** "2026-11-09" -> "Nov 9" (dates are UTC week starts). */
export const formatWeek = (isoDate: string) =>
  new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
