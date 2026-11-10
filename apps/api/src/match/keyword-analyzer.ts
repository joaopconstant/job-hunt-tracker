import type { MatchAnalyzer, MatchInput } from "./analyzer.js";
import type { MatchResult } from "./schemas.js";

/** Common skills a posting might ask for. Matching is case-insensitive on word boundaries. */
const SKILLS = [
  "JavaScript", "TypeScript", "Node.js", "React", "Next.js", "Vue", "Angular", "Svelte",
  "HTML", "CSS", "Tailwind", "Redux", "GraphQL", "REST", "Express", "Fastify", "NestJS",
  "Python", "Django", "FastAPI", "Java", "Spring", "Kotlin", "Go", "Rust", "C#", ".NET", "PHP", "Laravel", "Ruby", "Rails", "Lua",
  "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Prisma", "Elasticsearch",
  "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Terraform", "CI/CD", "GitHub Actions", "Linux",
  "Jest", "Vitest", "Playwright", "Cypress", "Testing Library", "TDD",
  "Git", "Agile", "Scrum", "Microservices", "Figma", "English",
];

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function mentions(text: string, skill: string) {
  return new RegExp(`(^|[^\\w])${escapeRegExp(skill)}(?![\\w])`, "i").test(text);
}

/**
 * Offline baseline used when no Claude API key is configured (local dev, CI, e2e).
 * It only compares a fixed list of skill keywords, so it is deterministic and free.
 */
export class KeywordMatchAnalyzer implements MatchAnalyzer {
  readonly name = "keyword-baseline";

  async analyze({ resume, jobDescription }: MatchInput): Promise<MatchResult> {
    const required = SKILLS.filter((skill) => mentions(jobDescription, skill));
    const met = required.filter((skill) => mentions(resume, skill));
    const missing = required.filter((skill) => !mentions(resume, skill));
    const score = required.length === 0 ? 0 : Math.round((met.length / required.length) * 100);

    return {
      score,
      summary:
        required.length === 0
          ? "No known skill keywords were found in the posting, so this baseline cannot score it."
          : `Your résumé mentions ${met.length} of the ${required.length} skills this posting asks for.`,
      strengths: met.slice(0, 5).map((skill) => `Your résumé mentions ${skill}.`),
      gaps: missing.slice(0, 5).map((skill) => `The posting asks for ${skill}, which your résumé does not mention.`),
      suggestions: missing
        .slice(0, 3)
        .map((skill) => `If you have used ${skill}, add a concrete example of it to your résumé.`),
    };
  }
}
