import type { MatchAnalysis, MatchResult, Resume } from "../match/schemas.js";

export interface SaveMatchInput extends MatchResult {
  jobDescription: string;
  analyzer: string;
}

/** Résumés and match analyses, scoped to one user like the application repository. */
export interface MatchRepository {
  getResume(userId: string): Promise<Resume | null>;
  saveResume(userId: string, content: string): Promise<Resume>;
  /** Returns null when the application has no analysis or belongs to another user. */
  getMatch(userId: string, applicationId: string): Promise<MatchAnalysis | null>;
  /** Replaces the application's previous analysis. The caller checks the application belongs to the user. */
  saveMatch(applicationId: string, input: SaveMatchInput): Promise<MatchAnalysis>;
}
