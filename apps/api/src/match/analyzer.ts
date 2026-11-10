import type { MatchResult } from "./schemas.js";

export interface MatchInput {
  resume: string;
  jobDescription: string;
  company: string;
  role: string;
}

/** Compares a job posting with a résumé. */
export interface MatchAnalyzer {
  /** Stored with each analysis so the UI can say what produced it. */
  readonly name: string;
  analyze(input: MatchInput): Promise<MatchResult>;
}

/** The analyzer could not produce a result (provider error, refusal, unparseable output). */
export class MatchUnavailableError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "MatchUnavailableError";
  }
}

export function clampScore(score: number) {
  return Math.min(100, Math.max(0, Math.round(score)));
}
