import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import type { Authenticator } from "../authenticator.js";
import { MatchUnavailableError, type MatchAnalyzer } from "../match/analyzer.js";
import { FixedWindowLimiter } from "../match/rate-limiter.js";
import { matchAnalysisSchema, requestMatchSchema, resumeSchema, saveResumeSchema } from "../match/schemas.js";
import type { ApplicationRepository } from "../repositories/application-repository.js";
import type { MatchRepository } from "../repositories/match-repository.js";
import { idParams } from "../schemas.js";
import { errorSchema } from "./applications.js";
import { requireUser } from "./require-user.js";

export interface MatchRoutesOptions {
  applications: ApplicationRepository;
  matches: MatchRepository;
  analyzer: MatchAnalyzer;
  authenticator: Authenticator;
  /** Each analysis costs an API call, so cap them per user. Defaults to 20 per hour. */
  limiter?: FixedWindowLimiter;
}

export const matchRoutes: FastifyPluginAsyncZod<MatchRoutesOptions> = async (
  app,
  { applications, matches, analyzer, authenticator, limiter = new FixedWindowLimiter(20, 60 * 60 * 1000) },
) => {
  app.decorateRequest("userId", "");
  app.addHook("onRequest", requireUser(authenticator));

  app.get(
    "/resume",
    { schema: { tags: ["resume"], response: { 200: resumeSchema, 401: errorSchema, 404: errorSchema } } },
    async (request, reply) => {
      const resume = await matches.getResume(request.userId);
      if (!resume) return reply.status(404).send({ message: "No résumé saved yet" });
      return resume;
    },
  );

  app.put(
    "/resume",
    { schema: { tags: ["resume"], body: saveResumeSchema, response: { 200: resumeSchema, 401: errorSchema } } },
    async (request) => matches.saveResume(request.userId, request.body.content),
  );

  app.get(
    "/applications/:id/match",
    {
      schema: {
        tags: ["match"],
        params: idParams,
        response: { 200: matchAnalysisSchema, 401: errorSchema, 404: errorSchema },
      },
    },
    async (request, reply) => {
      const match = await matches.getMatch(request.userId, request.params.id);
      if (!match) return reply.status(404).send({ message: "No analysis for this application" });
      return match;
    },
  );

  app.post(
    "/applications/:id/match",
    {
      schema: {
        tags: ["match"],
        description: "Compares the job posting with the user's saved résumé and stores the result.",
        params: idParams,
        body: requestMatchSchema,
        response: {
          201: matchAnalysisSchema,
          401: errorSchema,
          404: errorSchema,
          409: errorSchema,
          429: errorSchema,
          502: errorSchema,
        },
      },
    },
    async (request, reply) => {
      const application = await applications.findById(request.userId, request.params.id);
      if (!application) return reply.status(404).send({ message: "Application not found" });

      const resume = await matches.getResume(request.userId);
      if (!resume) return reply.status(409).send({ message: "Save your résumé before running an analysis" });

      if (!limiter.tryHit(request.userId)) {
        return reply.status(429).send({ message: "Too many analyses. Try again later." });
      }

      const { jobDescription } = request.body;
      try {
        const result = await analyzer.analyze({
          resume: resume.content,
          jobDescription,
          company: application.company,
          role: application.role,
        });
        const match = await matches.saveMatch(application.id, { ...result, jobDescription, analyzer: analyzer.name });
        return reply.status(201).send(match);
      } catch (error) {
        if (!(error instanceof MatchUnavailableError)) throw error;
        request.log.warn({ err: error }, "match analysis failed");
        return reply.status(502).send({ message: "The analysis is unavailable right now. Try again later." });
      }
    },
  );
};
