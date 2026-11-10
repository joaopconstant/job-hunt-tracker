import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createPrismaClient } from "../src/db.js";
import { PrismaApplicationRepository } from "../src/repositories/prisma-application-repository.js";
import { PrismaMatchRepository } from "../src/repositories/prisma-match-repository.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for integration tests");

const prisma = createPrismaClient(databaseUrl);
const applications = new PrismaApplicationRepository(prisma);
const matches = new PrismaMatchRepository(prisma);

const analysis = (score: number) => ({
  score,
  summary: "Summary",
  strengths: ["TypeScript"],
  gaps: ["Docker", "AWS"],
  suggestions: [],
  jobDescription: "Job posting",
  analyzer: "test",
});

beforeEach(async () => {
  await prisma.application.deleteMany();
  await prisma.user.deleteMany();
  await prisma.user.createMany({
    data: [
      { id: "alice", name: "Alice", email: "alice@example.com" },
      { id: "bob", name: "Bob", email: "bob@example.com" },
    ],
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("PrismaMatchRepository", () => {
  it("saves and replaces a user's résumé", async () => {
    expect(await matches.getResume("alice")).toBeNull();

    await matches.saveResume("alice", "First version");
    await matches.saveResume("alice", "Second version");

    expect(await matches.getResume("alice")).toMatchObject({ content: "Second version" });
    expect(await matches.getResume("bob")).toBeNull();
  });

  it("keeps one analysis per application, scoped to its owner", async () => {
    const { id } = await applications.create("alice", { company: "Acme", role: "Developer" });

    await matches.saveMatch(id, analysis(40));
    await matches.saveMatch(id, analysis(80));

    expect(await matches.getMatch("alice", id)).toMatchObject({ score: 80, gaps: ["Docker", "AWS"] });
    expect(await matches.getMatch("bob", id)).toBeNull();
    expect(await prisma.matchAnalysis.count()).toBe(1);
  });

  it("deletes the analysis with its application", async () => {
    const { id } = await applications.create("alice", { company: "Acme", role: "Developer" });
    await matches.saveMatch(id, analysis(60));

    await applications.delete("alice", id);

    expect(await prisma.matchAnalysis.count()).toBe(0);
  });
});
