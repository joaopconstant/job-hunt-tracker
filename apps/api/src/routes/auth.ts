import type { FastifyPluginAsync } from "fastify";
import type { Authenticator } from "../authenticator.js";

/** Bridges Fastify to the Fetch-based Better Auth handler. */
export const authRoutes: FastifyPluginAsync<{ authenticator: Authenticator }> = async (app, { authenticator }) => {
  // Pass bodies through untouched: Better Auth parses them itself, and some of its
  // requests (sign-out) send `content-type: application/json` with an empty body.
  app.removeAllContentTypeParsers();
  app.addContentTypeParser("*", { parseAs: "string" }, (_request, body, done) => done(null, body));

  app.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    schema: { hide: true },
    async handler(request, reply) {
      const headers = new Headers();
      for (const [key, value] of Object.entries(request.headers)) {
        if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(", ") : value);
      }

      const response = await authenticator.handler(
        new Request(new URL(request.url, `http://${request.headers.host ?? "localhost"}`), {
          method: request.method,
          headers,
          body: request.method === "GET" || !request.body ? undefined : (request.body as string),
        }),
      );

      reply.status(response.status);
      response.headers.forEach((value, key) => {
        if (key !== "set-cookie") reply.header(key, value);
      });
      const cookies = response.headers.getSetCookie();
      if (cookies.length > 0) reply.header("set-cookie", cookies);
      return reply.send(response.body ? await response.text() : null);
    },
  });
};
