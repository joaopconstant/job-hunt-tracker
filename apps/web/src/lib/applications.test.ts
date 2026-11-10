import { describe, expect, it } from "vitest";
import { groupByStatus, isApplicationStatus, type Application } from "./applications";

const application = (overrides: Partial<Application>): Application => ({
  id: "1",
  company: "Acme",
  role: "Developer",
  url: null,
  location: null,
  status: "WISHLIST",
  notes: null,
  appliedAt: null,
  createdAt: "2026-11-01T00:00:00.000Z",
  updatedAt: "2026-11-01T00:00:00.000Z",
  ...overrides,
});

describe("groupByStatus", () => {
  it("returns every column, even the empty ones", () => {
    expect(Object.keys(groupByStatus([]))).toEqual(["WISHLIST", "APPLIED", "INTERVIEW", "OFFER", "REJECTED"]);
  });

  it("puts each application in its status column", () => {
    const columns = groupByStatus([
      application({ id: "1", status: "APPLIED" }),
      application({ id: "2", status: "OFFER" }),
      application({ id: "3", status: "APPLIED" }),
    ]);

    expect(columns.APPLIED.map((a) => a.id)).toEqual(["1", "3"]);
    expect(columns.OFFER.map((a) => a.id)).toEqual(["2"]);
    expect(columns.WISHLIST).toEqual([]);
  });
});

describe("isApplicationStatus", () => {
  it.each([
    ["APPLIED", true],
    ["applied", false],
    ["", false],
    [null, false],
  ])("%s -> %s", (value, expected) => {
    expect(isApplicationStatus(value)).toBe(expected);
  });
});
