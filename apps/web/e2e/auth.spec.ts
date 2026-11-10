import { expect, test } from "@playwright/test";
import { PASSWORD, signUp } from "./helpers";

test("sends signed-out visitors to the sign-in page", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
});

test("signs up, signs out and signs back in", async ({ page }) => {
  const { email } = await signUp(page, "Grace Hopper");
  await expect(page.getByText("Grace Hopper")).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/sign-in$/);

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByText("Grace Hopper")).toBeVisible();
});

test("shows an error for a wrong password", async ({ page }) => {
  const { email } = await signUp(page);
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/sign-in$/);

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page).toHaveURL(/\/sign-in$/);
});
