import { describe, expect, it } from "vitest";
import type { UpdateApplicationInput } from "../src/schemas.js";
import { computeStats, startOfWeekUTC, withAppliedAt } from "../src/stats.js";

const NOW = new Date("2026-11-11T15:00:00Z"); // a Wednesday

describe("startOfWeekUTC", () => {
  it.each([
    ["2026-11-11T15:00:00Z", "2026-11-09"], // Wednesday -> Monday
    ["2026-11-09T00:00:00Z", "2026-11-09"], // Monday stays
    ["2026-11-15T23:59:59Z", "2026-11-09"], // Sunday belongs to the week before
  ])("%s starts on %s", (date, expected) => {
    expect(startOfWeekUTC(new Date(date)).toISOString().slice(0, 10)).toBe(expected);
  });
});

describe("computeStats", () => {
  it("returns zeros for no applications", () => {
    const stats = computeStats([], NOW);

    expect(stats).toMatchObject({ total: 0, submitted: 0, active: 0, interviewRate: 0, offerRate: 0 });
    expect(stats.byStatus).toEqual({ WISHLIST: 0, APPLIED: 0, INTERVIEW: 0, OFFER: 0, REJECTED: 0 });
    expect(stats.weekly).toHaveLength(8);
    expect(stats.weekly.every((week) => week.count === 0)).toBe(true);
  });

  it("counts statuses and rates over submitted applications only", () => {
    const stats = computeStats(
      [
        { status: "WISHLIST", appliedAt: null },
        { status: "APPLIED", appliedAt: null },
        { status: "APPLIED", appliedAt: null },
        { status: "INTERVIEW", appliedAt: null },
        { status: "OFFER", appliedAt: null },
        { status: "REJECTED", appliedAt: null },
      ],
      NOW,
    );

    expect(stats.total).toBe(6);
    expect(stats.submitted).toBe(5);
    expect(stats.active).toBe(3);
    expect(stats.interviewRate).toBeCloseTo(2 / 5);
    expect(stats.offerRate).toBeCloseTo(1 / 5);
  });

  it("buckets applications by the week they were sent, oldest week first", () => {
    const stats = computeStats(
      [
        { status: "APPLIED", appliedAt: new Date("2026-11-10T10:00:00Z") }, // this week
        { status: "APPLIED", appliedAt: new Date("2026-11-09T00:00:00Z") }, // this week
        { status: "REJECTED", appliedAt: new Date("2026-11-08T23:00:00Z") }, // last week
        { status: "APPLIED", appliedAt: new Date("2026-01-01T00:00:00Z") }, // too old, ignored
      ],
      NOW,
      4,
    );

    expect(stats.weekly).toEqual([
      { weekStart: "2026-10-19", count: 0 },
      { weekStart: "2026-10-26", count: 0 },
      { weekStart: "2026-11-02", count: 1 },
      { weekStart: "2026-11-09", count: 2 },
    ]);
  });
});

describe("withAppliedAt", () => {
  it("sets the date when an application is sent without one", () => {
    expect(withAppliedAt({ status: "APPLIED" as const }, null, NOW)).toEqual({ status: "APPLIED", appliedAt: NOW });
  });

  it("keeps an explicit or existing date", () => {
    const explicit = new Date("2026-11-01T00:00:00Z");

    expect(withAppliedAt({ status: "APPLIED" as const, appliedAt: explicit }, null, NOW).appliedAt).toBe(explicit);
    expect(withAppliedAt({ status: "INTERVIEW" as const }, { appliedAt: explicit }, NOW)).toEqual({
      status: "INTERVIEW",
    });
  });

  it("leaves wishlist items and edits without a status alone", () => {
    expect(withAppliedAt({ status: "WISHLIST" as const }, null, NOW)).toEqual({ status: "WISHLIST" });
    const edit: UpdateApplicationInput = { notes: "Call back" };
    expect(withAppliedAt(edit, null, NOW)).toEqual({ notes: "Call back" });
  });
});
