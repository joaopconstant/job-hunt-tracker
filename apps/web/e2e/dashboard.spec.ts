import { expect, test, type Page } from "@playwright/test";
import { signUp } from "./helpers";

async function addApplication(page: Page, company: string, status: string) {
  await page.getByLabel("Company").fill(company);
  await page.getByLabel("Role").fill("Full Stack Developer");
  await page.getByRole("button", { name: "Add application" }).click();
  const card = page.getByRole("article", { name: `Full Stack Developer at ${company}` });
  await expect(card).toBeVisible();
  if (status === "WISHLIST") return;
  await card.getByLabel("Status").selectOption(status);
  await card.getByRole("button", { name: "Move" }).click();
  await expect(page.getByRole("region", { name: new RegExp(status, "i") }).getByRole("article", { name: `Full Stack Developer at ${company}` })).toBeVisible();
}

test("summarizes the job hunt on the dashboard", async ({ page }) => {
  await signUp(page);
  await addApplication(page, "Acme", "APPLIED");
  await addApplication(page, "Globex", "INTERVIEW");
  await addApplication(page, "Initech", "WISHLIST");

  await page.getByRole("link", { name: "Dashboard" }).click();

  await expect(page.getByRole("heading", { name: "Dashboard", level: 1 })).toBeVisible();
  await expect(page.getByRole("group", { name: "Applications sent" })).toContainText("2");
  await expect(page.getByRole("group", { name: "Interview rate" })).toContainText("50%");
  // Both sent applications were dated automatically, so they land in this week's bar.
  const weekly = page.getByRole("table", { name: "Applications sent per week" });
  await expect(weekly.getByRole("row").last()).toContainText("2");
});
