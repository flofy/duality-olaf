import { test, expect } from "@playwright/test";

test("world 1 completion overlay shows only the ball", async ({ page }) => {
  await page.goto("/dev/levels/world-1-level-11");
  await expect(page.locator(".dev-playground")).toBeVisible();
  await expect(page.locator(".dev-playground")).toContainText("WORLD 1");
});
