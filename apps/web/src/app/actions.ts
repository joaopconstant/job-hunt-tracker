"use server";

import { refresh } from "next/cache";
import { api } from "@/lib/api";
import { isApplicationStatus } from "@/lib/applications";
import { MIN_TEXT_LENGTH, type FormState } from "@/lib/match";

const text = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
};

export async function createApplication(formData: FormData) {
  const company = text(formData, "company");
  const role = text(formData, "role");
  if (!company || !role) return;

  await api.createApplication({
    company,
    role,
    url: text(formData, "url"),
    location: text(formData, "location"),
  });
  refresh();
}

export async function moveApplication(formData: FormData) {
  const id = text(formData, "id");
  const status = formData.get("status");
  if (!id || !isApplicationStatus(status)) return;

  await api.updateStatus(id, status);
  refresh();
}

export async function deleteApplication(formData: FormData) {
  const id = text(formData, "id");
  if (!id) return;

  await api.deleteApplication(id);
  refresh();
}

export async function saveResume(_previous: FormState, formData: FormData): Promise<FormState> {
  const content = text(formData, "content");
  if (!content || content.length < MIN_TEXT_LENGTH) {
    return { status: "error", message: `Paste your full résumé (at least ${MIN_TEXT_LENGTH} characters).` };
  }

  await api.saveResume(content);
  refresh();
  return { status: "success", message: "Résumé saved." };
}

export async function analyzeMatch(_previous: FormState, formData: FormData): Promise<FormState> {
  const id = text(formData, "id");
  const jobDescription = text(formData, "jobDescription");
  if (!id) return { status: "error", message: "Missing application." };
  if (!jobDescription || jobDescription.length < MIN_TEXT_LENGTH) {
    return { status: "error", message: `Paste the full job posting (at least ${MIN_TEXT_LENGTH} characters).` };
  }

  const outcome = await api.runMatch(id, jobDescription);
  if (!outcome.ok) return { status: "error", message: outcome.message };
  refresh();
  return { status: "success", message: "Analysis ready." };
}
