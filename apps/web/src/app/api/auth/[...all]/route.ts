import { API_URL } from "@/lib/config";

// The browser talks to Better Auth through the web origin, so the session cookie is
// first-party here. This handler forwards those requests to the API.
async function forward(request: Request) {
  const { pathname, search } = new URL(request.url);
  const headers = new Headers(request.headers);
  headers.delete("host");

  const response = await fetch(`${API_URL}${pathname}${search}`, {
    method: request.method,
    headers,
    body: request.method === "GET" ? undefined : await request.text(),
    redirect: "manual",
  });

  const responseHeaders = new Headers(response.headers);
  // fetch already decoded the body, so these no longer describe it.
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");
  return new Response(response.body, { status: response.status, headers: responseHeaders });
}

export { forward as GET, forward as POST };
