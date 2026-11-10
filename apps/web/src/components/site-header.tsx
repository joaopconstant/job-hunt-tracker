import Link from "next/link";
import { Suspense } from "react";
import { UserMenu } from "@/components/user-menu";
import { getCurrentUser } from "@/lib/session";

const links = [
  { href: "/", label: "Board" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/resume", label: "Résumé" },
] as const;

async function CurrentUser() {
  const user = await getCurrentUser();
  return <UserMenu name={user.name} />;
}

export function SiteHeader({ current }: { current?: (typeof links)[number]["href"] }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-6">
        <span className="font-heading text-lg font-semibold tracking-tight">Job Hunt Tracker</span>
        <nav aria-label="Main" className="flex gap-1 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={current === link.href ? "page" : undefined}
              className="rounded-4xl px-3 py-1.5 text-muted-foreground hover:text-foreground aria-[current=page]:bg-muted aria-[current=page]:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <Suspense>
        <CurrentUser />
      </Suspense>
    </header>
  );
}
