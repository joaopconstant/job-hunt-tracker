import type { onRequestHookHandler } from "fastify";
import type { Authenticator } from "../authenticator.js";

declare module "fastify" {
  interface FastifyRequest {
    userId: string;
  }
}

/** onRequest hook that answers 401 unless the request carries a valid session. */
export function requireUser(authenticator: Authenticator): onRequestHookHandler {
  return async (request, reply) => {
    const userId = await authenticator.getUserId(request.headers);
    if (!userId) return reply.status(401).send({ message: "Unauthorized" });
    request.userId = userId;
  };
}
