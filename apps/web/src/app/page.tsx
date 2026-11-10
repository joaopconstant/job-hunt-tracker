import { Suspense } from "react";
import { Board } from "@/components/board";
import { NewApplicationForm } from "@/components/new-application-form";
import { UserMenu } from "@/components/user-menu";
import { api } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";

async function ApplicationsBoard() {
  const applications = await api.listApplications();
  return <Board applications={applications} />;
}

async function CurrentUser() {
  const user = await getCurrentUser();
  return <UserMenu name={user.name} />;
}

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Job Hunt Tracker</h1>
          <p className="text-sm text-muted-foreground">Track every application from wishlist to offer.</p>
        </div>
        <Suspense>
          <CurrentUser />
        </Suspense>
      </header>
      <NewApplicationForm />
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading applications…</p>}>
        <ApplicationsBoard />
      </Suspense>
    </main>
  );
}
