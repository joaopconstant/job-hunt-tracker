import { Suspense } from "react";
import { Board } from "@/components/board";
import { NewApplicationForm } from "@/components/new-application-form";
import { api } from "@/lib/api";

async function ApplicationsBoard() {
  const applications = await api.listApplications();
  return <Board applications={applications} />;
}

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Job Hunt Tracker</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Track every application from wishlist to offer.</p>
      </header>
      <NewApplicationForm />
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading applications…</p>}>
        <ApplicationsBoard />
      </Suspense>
    </main>
  );
}
