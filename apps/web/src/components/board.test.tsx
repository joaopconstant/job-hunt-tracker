import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Application } from "@/lib/applications";
import { Board } from "./board";

vi.mock("@/app/actions", () => ({
  moveApplication: vi.fn(),
  deleteApplication: vi.fn(),
}));

const applications: Application[] = [
  {
    id: "1",
    company: "Acme",
    role: "Full Stack Developer",
    url: "https://acme.example/jobs/1",
    location: "Remote",
    status: "INTERVIEW",
    notes: null,
    appliedAt: null,
    createdAt: "2026-11-01T00:00:00.000Z",
    updatedAt: "2026-11-01T00:00:00.000Z",
  },
];

describe("Board", () => {
  it("shows the application in its status column with a count", () => {
    render(<Board applications={applications} />);

    const interview = screen.getByRole("region", { name: /interview/i });
    expect(within(interview).getByRole("heading", { name: /interview \(1\)/i })).toBeInTheDocument();
    expect(within(interview).getByRole("article", { name: "Full Stack Developer at Acme" })).toBeInTheDocument();

    const wishlist = screen.getByRole("region", { name: /wishlist/i });
    expect(within(wishlist).queryByRole("article")).not.toBeInTheDocument();
  });

  it("links to the job posting and preselects the current status", () => {
    render(<Board applications={applications} />);

    expect(screen.getByRole("link", { name: "Job posting" })).toHaveAttribute("href", "https://acme.example/jobs/1");
    expect(screen.getByRole("combobox", { name: "Status" })).toHaveValue("INTERVIEW");
  });
});
