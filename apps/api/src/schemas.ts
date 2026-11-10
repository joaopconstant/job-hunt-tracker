import { z } from "zod";

export const applicationStatus = z.enum(["WISHLIST", "APPLIED", "INTERVIEW", "OFFER", "REJECTED"]);

export const applicationSchema = z.object({
  id: z.string(),
  company: z.string(),
  role: z.string(),
  url: z.string().nullable(),
  location: z.string().nullable(),
  status: applicationStatus,
  notes: z.string().nullable(),
  appliedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createApplicationSchema = z.object({
  company: z.string().trim().min(1).max(120),
  role: z.string().trim().min(1).max(120),
  url: z.url().nullish(),
  location: z.string().trim().max(120).nullish(),
  status: applicationStatus.optional(),
  notes: z.string().max(5000).nullish(),
  appliedAt: z.coerce.date().nullish(),
});

export const updateApplicationSchema = createApplicationSchema.partial();

export const listApplicationsQuery = z.object({
  status: applicationStatus.optional(),
});

export const idParams = z.object({ id: z.string().min(1) });

export type Application = z.infer<typeof applicationSchema>;
export type ApplicationStatus = z.infer<typeof applicationStatus>;
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
