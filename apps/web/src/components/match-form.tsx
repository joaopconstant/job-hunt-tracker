"use client";

import { useActionState } from "react";
import { analyzeMatch } from "@/app/actions";
import { FormMessage } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FormState } from "@/lib/match";

export function MatchForm({ applicationId, jobDescription }: { applicationId: string; jobDescription: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(analyzeMatch, { status: "idle" });

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={applicationId} />
      <Label htmlFor="job-description">Job description</Label>
      <Textarea
        id="job-description"
        name="jobDescription"
        defaultValue={jobDescription}
        required
        rows={12}
        placeholder="Paste the full job description here."
        className="text-sm"
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Analyzing…" : "Compare with my résumé"}
        </Button>
        <FormMessage state={pending ? { status: "idle" } : state} />
      </div>
    </form>
  );
}
