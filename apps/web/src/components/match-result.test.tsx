import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { MatchAnalysis } from "@/lib/match";
import { MatchResult } from "./match-result";

const analysis: MatchAnalysis = {
  score: 72,
  summary: "A good fit with a few gaps.",
  strengths: ["Four years of TypeScript"],
  gaps: ["No Docker experience shown", "No AWS experience shown"],
  suggestions: [],
  jobDescription: "Job",
  analyzer: "claude-opus-5-5",
  createdAt: "2026-11-10T12:00:00.000Z",
};

describe("MatchResult", () => {
  it("shows the score, summary and each list", () => {
    render(<MatchResult analysis={analysis} />);

    const region = screen.getByRole("region", { name: "Match analysis" });
    expect(within(region).getByText("72")).toBeInTheDocument();
    expect(within(region).getByText("Partial match")).toBeInTheDocument();
    expect(within(region).getByText("A good fit with a few gaps.")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "Gaps" })).getAllByRole("listitem")).toHaveLength(2);
    expect(within(screen.getByRole("region", { name: "Suggestions" })).getByText("No suggestions.")).toBeInTheDocument();
    expect(screen.getByText(/AI analysis \(claude-opus-5-5\)/)).toBeInTheDocument();
  });
});
