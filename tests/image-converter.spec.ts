import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

test("convert image to webp", async ({ page }) => {
  await page.goto("/tool/image-converter");
  const fileInput = page.locator('input[type="file"]');
  const base64 = fs.readFileSync(
    path.resolve(__dirname, "assets/test.png.base64"),
    "utf-8"
  );
  await fileInput.setInputFiles({
    name: "test.png",
    mimeType: "image/png",
    buffer: Buffer.from(base64, "base64"),
  });
  await page.selectOption("#format", "webp");
  await page.getByRole("button", { name: "Convert" }).click();
  await expect(page.locator('img[alt="converted"]')).toBeVisible();
});
