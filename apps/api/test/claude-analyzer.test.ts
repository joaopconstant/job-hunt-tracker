import Anthropic from "@anthropic-ai/sdk";
import { describe, expect, it, vi } from "vitest";
import { MatchUnavailableError } from "../src/match/analyzer.js";
import { CLAUDE_MODEL, ClaudeMatchAnalyzer } from "../src/match/claude-analyzer.js";

const INPUT = {
  resume: "TypeScript developer",
  jobDescription: "We need TypeScript",
  company: "Acme",
  role: "Developer",
};

function fakeClient(response: unknown) {
  const parse = typeof response === "function" ? vi.fn(response as () => unknown) : vi.fn().mockResolvedValue(response);
  const client = { beta: { messages: { parse } } } as unknown as Anthropic;
  return { client, parse };
}

const parsed = (output: unknown, stop_reason = "end_turn") => ({ stop_reason, parsed_output: output, content: [] });

describe("ClaudeMatchAnalyzer", () => {
  it("sends the résumé and posting to Claude with a structured output format", async () => {
    const { client, parse } = fakeClient(
      parsed({ score: 75, summary: "Good", strengths: ["TS"], gaps: [], suggestions: [] }),
    );

    const result = await new ClaudeMatchAnalyzer(client).analyze(INPUT);

    expect(result).toEqual({ score: 75, summary: "Good", strengths: ["TS"], gaps: [], suggestions: [] });
    const request = parse.mock.calls[0][0];
    expect(request.model).toBe(CLAUDE_MODEL);
    expect(request.fallbacks).toBe("default");
    expect(request.output_config.format).toBeDefined();
    expect(request.messages[0].content).toContain("<resume>\nTypeScript developer\n</resume>");
    expect(request.messages[0].content).toContain('company="Acme"');
  });

  it("clamps the score and trims long lists", async () => {
    const many = ["a", "b", "c", "d", "e", "f", "g"];
    const { client } = fakeClient(parsed({ score: 140, summary: "", strengths: many, gaps: many, suggestions: many }));

    const result = await new ClaudeMatchAnalyzer(client).analyze(INPUT);

    expect(result.score).toBe(100);
    expect(result.strengths).toHaveLength(5);
  });

  it("reports a refusal as unavailable", async () => {
    const { client } = fakeClient(parsed(null, "refusal"));

    await expect(new ClaudeMatchAnalyzer(client).analyze(INPUT)).rejects.toBeInstanceOf(MatchUnavailableError);
  });

  it("reports API errors as unavailable", async () => {
    const { client } = fakeClient(async () => {
      throw new Anthropic.InternalServerError(500, undefined, "boom", new Headers());
    });

    await expect(new ClaudeMatchAnalyzer(client).analyze(INPUT)).rejects.toBeInstanceOf(MatchUnavailableError);
  });
});
