"use server";

import { refresh } from "next/cache";
import { api } from "@/lib/api";
import { isApplicationStatus } from "@/lib/applications";

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
