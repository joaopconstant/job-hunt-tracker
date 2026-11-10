import { describe, expect, it } from "vitest";
import { KeywordMatchAnalyzer } from "../src/match/keyword-analyzer.js";

const analyze = (resume: string, jobDescription: string) =>
  new KeywordMatchAnalyzer().analyze({ resume, jobDescription, company: "Acme", role: "Developer" });

describe("KeywordMatchAnalyzer", () => {
  it("scores the share of the posting's skills the résumé mentions", async () => {
    const result = await analyze(
      "I build apps with TypeScript and React.",
      "Requirements: TypeScript, React, Docker and AWS.",
    );

    expect(result.score).toBe(50);
    expect(result.strengths).toEqual(["Your résumé mentions TypeScript.", "Your résumé mentions React."]);
    expect(result.gaps).toHaveLength(2);
    expect(result.gaps[0]).toContain("Docker");
  });

  it("matches whole words only, ignoring case", async () => {
    const result = await analyze("Experience with javascript and golang.", "We use JavaScript and Go.");

    expect(result.strengths).toEqual(["Your résumé mentions JavaScript."]);
    expect(result.gaps).toEqual(["The posting asks for Go, which your résumé does not mention."]);
  });

  it("matches skills with punctuation such as Node.js and C#", async () => {
    const result = await analyze("Node.js and C# developer.", "Node.js, C# and Next.js.");

    expect(result.strengths).toHaveLength(2);
    expect(result.gaps).toEqual(["The posting asks for Next.js, which your résumé does not mention."]);
  });

  it("scores 0 when the posting names no known skill", async () => {
    const result = await analyze("Anything", "A friendly team that values curiosity.");

    expect(result.score).toBe(0);
    expect(result.strengths).toEqual([]);
  });
});
