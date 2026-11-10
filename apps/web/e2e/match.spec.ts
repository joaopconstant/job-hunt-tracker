import { expect, test } from "@playwright/test";
import { signUp } from "./helpers";

// The e2e stack runs without ANTHROPIC_API_KEY, so the API uses the deterministic keyword baseline.
const RESUME = `Ada Lovelace — Full Stack Developer
Four years building web apps with TypeScript, React and Node.js.
Databases: PostgreSQL with Prisma. Tests with Vitest.`;

const JOB = `Full Stack Developer at Acme.
Requirements: TypeScript, React, Node.js, PostgreSQL, Docker and AWS.`;

test("compares a job posting with the saved résumé", async ({ page }) => {
  await signUp(page);

  await page.getByLabel("Company").fill("Acme");
  await page.getByLabel("Role").fill("Full Stack Developer");
  await page.getByRole("button", { name: "Add application" }).click();
  const card = page.getByRole("article", { name: "Full Stack Developer at Acme" });

  // Without a résumé the page points to the résumé page instead of the form.
  await card.getByRole("link", { name: "Compare with résumé" }).click();
  await expect(page.getByRole("heading", { name: "Full Stack Developer at Acme" })).toBeVisible();
  await page.getByRole("link", { name: "Save your résumé" }).click();

  await expect(page.getByRole("heading", { name: "Résumé" })).toBeVisible();
  await page.getByLabel("Résumé").fill(RESUME);
  await page.getByRole("button", { name: "Save résumé" }).click();
  await expect(page.getByRole("status")).toHaveText("Résumé saved.");

  await page.getByRole("link", { name: "Board", exact: true }).click();
  await card.getByRole("link", { name: "Compare with résumé" }).click();
  await page.getByLabel("Job description").fill(JOB);
  await page.getByRole("button", { name: "Compare with my résumé" }).click();

  const result = page.getByRole("region", { name: "Match analysis" });
  // 4 of the 6 skills in the posting appear in the résumé.
  await expect(result.getByText("67", { exact: true })).toBeVisible();
  await expect(result.getByRole("region", { name: "Gaps" })).toContainText("Docker");
  await expect(result.getByRole("region", { name: "Gaps" })).toContainText("AWS");

  // The analysis is stored: it is still there after a reload.
  await page.reload();
  await expect(page.getByRole("region", { name: "Match analysis" }).getByText("67", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Job description")).toHaveValue(JOB);
});
