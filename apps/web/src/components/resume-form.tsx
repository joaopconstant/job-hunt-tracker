"use client";

import { useActionState } from "react";
import { saveResume } from "@/app/actions";
import { FormMessage } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FormState } from "@/lib/match";

export function ResumeForm({ content }: { content: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveResume, { status: "idle" });

  return (
    <form action={action} className="flex flex-col gap-3">
      <Label htmlFor="resume-content">Résumé</Label>
      <Textarea
        id="resume-content"
        name="content"
        defaultValue={content}
        required
        rows={18}
        placeholder="Paste the text of your résumé here."
        className="font-mono text-sm"
      />
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save résumé"}
        </Button>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
