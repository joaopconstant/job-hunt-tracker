import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { fakeAuthenticator } from "./fake-authenticator.js";
import { InMemoryApplicationRepository } from "./in-memory-application-repository.js";

describe("GET /health", () => {
  it("returns ok", async () => {
    const app = await buildApp({
      repository: new InMemoryApplicationRepository(),
      authenticator: fakeAuthenticator,
    });

    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
  });
});
