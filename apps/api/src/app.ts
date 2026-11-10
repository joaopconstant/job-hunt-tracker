import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify, { type FastifyServerOptions } from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import type { Authenticator } from "./authenticator.js";
import type { ApplicationRepository } from "./repositories/application-repository.js";
import { applicationRoutes } from "./routes/applications.js";
import { authRoutes } from "./routes/auth.js";
import { healthRoutes } from "./routes/health.js";

export interface AppOptions {
  repository: ApplicationRepository;
  authenticator: Authenticator;
  corsOrigin?: string;
  logger?: FastifyServerOptions["logger"];
}

export async function buildApp({ repository, authenticator, corsOrigin, logger = false }: AppOptions) {
  const app = Fastify({ logger }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(cors, { origin: corsOrigin ?? true, credentials: true });
  await app.register(swagger, {
    openapi: { info: { title: "Job Hunt Tracker API", version: "0.1.0" } },
    transform: jsonSchemaTransform,
  });
  await app.register(swaggerUi, { routePrefix: "/docs" });

  await app.register(healthRoutes);
  await app.register(authRoutes, { authenticator });
  await app.register(applicationRoutes, { repository, authenticator });

  return app;
}
