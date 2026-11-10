import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { fakeAuthenticator } from "./fake-authenticator.js";
import { KeywordMatchAnalyzer } from "../src/match/keyword-analyzer.js";
import { InMemoryApplicationRepository } from "./in-memory-application-repository.js";
import { InMemoryMatchRepository } from "./in-memory-match-repository.js";

describe("GET /health", () => {
  it("returns ok", async () => {
    const repository = new InMemoryApplicationRepository();
    const app = await buildApp({
      repository,
      matches: new InMemoryMatchRepository(repository),
      analyzer: new KeywordMatchAnalyzer(),
      authenticator: fakeAuthenticator,
    });

    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
  });
});
