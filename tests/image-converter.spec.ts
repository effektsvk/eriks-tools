import { test, expect } from "@playwright/test";
import path from "path";

test("convert image to webp", async ({ page }) => {
  await page.goto("/tool/image-converter");
  const fileInput = page.locator('input[type="file"]');
  const testImage = path.resolve(__dirname, "assets/test.png");
  await fileInput.setInputFiles(testImage);
  await page.selectOption("#format", "webp");
  await page.getByRole("button", { name: "Convert" }).click();
  await expect(page.locator('img[alt="converted"]')).toBeVisible();
});
