import "server-only";
import { redirect } from "next/navigation";
import type { Application, ApplicationStatus } from "./applications";
import { API_URL } from "./config";
import { forwardedHeaders } from "./session";
import type { Stats } from "./stats";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
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
  if (!response.ok) {
    throw new Error(`API ${init?.method ?? "GET"} ${path} failed with ${response.status}`);
  }
  return (response.status === 204 ? null : await response.json()) as T;
}

export const api = {
  listApplications: () => request<Application[]>("/applications"),
  getStats: () => request<Stats>("/applications/stats"),
  createApplication: (input: { company: string; role: string; url?: string; location?: string }) =>
    request<Application>("/applications", { method: "POST", body: JSON.stringify(input) }),
  updateStatus: (id: string, status: ApplicationStatus) =>
    request<Application>(`/applications/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
  deleteApplication: (id: string) => request<null>(`/applications/${id}`, { method: "DELETE" }),
};
