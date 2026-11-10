import { randomUUID } from "node:crypto";
import type { ApplicationRepository } from "../src/repositories/application-repository.js";
import type { Application } from "../src/schemas.js";

type StoredApplication = Application & { userId: string };

export class InMemoryApplicationRepository implements ApplicationRepository {
  items: StoredApplication[] = [];

  private find(userId: string, id: string) {
    return this.items.find((item) => item.id === id && item.userId === userId);
  }

  private static toApplication(item: StoredApplication): Application {
    const application: Partial<StoredApplication> = { ...item };
    delete application.userId;
    return application as Application;
  }

  list: ApplicationRepository["list"] = async (userId, filter = {}) =>
    this.items
      .filter((item) => item.userId === userId && (!filter.status || item.status === filter.status))
      .map(InMemoryApplicationRepository.toApplication);

  findById: ApplicationRepository["findById"] = async (userId, id) => {
    const item = this.find(userId, id);
    return item ? InMemoryApplicationRepository.toApplication(item) : null;
  };

  create: ApplicationRepository["create"] = async (userId, input) => {
    const now = new Date();
    const item: StoredApplication = {
      id: randomUUID(),
      userId,
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
    this.items.push(item);
    return InMemoryApplicationRepository.toApplication(item);
  };

  update: ApplicationRepository["update"] = async (userId, id, input) => {
    const item = this.find(userId, id);
    if (!item) return null;
    const defined = Object.fromEntries(Object.entries(input).filter(([, v]) => v !== undefined));
    Object.assign(item, defined, { updatedAt: new Date() });
    return InMemoryApplicationRepository.toApplication(item);
  };

  delete: ApplicationRepository["delete"] = async (userId, id) => {
    const item = this.find(userId, id);
    if (!item) return false;
    this.items = this.items.filter((other) => other !== item);
    return true;
  };
}
