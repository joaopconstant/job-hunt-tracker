import "server-only";
import { redirect } from "next/navigation";
import type { Application, ApplicationStatus } from "./applications";
import { API_URL } from "./config";
import { forwardedHeaders } from "./session";
import type { MatchAnalysis, Resume } from "./match";
import type { Stats } from "./stats";

async function send(path: string, init?: RequestInit) {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      // Only when there is a body: Fastify rejects an empty body declared as JSON.
      ...(init?.body !== undefined && { "content-type": "application/json" }),
      ...(await forwardedHeaders()),
      ...init?.headers,
    },
  });
  if (response.status === 401) redirect("/sign-in");
  return response;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await send(path, init);
  if (!response.ok) {
    throw new Error(`API ${init?.method ?? "GET"} ${path} failed with ${response.status}`);
  }
  return (response.status === 204 ? null : await response.json()) as T;
}

/** For resources that may not exist yet: 404 becomes null. */
async function requestOrNull<T>(path: string): Promise<T | null> {
  const response = await send(path);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`API GET ${path} failed with ${response.status}`);
  return (await response.json()) as T;
}

export type MatchOutcome = { ok: true; analysis: MatchAnalysis } | { ok: false; message: string };

export const api = {
  listApplications: () => request<Application[]>("/applications"),
  getStats: () => request<Stats>("/applications/stats"),
  createApplication: (input: { company: string; role: string; url?: string; location?: string }) =>
    request<Application>("/applications", { method: "POST", body: JSON.stringify(input) }),
  updateStatus: (id: string, status: ApplicationStatus) =>
    request<Application>(`/applications/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
  deleteApplication: (id: string) => request<null>(`/applications/${id}`, { method: "DELETE" }),
  getApplication: (id: string) => requestOrNull<Application>(`/applications/${id}`),
  getResume: () => requestOrNull<Resume>("/resume"),
  saveResume: (content: string) => request<Resume>("/resume", { method: "PUT", body: JSON.stringify({ content }) }),
  getMatch: (applicationId: string) => requestOrNull<MatchAnalysis>(`/applications/${applicationId}/match`),
  /** Expected failures (no résumé, rate limit, AI unavailable) come back as a message to show. */
  runMatch: async (applicationId: string, jobDescription: string): Promise<MatchOutcome> => {
    const response = await send(`/applications/${applicationId}/match`, {
      method: "POST",
      body: JSON.stringify({ jobDescription }),
    });
    const body = await response.json();
    if (response.ok) return { ok: true, analysis: body as MatchAnalysis };
    if (response.status >= 500 && response.status !== 502) {
      throw new Error(`API POST match failed with ${response.status}`);
    }
    return { ok: false, message: typeof body?.message === "string" ? body.message : "The analysis failed." };
  },
};
