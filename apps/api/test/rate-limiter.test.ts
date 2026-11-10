import { describe, expect, it } from "vitest";
import { FixedWindowLimiter } from "../src/match/rate-limiter.js";

describe("FixedWindowLimiter", () => {
  it("allows the limit per key and resets after the window", () => {
    let now = 0;
    const limiter = new FixedWindowLimiter(2, 1000, () => now);

    expect([limiter.tryHit("a"), limiter.tryHit("a"), limiter.tryHit("a")]).toEqual([true, true, false]);
    expect(limiter.tryHit("b")).toBe(true);

    now = 1000;
    expect(limiter.tryHit("a")).toBe(true);
  });
});
