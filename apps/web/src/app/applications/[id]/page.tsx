import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MatchForm } from "@/components/match-form";
import { MatchResult } from "@/components/match-result";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { STATUS_LABELS } from "@/lib/applications";

export const metadata: Metadata = { title: "Application · Job Hunt Tracker" };

async function ApplicationDetails({ id }: { id: string }) {
  const [application, match, resume] = await Promise.all([
    api.getApplication(id),
    api.getMatch(id),
    api.getResume(),
  ]);
  if (!application) notFound();

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {application.role} at {application.company}
          </h1>
          <Badge variant="outline">{STATUS_LABELS[application.status]}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Paste the job posting to see how well your résumé fits and what to improve.
        </p>
      </div>

      {match && <MatchResult analysis={match} />}

      <div className="max-w-3xl">
        {resume ? (
          <MatchForm applicationId={application.id} jobDescription={match?.jobDescription ?? ""} />
        ) : (
          <p className="text-sm">
            <Link href="/resume" className="underline underline-offset-4">
              Save your résumé
            </Link>{" "}
            first to compare it with this job.
          </p>
        )}
      </div>
    </>
  );
}

export default async function ApplicationPage({ params }: PageProps<"/applications/[id]">) {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8">
      <SiteHeader />
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to board
      </Link>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading application…</p>}>
        {params.then(({ id }) => (
          <ApplicationDetails id={id} />
        ))}
      </Suspense>
    </main>
  );
}
