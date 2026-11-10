import type { PrismaClient } from "../generated/prisma/client.js";
import type { MatchRepository } from "./match-repository.js";

const resumeSelect = { content: true, updatedAt: true } as const;
const matchSelect = {
  score: true,
  summary: true,
  strengths: true,
  gaps: true,
  suggestions: true,
  jobDescription: true,
  analyzer: true,
  createdAt: true,
} as const;

export class PrismaMatchRepository implements MatchRepository {
  constructor(private readonly prisma: PrismaClient) {}

  getResume: MatchRepository["getResume"] = (userId) =>
    this.prisma.resume.findUnique({ where: { userId }, select: resumeSelect });

  saveResume: MatchRepository["saveResume"] = (userId, content) =>
    this.prisma.resume.upsert({
      where: { userId },
      create: { userId, content },
      update: { content },
      select: resumeSelect,
    });

  getMatch: MatchRepository["getMatch"] = (userId, applicationId) =>
    this.prisma.matchAnalysis.findFirst({
      where: { applicationId, application: { userId } },
      select: matchSelect,
    });

  saveMatch: MatchRepository["saveMatch"] = (applicationId, input) =>
    this.prisma.matchAnalysis.upsert({
      where: { applicationId },
      create: { applicationId, ...input },
      update: { ...input, createdAt: new Date() },
      select: matchSelect,
    });
}
