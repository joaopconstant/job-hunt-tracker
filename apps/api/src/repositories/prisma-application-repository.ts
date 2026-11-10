import type { PrismaClient } from "../generated/prisma/client.js";
import type { ApplicationRepository } from "./application-repository.js";

const select = {
  id: true,
  company: true,
  role: true,
  url: true,
  location: true,
  status: true,
  notes: true,
  appliedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class PrismaApplicationRepository implements ApplicationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  list: ApplicationRepository["list"] = (userId, filter = {}) =>
    this.prisma.application.findMany({
      where: { userId, status: filter.status },
      orderBy: { updatedAt: "desc" },
      select,
    });

  findById: ApplicationRepository["findById"] = (userId, id) =>
    this.prisma.application.findFirst({ where: { id, userId }, select });

  create: ApplicationRepository["create"] = (userId, input) =>
    this.prisma.application.create({ data: { ...input, userId }, select });

  update: ApplicationRepository["update"] = async (userId, id, input) => {
    const { count } = await this.prisma.application.updateMany({ where: { id, userId }, data: input });
    return count === 0 ? null : this.findById(userId, id);
  };

  delete: ApplicationRepository["delete"] = async (userId, id) => {
    const { count } = await this.prisma.application.deleteMany({ where: { id, userId } });
    return count > 0;
  };
}
