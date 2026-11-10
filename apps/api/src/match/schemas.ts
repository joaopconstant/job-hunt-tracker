import { z } from "zod";

export const resumeSchema = z.object({
  content: z.string(),
  updatedAt: z.date(),
});

export const saveResumeSchema = z.object({
  content: z.string().trim().min(50, "Paste your full résumé (at least 50 characters)").max(30_000),
});

export const requestMatchSchema = z.object({
  jobDescription: z.string().trim().min(50, "Paste the full job posting (at least 50 characters)").max(30_000),
});

/** What an analyzer returns. */
export const matchResultSchema = z.object({
  score: z.int(),
  summary: z.string(),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  suggestions: z.array(z.string()),
});

/** What the API stores and returns. */
export const matchAnalysisSchema = matchResultSchema.extend({
  jobDescription: z.string(),
  analyzer: z.string(),
  createdAt: z.date(),
});

export type Resume = z.infer<typeof resumeSchema>;
export type MatchResult = z.infer<typeof matchResultSchema>;
export type MatchAnalysis = z.infer<typeof matchAnalysisSchema>;
