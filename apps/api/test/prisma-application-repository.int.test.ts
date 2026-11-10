import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createPrismaClient } from "../src/db.js";
import { PrismaApplicationRepository } from "../src/repositories/prisma-application-repository.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for integration tests");

const prisma = createPrismaClient(databaseUrl);
const repository = new PrismaApplicationRepository(prisma);

beforeEach(async () => {
  await prisma.application.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("PrismaApplicationRepository", () => {
  it("creates and finds an application", async () => {
    const created = await repository.create({ company: "Acme", role: "Full Stack Developer" });

    const found = await repository.findById(created.id);

    expect(found).toMatchObject({ company: "Acme", status: "WISHLIST" });
  });

  it("lists by status, most recently updated first", async () => {
    const first = await repository.create({ company: "Acme", role: "Dev", status: "APPLIED" });
    await repository.create({ company: "Globex", role: "Dev", status: "APPLIED" });
    await repository.create({ company: "Initech", role: "Dev", status: "OFFER" });
    await repository.update(first.id, { notes: "Recruiter replied" });

    const applied = await repository.list({ status: "APPLIED" });

    expect(applied.map((a) => a.company)).toEqual(["Acme", "Globex"]);
  });

  it("returns null or false for unknown ids", async () => {
    expect(await repository.update("missing", { status: "OFFER" })).toBeNull();
    expect(await repository.delete("missing")).toBe(false);
  });
});
