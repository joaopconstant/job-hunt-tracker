import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createPrismaClient } from "../src/db.js";
import { PrismaApplicationRepository } from "../src/repositories/prisma-application-repository.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for integration tests");

const prisma = createPrismaClient(databaseUrl);
const repository = new PrismaApplicationRepository(prisma);

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

describe("PrismaApplicationRepository", () => {
  it("creates and finds an application", async () => {
    const created = await repository.create("alice", { company: "Acme", role: "Full Stack Developer" });

    const found = await repository.findById("alice", created.id);

    expect(found).toMatchObject({ company: "Acme", status: "WISHLIST" });
  });

  it("lists by status, most recently updated first", async () => {
    const first = await repository.create("alice", { company: "Acme", role: "Dev", status: "APPLIED" });
    await repository.create("alice", { company: "Globex", role: "Dev", status: "APPLIED" });
    await repository.create("alice", { company: "Initech", role: "Dev", status: "OFFER" });
    await repository.update("alice", first.id, { notes: "Recruiter replied" });

    const applied = await repository.list("alice", { status: "APPLIED" });

    expect(applied.map((a) => a.company)).toEqual(["Acme", "Globex"]);
  });

  it("returns null or false for unknown ids", async () => {
    expect(await repository.update("alice", "missing", { status: "OFFER" })).toBeNull();
    expect(await repository.delete("alice", "missing")).toBe(false);
  });

  it("never reads or changes another user's applications", async () => {
    const created = await repository.create("alice", { company: "Acme", role: "Dev" });

    expect(await repository.list("bob")).toEqual([]);
    expect(await repository.findById("bob", created.id)).toBeNull();
    expect(await repository.update("bob", created.id, { status: "OFFER" })).toBeNull();
    expect(await repository.delete("bob", created.id)).toBe(false);
    expect(await repository.findById("alice", created.id)).toMatchObject({ status: "WISHLIST" });
  });
});
