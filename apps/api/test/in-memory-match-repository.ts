import type { MatchAnalysis, Resume } from "../src/match/schemas.js";
import type { MatchRepository } from "../src/repositories/match-repository.js";
import type { InMemoryApplicationRepository } from "./in-memory-application-repository.js";

export class InMemoryMatchRepository implements MatchRepository {
  resumes = new Map<string, Resume>();
  matches = new Map<string, MatchAnalysis>();

  constructor(private readonly applications: InMemoryApplicationRepository) {}

  getResume: MatchRepository["getResume"] = async (userId) => this.resumes.get(userId) ?? null;

  saveResume: MatchRepository["saveResume"] = async (userId, content) => {
    const resume = { content, updatedAt: new Date() };
    this.resumes.set(userId, resume);
    return resume;
  };

  getMatch: MatchRepository["getMatch"] = async (userId, applicationId) => {
    const owned = this.applications.items.some((item) => item.id === applicationId && item.userId === userId);
    return owned ? (this.matches.get(applicationId) ?? null) : null;
  };

  saveMatch: MatchRepository["saveMatch"] = async (applicationId, input) => {
    const match = { ...input, createdAt: new Date() };
    this.matches.set(applicationId, match);
    return match;
  };
}
