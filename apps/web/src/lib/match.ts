export interface Resume {
  content: string;
  updatedAt: string;
}

export interface MatchAnalysis {
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
  jobDescription: string;
  analyzer: string;
  createdAt: string;
}

/** Result of a form Server Action, shown next to the form. */
export type FormState = { status: "idle" } | { status: "success"; message: string } | { status: "error"; message: string };

export const MIN_TEXT_LENGTH = 50;

export function scoreLabel(score: number) {
  if (score >= 80) return "Strong match";
  if (score >= 50) return "Partial match";
  return "Weak match";
}

export function analyzerLabel(analyzer: string) {
  return analyzer.startsWith("claude-") ? `AI analysis (${analyzer})` : "Keyword baseline (no AI key configured)";
}
