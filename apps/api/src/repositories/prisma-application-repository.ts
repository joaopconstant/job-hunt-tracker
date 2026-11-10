import { Prisma, type PrismaClient } from "../generated/prisma/client.js";
import type { ApplicationRepository } from "./application-repository.js";

const isNotFound = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";

export class PrismaApplicationRepository implements ApplicationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  list: ApplicationRepository["list"] = (filter = {}) =>
    this.prisma.application.findMany({
      where: { status: filter.status },
      orderBy: { updatedAt: "desc" },
    });

  findById: ApplicationRepository["findById"] = (id) =>
    this.prisma.application.findUnique({ where: { id } });

  create: ApplicationRepository["create"] = (input) =>
    this.prisma.application.create({ data: input });

  update: ApplicationRepository["update"] = async (id, input) => {
    try {
      return await this.prisma.application.update({ where: { id }, data: input });
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  };

  delete: ApplicationRepository["delete"] = async (id) => {
    try {
      await this.prisma.application.delete({ where: { id } });
      return true;
    } catch (error) {
      if (isNotFound(error)) return false;
      throw error;
    }
  };
}
