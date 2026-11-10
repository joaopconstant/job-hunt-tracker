import { expect, type Page } from "@playwright/test";

export const PASSWORD = "correct-horse-battery";

/** Signs up a brand new user, so every test starts with an empty board. */
export async function signUp(page: Page, name = "Ada Lovelace") {
  const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
  await page.goto("/sign-up");
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("heading", { name: "Job Hunt Tracker" })).toBeVisible();
  return { email };
}
