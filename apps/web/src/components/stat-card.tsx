import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";

export function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card size="sm" role="group" aria-label={label}>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <span className="font-heading text-3xl font-semibold tabular-nums">{value}</span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </CardContent>
    </Card>
  );
}
