import { beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { MatchUnavailableError, type MatchAnalyzer } from "../src/match/analyzer.js";
import { FixedWindowLimiter } from "../src/match/rate-limiter.js";
import type { MatchResult } from "../src/match/schemas.js";
import { fakeAuthenticator } from "./fake-authenticator.js";
import { InMemoryApplicationRepository } from "./in-memory-application-repository.js";
import { InMemoryMatchRepository } from "./in-memory-match-repository.js";

const RESUME = "Full stack developer with 4 years of TypeScript, React, Node.js and PostgreSQL experience.";
const JOB = "We are hiring a full stack developer. Requirements: TypeScript, React, Node.js and Docker.";
const RESULT: MatchResult = {
  score: 82,
  summary: "Strong match.",
  strengths: ["TypeScript"],
  gaps: ["Docker"],
  suggestions: ["Mention containers."],
};

class StubAnalyzer implements MatchAnalyzer {
  readonly name = "stub";
  calls: Parameters<MatchAnalyzer["analyze"]>[0][] = [];
  failWith: Error | null = null;

  async analyze(input: Parameters<MatchAnalyzer["analyze"]>[0]) {
    this.calls.push(input);
    if (this.failWith) throw this.failWith;
    return RESULT;
  }
}

let applications: InMemoryApplicationRepository;
let matches: InMemoryMatchRepository;
let analyzer: StubAnalyzer;
let app: Awaited<ReturnType<typeof buildApp>>;

beforeEach(async () => {
  applications = new InMemoryApplicationRepository();
  matches = new InMemoryMatchRepository(applications);
  analyzer = new StubAnalyzer();
  app = await buildApp({
    repository: applications,
    matches,
    analyzer,
    matchLimiter: new FixedWindowLimiter(2, 60_000),
    authenticator: fakeAuthenticator,
  });
});

const as = (userId: string) => ({ "x-test-user": userId });

const saveResume = (content = RESUME, userId = "alice") =>
  app.inject({ method: "PUT", url: "/resume", payload: { content }, headers: as(userId) });

const runMatch = (id: string, jobDescription = JOB, userId = "alice") =>
  app.inject({ method: "POST", url: `/applications/${id}/match`, payload: { jobDescription }, headers: as(userId) });

async function createApplication(userId = "alice") {
  const application = await applications.create(userId, { company: "Acme", role: "Full Stack Developer" });
  return application.id;
}

describe("résumé", () => {
  it("rejects requests without a signed-in user", async () => {
    const response = await app.inject({ method: "GET", url: "/resume" });

    expect(response.statusCode).toBe(401);
  });

  it("returns 404 until a résumé is saved, then returns it", async () => {
    expect((await app.inject({ method: "GET", url: "/resume", headers: as("alice") })).statusCode).toBe(404);

    expect((await saveResume()).statusCode).toBe(200);

    const response = await app.inject({ method: "GET", url: "/resume", headers: as("alice") });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ content: RESUME });
  });

  it("rejects a résumé that is too short", async () => {
    const response = await saveResume("too short");

    expect(response.statusCode).toBe(400);
  });

  it("keeps each user's résumé private", async () => {
    await saveResume();

    const response = await app.inject({ method: "GET", url: "/resume", headers: as("bob") });

    expect(response.statusCode).toBe(404);
  });
});

describe("match analysis", () => {
  it("analyzes the posting against the saved résumé and stores the result", async () => {
    const id = await createApplication();
    await saveResume();

    const response = await runMatch(id);

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({ ...RESULT, jobDescription: JOB, analyzer: "stub" });
    expect(analyzer.calls).toEqual([
      { resume: RESUME, jobDescription: JOB, company: "Acme", role: "Full Stack Developer" },
    ]);

    const stored = await app.inject({ method: "GET", url: `/applications/${id}/match`, headers: as("alice") });
    expect(stored.statusCode).toBe(200);
    expect(stored.json()).toMatchObject({ score: 82 });
  });

  it("asks for a résumé before analyzing", async () => {
    const id = await createApplication();

    const response = await runMatch(id);

    expect(response.statusCode).toBe(409);
    expect(analyzer.calls).toHaveLength(0);
  });

  it("rejects a job description that is too short", async () => {
    const id = await createApplication();
    await saveResume();

    const response = await runMatch(id, "short");

    expect(response.statusCode).toBe(400);
  });

  it("does not analyze or show another user's application", async () => {
    const id = await createApplication("alice");
    await runMatch(id);
    await saveResume(RESUME, "bob");

    expect((await runMatch(id, JOB, "bob")).statusCode).toBe(404);
    const read = await app.inject({ method: "GET", url: `/applications/${id}/match`, headers: as("bob") });
    expect(read.statusCode).toBe(404);
  });

  it("answers 502 when the analyzer is unavailable", async () => {
    const id = await createApplication();
    await saveResume();
    analyzer.failWith = new MatchUnavailableError("down");

    const response = await runMatch(id);

    expect(response.statusCode).toBe(502);
    expect(matches.matches.size).toBe(0);
  });

  it("limits how many analyses a user can run", async () => {
    const id = await createApplication();
    await saveResume();

    expect((await runMatch(id)).statusCode).toBe(201);
    expect((await runMatch(id)).statusCode).toBe(201);
    expect((await runMatch(id)).statusCode).toBe(429);
    expect(analyzer.calls).toHaveLength(2);
  });
});
