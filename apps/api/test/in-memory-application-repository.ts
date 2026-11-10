import { randomUUID } from "node:crypto";
import type { ApplicationRepository } from "../src/repositories/application-repository.js";
import type { Application } from "../src/schemas.js";

export class InMemoryApplicationRepository implements ApplicationRepository {
  items: Application[] = [];

  list: ApplicationRepository["list"] = async (filter = {}) =>
    this.items.filter((item) => !filter.status || item.status === filter.status);

  findById: ApplicationRepository["findById"] = async (id) =>
    this.items.find((item) => item.id === id) ?? null;

  create: ApplicationRepository["create"] = async (input) => {
    const now = new Date();
    const application: Application = {
      id: randomUUID(),
      company: input.company,
      role: input.role,
      url: input.url ?? null,
      location: input.location ?? null,
      status: input.status ?? "WISHLIST",
      notes: input.notes ?? null,
      appliedAt: input.appliedAt ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.items.push(application);
    return application;
  };

  update: ApplicationRepository["update"] = async (id, input) => {
    const application = await this.findById(id);
    if (!application) return null;
    const defined = Object.fromEntries(Object.entries(input).filter(([, v]) => v !== undefined));
    Object.assign(application, defined, { updatedAt: new Date() });
    return application;
  };

  delete: ApplicationRepository["delete"] = async (id) => {
    const before = this.items.length;
    this.items = this.items.filter((item) => item.id !== id);
    return this.items.length < before;
  };
}
