import { describe, expect, it } from "vitest";
import { analyzerLabel, scoreLabel } from "./match";

describe("scoreLabel", () => {
  it("groups scores into strong, partial and weak", () => {
    expect([scoreLabel(80), scoreLabel(79), scoreLabel(50), scoreLabel(49)]).toEqual([
      "Strong match",
      "Partial match",
      "Partial match",
      "Weak match",
    ]);
  });
});

describe("analyzerLabel", () => {
  it("names the Claude model or the keyword baseline", () => {
    expect(analyzerLabel("claude-opus-5-5")).toBe("AI analysis (claude-opus-5-5)");
    expect(analyzerLabel("keyword-baseline")).toBe("Keyword baseline (no AI key configured)");
  });
});
