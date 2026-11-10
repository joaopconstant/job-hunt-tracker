import { beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { InMemoryApplicationRepository } from "./in-memory-application-repository.js";

let repository: InMemoryApplicationRepository;
let app: Awaited<ReturnType<typeof buildApp>>;

beforeEach(async () => {
  repository = new InMemoryApplicationRepository();
  app = await buildApp({ repository });
});

const createApplication = (body: Record<string, unknown>) =>
  app.inject({ method: "POST", url: "/applications", payload: body });

describe("applications", () => {
  it("creates an application with WISHLIST as the default status", async () => {
    const response = await createApplication({ company: "Acme", role: "Full Stack Developer" });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      company: "Acme",
      role: "Full Stack Developer",
      status: "WISHLIST",
    });
    expect(repository.items).toHaveLength(1);
  });

  it("rejects an application without a company", async () => {
    const response = await createApplication({ company: "", role: "Developer" });

    expect(response.statusCode).toBe(400);
    expect(repository.items).toHaveLength(0);
  });

  it("rejects an invalid job posting url", async () => {
    const response = await createApplication({ company: "Acme", role: "Dev", url: "not-a-url" });

    expect(response.statusCode).toBe(400);
  });

  it("lists applications filtered by status", async () => {
    await createApplication({ company: "Acme", role: "Dev", status: "APPLIED" });
    await createApplication({ company: "Globex", role: "Dev", status: "INTERVIEW" });

    const response = await app.inject({ method: "GET", url: "/applications?status=INTERVIEW" });

    expect(response.statusCode).toBe(200);
    expect(response.json().map((a: { company: string }) => a.company)).toEqual(["Globex"]);
  });

  it("moves an application to another status", async () => {
    const { id } = (await createApplication({ company: "Acme", role: "Dev" })).json();

    const response = await app.inject({
      method: "PATCH",
      url: `/applications/${id}`,
      payload: { status: "INTERVIEW" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().status).toBe("INTERVIEW");
  });

  it("deletes an application", async () => {
    const { id } = (await createApplication({ company: "Acme", role: "Dev" })).json();

    const response = await app.inject({ method: "DELETE", url: `/applications/${id}` });

    expect(response.statusCode).toBe(204);
    expect(repository.items).toHaveLength(0);
  });

  it.each([
    ["GET", undefined],
    ["PATCH", { status: "OFFER" }],
    ["DELETE", undefined],
  ] as const)("returns 404 on %s for an unknown id", async (method, payload) => {
    const response = await app.inject({ method, url: "/applications/missing", payload });

    expect(response.statusCode).toBe(404);
  });
});
