import { z } from "zod";
import { applicationStatus, type Application, type ApplicationStatus } from "./schemas.js";

export const statsSchema = z.object({
  total: z.number().int(),
  byStatus: z.record(applicationStatus, z.number().int()),
  /** Applications that left the wishlist, i.e. were actually sent. */
  submitted: z.number().int(),
  /** Waiting on an answer: applied or interviewing. */
  active: z.number().int(),
  /** Share of submitted applications currently at interview or offer stage (0 to 1). */
  interviewRate: z.number(),
  /** Share of submitted applications with an offer (0 to 1). */
  offerRate: z.number(),
  /** Applications sent per week, oldest first. Weeks start on Monday (UTC). */
  weekly: z.array(z.object({ weekStart: z.string(), count: z.number().int() })),
});

export type Stats = z.infer<typeof statsSchema>;

const DAY = 24 * 60 * 60 * 1000;

export function startOfWeekUTC(date: Date) {
  const day = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const daysSinceMonday = (day.getUTCDay() + 6) % 7;
  return new Date(day.getTime() - daysSinceMonday * DAY);
}

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

export function computeStats(
  applications: Pick<Application, "status" | "appliedAt">[],
  now: Date,
  weeks = 8,
): Stats {
  const byStatus = Object.fromEntries(applicationStatus.options.map((status) => [status, 0])) as Record<
    ApplicationStatus,
    number
  >;
  for (const { status } of applications) byStatus[status]++;

  const submitted = applications.length - byStatus.WISHLIST;
  const rate = (count: number) => (submitted === 0 ? 0 : count / submitted);

  const currentWeek = startOfWeekUTC(now).getTime();
  const weekly = Array.from({ length: weeks }, (_, i) => ({
    weekStart: isoDate(new Date(currentWeek - (weeks - 1 - i) * 7 * DAY)),
    count: 0,
  }));
  for (const { appliedAt } of applications) {
    if (!appliedAt) continue;
    const index = weeks - 1 - (currentWeek - startOfWeekUTC(appliedAt).getTime()) / (7 * DAY);
    if (index >= 0 && index < weeks) weekly[index].count++;
  }

  return {
    total: applications.length,
    byStatus,
    submitted,
    active: byStatus.APPLIED + byStatus.INTERVIEW,
    interviewRate: rate(byStatus.INTERVIEW + byStatus.OFFER),
    offerRate: rate(byStatus.OFFER),
    weekly,
  };
}

/**
 * Fills appliedAt with `now` when an application leaves the wishlist without a date,
 * so the weekly chart works without asking the user for it.
 */
export function withAppliedAt<T extends { status?: ApplicationStatus; appliedAt?: Date | null }>(
  input: T,
  current: { appliedAt: Date | null } | null,
  now: Date,
): T {
  const sent = input.status !== undefined && input.status !== "WISHLIST";
  if (!sent || input.appliedAt || current?.appliedAt) return input;
  return { ...input, appliedAt: now };
}
