import { describe, expect, it } from "vitest";
import { formatPercent, formatWeek } from "./stats";

describe("formatPercent", () => {
  it.each([
    [0, "0%"],
    [0.4, "40%"],
    [1 / 3, "33%"],
    [1, "100%"],
  ])("%s -> %s", (rate, expected) => {
    expect(formatPercent(rate)).toBe(expected);
  });
});

describe("formatWeek", () => {
  it("formats a UTC week start without shifting the day", () => {
    expect(formatWeek("2026-11-09")).toBe("Nov 9");
  });
});
