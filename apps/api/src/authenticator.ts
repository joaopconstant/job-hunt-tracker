import type { IncomingHttpHeaders } from "node:http";
import { fromNodeHeaders } from "better-auth/node";
import type { Auth } from "./auth.js";

/** What the HTTP layer needs from authentication, so routes can be tested without Better Auth. */
export interface Authenticator {
  getUserId(headers: IncomingHttpHeaders): Promise<string | null>;
  /** Handles the auth endpoints (sign-up, sign-in, sign-out, session) mounted under /api/auth. */
  handler(request: Request): Promise<Response>;
}

export function betterAuthAuthenticator(auth: Auth): Authenticator {
  return {
    async getUserId(headers) {
      const session = await auth.api.getSession({ headers: fromNodeHeaders(headers) });
      return session?.user.id ?? null;
    },
    handler: (request) => auth.handler(request),
  };
}
