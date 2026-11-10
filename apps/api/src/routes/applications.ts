import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import type { Authenticator } from "../authenticator.js";
import type { ApplicationRepository } from "../repositories/application-repository.js";
import {
  applicationSchema,
  createApplicationSchema,
  idParams,
  listApplicationsQuery,
  updateApplicationSchema,
} from "../schemas.js";

const errorSchema = z.object({ message: z.string() });

declare module "fastify" {
  interface FastifyRequest {
    userId: string;
  }
}

export const applicationRoutes: FastifyPluginAsyncZod<{
  repository: ApplicationRepository;
  authenticator: Authenticator;
}> = async (app, { repository, authenticator }) => {
  app.decorateRequest("userId", "");
  app.addHook("onRequest", async (request, reply) => {
    const userId = await authenticator.getUserId(request.headers);
    if (!userId) return reply.status(401).send({ message: "Unauthorized" });
    request.userId = userId;
  });

  app.get(
    "/applications",
    {
      schema: {
        tags: ["applications"],
        querystring: listApplicationsQuery,
        response: { 200: z.array(applicationSchema), 401: errorSchema },
      },
    },
    async (request) => repository.list(request.userId, request.query),
  );

  app.get(
    "/applications/:id",
    {
      schema: {
        tags: ["applications"],
        params: idParams,
        response: { 200: applicationSchema, 401: errorSchema, 404: errorSchema },
      },
    },
    async (request, reply) => {
      const application = await repository.findById(request.userId, request.params.id);
      if (!application) return reply.status(404).send({ message: "Application not found" });
      return application;
    },
  );

  app.post(
    "/applications",
    {
      schema: {
        tags: ["applications"],
        body: createApplicationSchema,
        response: { 201: applicationSchema, 401: errorSchema },
      },
    },
    async (request, reply) => reply.status(201).send(await repository.create(request.userId, request.body)),
  );

  app.patch(
    "/applications/:id",
    {
      schema: {
        tags: ["applications"],
        params: idParams,
        body: updateApplicationSchema,
        response: { 200: applicationSchema, 401: errorSchema, 404: errorSchema },
      },
    },
    async (request, reply) => {
      const application = await repository.update(request.userId, request.params.id, request.body);
      if (!application) return reply.status(404).send({ message: "Application not found" });
      return application;
    },
  );

  app.delete(
    "/applications/:id",
    {
      schema: {
        tags: ["applications"],
        params: idParams,
        response: { 204: z.null(), 401: errorSchema, 404: errorSchema },
      },
    },
    async (request, reply) => {
      const deleted = await repository.delete(request.userId, request.params.id);
      if (!deleted) return reply.status(404).send({ message: "Application not found" });
      return reply.status(204).send(null);
    },
  );
};
