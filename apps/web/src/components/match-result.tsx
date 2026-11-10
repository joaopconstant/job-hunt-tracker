import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { analyzerLabel, scoreLabel, type MatchAnalysis } from "@/lib/match";

function Section({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <section aria-label={title} className="flex flex-col gap-2">
      <h3 className="text-sm font-medium">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function MatchResult({ analysis }: { analysis: MatchAnalysis }) {
  return (
    <Card role="region" aria-label="Match analysis">
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-3">
          <span className="font-heading text-3xl tabular-nums">{analysis.score}</span>
          <span className="text-muted-foreground">/ 100</span>
          <Badge variant="secondary">{scoreLabel(analysis.score)}</Badge>
        </CardTitle>
        <CardDescription>
          {analyzerLabel(analysis.analyzer)} · {new Date(analysis.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <Progress value={analysis.score} aria-label="Match score" />
        <p className="text-sm">{analysis.summary}</p>
        <div className="grid gap-6 md:grid-cols-3">
          <Section title="Strengths" items={analysis.strengths} empty="No clear strengths found." />
          <Section title="Gaps" items={analysis.gaps} empty="No gaps found." />
          <Section title="Suggestions" items={analysis.suggestions} empty="No suggestions." />
        </div>
      </CardContent>
    </Card>
  );
}
