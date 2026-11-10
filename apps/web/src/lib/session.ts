import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { API_URL } from "./config";

export interface User {
  id: string;
  name: string;
  email: string;
}

/**
 * Headers to forward on server-to-server calls to the API: the session cookie identifies
 * the user, and x-forwarded-for keeps Better Auth's rate limiting per client IP.
 */
export async function forwardedHeaders(): Promise<Record<string, string>> {
  const incoming = await headers();
  const forwarded: Record<string, string> = {};
  for (const name of ["cookie", "x-forwarded-for"]) {
    const value = incoming.get(name);
    if (value) forwarded[name] = value;
  }
  return forwarded;
}

/** Returns the signed-in user, or redirects to the sign-in page. */
export async function getCurrentUser(): Promise<User> {
  const response = await fetch(`${API_URL}/api/auth/get-session`, {
    headers: await forwardedHeaders(),
  });
  const session = response.ok ? ((await response.json()) as { user: User } | null) : null;
  if (!session) redirect("/sign-in");
  return { id: session.user.id, name: session.user.name, email: session.user.email };
}
