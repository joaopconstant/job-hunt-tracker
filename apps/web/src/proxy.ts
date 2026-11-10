import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/sign-in", "/sign-up"];

// Optimistic check only: it looks for the cookie, the API validates the session.
export function proxy(request: NextRequest) {
  const isPublic = PUBLIC_PATHS.includes(request.nextUrl.pathname);
  const hasSession = Boolean(getSessionCookie(request));

  if (!hasSession && !isPublic) return NextResponse.redirect(new URL("/sign-in", request.url));
  if (hasSession && isPublic) return NextResponse.redirect(new URL("/", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
