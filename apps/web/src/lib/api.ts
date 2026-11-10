import "server-only";
import { redirect } from "next/navigation";
import type { Application, ApplicationStatus } from "./applications";
import { API_URL } from "./config";
import { sessionCookieHeader } from "./session";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      cookie: await sessionCookieHeader(),
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
  createApplication: (input: { company: string; role: string; url?: string; location?: string }) =>
    request<Application>("/applications", { method: "POST", body: JSON.stringify(input) }),
  updateStatus: (id: string, status: ApplicationStatus) =>
    request<Application>(`/applications/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
  deleteApplication: (id: string) => request<null>(`/applications/${id}`, { method: "DELETE" }),
};
