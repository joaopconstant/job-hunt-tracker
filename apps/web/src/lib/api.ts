import "server-only";
import type { Application, ApplicationStatus } from "./applications";

const API_URL = process.env.API_URL ?? "http://localhost:3333";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
  });
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
