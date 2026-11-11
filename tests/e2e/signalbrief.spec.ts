import { test, expect } from "@playwright/test";

test.setTimeout(60_000);

test("create an archived briefing, inspect a citation, and download the PDF", async ({ page }) => {
  await page.goto("/briefings/new");
  // Wait for the client bundle to hydrate before interacting with this client component.
  await expect(page.getByText(/Tavily: Not configured/)).toBeVisible();
  await page.getByRole("button", { name: /Microsoft · historical partnership briefing/i }).click();
  await expect(page.locator("input").first()).toHaveValue("Microsoft");
  await expect(page.getByText(/Prepared April 2025 archive example/)).toBeVisible();
  await page.getByRole("button", { name: /Start Autonomous Research/i }).click();

  await expect(page.getByText(/1\. Executive Snapshot/i)).toBeVisible({ timeout: 60_000 });
  await expect(page.getByText(/Microsoft described a more personalized Copilot experience/i)).toBeVisible();

  const citation = page.getByRole("button", { name: /blogs\.microsoft\.com/i }).first();
  await citation.click();
  await expect(page.getByRole("link", { name: /Visit Original Source/i })).toBeVisible();
  await page.getByRole("button", { name: /Close source details/i }).click();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Export Executive PDF/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
});
