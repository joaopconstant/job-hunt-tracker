import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Stats } from "@/lib/stats";
import { Dashboard } from "./dashboard";

// Recharts needs real layout; the charts are covered by the e2e test.
vi.mock("@/components/charts", () => ({ WeeklyChart: () => null, StatusChart: () => null }));

const stats: Stats = {
  total: 6,
  byStatus: { WISHLIST: 1, APPLIED: 2, INTERVIEW: 1, OFFER: 1, REJECTED: 1 },
  submitted: 5,
  active: 3,
  interviewRate: 0.4,
  offerRate: 0.2,
  weekly: [
    { weekStart: "2026-11-02", count: 1 },
    { weekStart: "2026-11-09", count: 4 },
  ],
};

describe("Dashboard", () => {
  it("shows the headline numbers", () => {
    render(<Dashboard stats={stats} />);

    expect(within(screen.getByRole("group", { name: "Applications sent" })).getByText("5")).toBeInTheDocument();
    expect(within(screen.getByRole("group", { name: "Waiting on an answer" })).getByText("3")).toBeInTheDocument();
    expect(within(screen.getByRole("group", { name: "Interview rate" })).getByText("40%")).toBeInTheDocument();
    expect(within(screen.getByRole("group", { name: "Offer rate" })).getByText("20%")).toBeInTheDocument();
  });

  it("offers the chart data as tables", () => {
    render(<Dashboard stats={stats} />);

    const weekly = screen.getByRole("table", { name: "Applications sent per week" });
    expect(within(weekly).getByRole("row", { name: "Nov 9 4" })).toBeInTheDocument();
    const byStatus = screen.getByRole("table", { name: "Applications by status" });
    expect(within(byStatus).getByRole("row", { name: "Applied 2" })).toBeInTheDocument();
  });
});
