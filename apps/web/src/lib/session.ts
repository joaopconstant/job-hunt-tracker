import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_URL } from "./config";

export interface User {
  id: string;
  name: string;
  email: string;
}

/** Cookie header to forward to the API so it can identify the user. */
export async function sessionCookieHeader() {
  return (await cookies()).toString();
}

/** Returns the signed-in user, or redirects to the sign-in page. */
export async function getCurrentUser(): Promise<User> {
  const response = await fetch(`${API_URL}/api/auth/get-session`, {
    headers: { cookie: await sessionCookieHeader() },
  });
  const session = response.ok ? ((await response.json()) as { user: User } | null) : null;
  if (!session) redirect("/sign-in");
  return { id: session.user.id, name: session.user.name, email: session.user.email };
}
