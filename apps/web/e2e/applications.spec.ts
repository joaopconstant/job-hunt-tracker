import { expect, test } from "@playwright/test";
import { signUp } from "./helpers";

// Runs against the full stack (web + api + db), e.g. `docker compose up`.
test("adds an application and moves it through the pipeline", async ({ page }) => {
  const company = `Acme ${Date.now()}`;

  await signUp(page);

  await page.getByLabel("Company").fill(company);
  await page.getByLabel("Role").fill("Full Stack Developer");
  await page.getByLabel("Location").fill("Remote");
  await page.getByRole("button", { name: "Add application" }).click();

  const card = page.getByRole("article", { name: `Full Stack Developer at ${company}` });
  const wishlist = page.getByRole("region", { name: /wishlist/i });
  await expect(wishlist.getByRole("article", { name: `Full Stack Developer at ${company}` })).toBeVisible();

  await card.getByLabel("Status").selectOption("INTERVIEW");
  await card.getByRole("button", { name: "Move" }).click();

  const interview = page.getByRole("region", { name: /interview/i });
  await expect(interview.getByRole("article", { name: `Full Stack Developer at ${company}` })).toBeVisible();

  await interview
    .getByRole("article", { name: `Full Stack Developer at ${company}` })
    .getByRole("button", { name: "Delete" })
    .click();
  await expect(page.getByRole("article", { name: `Full Stack Developer at ${company}` })).toHaveCount(0);
});
