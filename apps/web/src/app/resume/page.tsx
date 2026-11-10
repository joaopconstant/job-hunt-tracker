import type { Metadata } from "next";
import { Suspense } from "react";
import { ResumeForm } from "@/components/resume-form";
import { SiteHeader } from "@/components/site-header";
import { api } from "@/lib/api";

export const metadata: Metadata = { title: "Résumé · Job Hunt Tracker" };

async function ResumeData() {
  const resume = await api.getResume();
  return <ResumeForm content={resume?.content ?? ""} />;
}

export default function ResumePage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8">
      <SiteHeader current="/resume" />
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Résumé</h1>
        <p className="text-sm text-muted-foreground">
          Job postings are compared against this text. Plain text works best.
        </p>
      </div>
      <div className="max-w-3xl">
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading résumé…</p>}>
          <ResumeData />
        </Suspense>
      </div>
    </main>
  );
}
