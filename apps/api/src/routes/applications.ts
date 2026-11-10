import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import type { ApplicationRepository } from "../repositories/application-repository.js";
import {
  applicationSchema,
  createApplicationSchema,
  idParams,
  listApplicationsQuery,
  updateApplicationSchema,
} from "../schemas.js";

const notFound = z.object({ message: z.string() });

export const applicationRoutes: FastifyPluginAsyncZod<{ repository: ApplicationRepository }> = async (
  app,
  { repository },
) => {
  app.get(
    "/applications",
    {
      schema: {
        tags: ["applications"],
        querystring: listApplicationsQuery,
        response: { 200: z.array(applicationSchema) },
      },
    },
    async (request) => repository.list(request.query),
  );

  app.get(
    "/applications/:id",
    {
      schema: {
        tags: ["applications"],
        params: idParams,
        response: { 200: applicationSchema, 404: notFound },
      },
    },
    async (request, reply) => {
      const application = await repository.findById(request.params.id);
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
        response: { 201: applicationSchema },
      },
    },
    async (request, reply) => reply.status(201).send(await repository.create(request.body)),
  );

  app.patch(
    "/applications/:id",
    {
      schema: {
        tags: ["applications"],
        params: idParams,
        body: updateApplicationSchema,
        response: { 200: applicationSchema, 404: notFound },
      },
    },
    async (request, reply) => {
      const application = await repository.update(request.params.id, request.body);
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
        response: { 204: z.null(), 404: notFound },
      },
    },
    async (request, reply) => {
      const deleted = await repository.delete(request.params.id);
      if (!deleted) return reply.status(404).send({ message: "Application not found" });
      return reply.status(204).send(null);
    },
  );
};
