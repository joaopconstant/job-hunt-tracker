import { Suspense } from "react";
import { Board } from "@/components/board";
import { NewApplicationForm } from "@/components/new-application-form";
import { SiteHeader } from "@/components/site-header";
import { api } from "@/lib/api";

async function ApplicationsBoard() {
  const applications = await api.listApplications();
  return <Board applications={applications} />;
}

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8">
      <SiteHeader current="/" />
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Board</h1>
        <p className="text-sm text-muted-foreground">Track every application from wishlist to offer.</p>
      </div>
      <NewApplicationForm />
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading applications…</p>}>
        <ApplicationsBoard />
      </Suspense>
    </main>
  );
}
