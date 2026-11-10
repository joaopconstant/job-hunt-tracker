import { beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { fakeAuthenticator } from "./fake-authenticator.js";
import { InMemoryApplicationRepository } from "./in-memory-application-repository.js";

let repository: InMemoryApplicationRepository;
let app: Awaited<ReturnType<typeof buildApp>>;

beforeEach(async () => {
  repository = new InMemoryApplicationRepository();
  app = await buildApp({ repository, authenticator: fakeAuthenticator });
});

const as = (userId: string) => ({ "x-test-user": userId });

const createApplication = (body: Record<string, unknown>, userId = "alice") =>
  app.inject({ method: "POST", url: "/applications", payload: body, headers: as(userId) });

describe("applications", () => {
  it("rejects requests without a signed-in user", async () => {
    const response = await app.inject({ method: "GET", url: "/applications" });

    expect(response.statusCode).toBe(401);
  });

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

    const response = await app.inject({ method: "GET", url: "/applications?status=INTERVIEW", headers: as("alice") });

    expect(response.statusCode).toBe(200);
    expect(response.json().map((a: { company: string }) => a.company)).toEqual(["Globex"]);
  });

  it("moves an application to another status", async () => {
    const { id } = (await createApplication({ company: "Acme", role: "Dev" })).json();

    const response = await app.inject({
      method: "PATCH",
      url: `/applications/${id}`,
      payload: { status: "INTERVIEW" },
      headers: as("alice"),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().status).toBe("INTERVIEW");
  });

  it("deletes an application", async () => {
    const { id } = (await createApplication({ company: "Acme", role: "Dev" })).json();

    const response = await app.inject({ method: "DELETE", url: `/applications/${id}`, headers: as("alice") });

    expect(response.statusCode).toBe(204);
    expect(repository.items).toHaveLength(0);
  });

  it.each([
    ["GET", undefined],
    ["PATCH", { status: "OFFER" }],
    ["DELETE", undefined],
  ] as const)("returns 404 on %s for an unknown id", async (method, payload) => {
    const response = await app.inject({ method, url: "/applications/missing", payload, headers: as("alice") });

    expect(response.statusCode).toBe(404);
  });

  it("records when an application is sent", async () => {
    const { id, appliedAt } = (await createApplication({ company: "Acme", role: "Dev" })).json();
    expect(appliedAt).toBeNull();

    const moved = await app.inject({
      method: "PATCH",
      url: `/applications/${id}`,
      payload: { status: "APPLIED" },
      headers: as("alice"),
    });

    expect(new Date(moved.json().appliedAt).getTime()).toBeCloseTo(Date.now(), -4);
  });

  it("returns stats for the signed-in user only", async () => {
    await createApplication({ company: "Acme", role: "Dev", status: "APPLIED" });
    await createApplication({ company: "Globex", role: "Dev", status: "OFFER" });
    await createApplication({ company: "Initech", role: "Dev" }, "bob");

    const response = await app.inject({ method: "GET", url: "/applications/stats", headers: as("alice") });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ total: 2, submitted: 2, offerRate: 0.5 });
    expect(response.json().weekly.at(-1).count).toBe(2);
  });

  it("hides one user's applications from another", async () => {
    const { id } = (await createApplication({ company: "Acme", role: "Dev" }, "alice")).json();

    const list = await app.inject({ method: "GET", url: "/applications", headers: as("bob") });
    const update = await app.inject({
      method: "PATCH",
      url: `/applications/${id}`,
      payload: { status: "OFFER" },
      headers: as("bob"),
    });
    const remove = await app.inject({ method: "DELETE", url: `/applications/${id}`, headers: as("bob") });

    expect(list.json()).toEqual([]);
    expect(update.statusCode).toBe(404);
    expect(remove.statusCode).toBe(404);
    expect(repository.items[0]).toMatchObject({ status: "WISHLIST" });
  });
});
