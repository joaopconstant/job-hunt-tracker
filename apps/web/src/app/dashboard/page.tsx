import type { Metadata } from "next";
import { Suspense } from "react";
import { Dashboard } from "@/components/dashboard";
import { SiteHeader } from "@/components/site-header";
import { api } from "@/lib/api";

export const metadata: Metadata = { title: "Dashboard · Job Hunt Tracker" };

async function DashboardData() {
  const stats = await api.getStats();
  return <Dashboard stats={stats} />;
}

export default function DashboardPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8">
      <SiteHeader current="/dashboard" />
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">How your job hunt is going.</p>
      </div>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading stats…</p>}>
        <DashboardData />
      </Suspense>
    </main>
  );
}
