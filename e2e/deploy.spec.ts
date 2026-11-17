import { test, expect } from '@playwright/test';

test('deploy counter program to devnet', async ({ page }) => {
  await page.goto('/');
  // Connect a test wallet — wallet injection helper to be added in Phase 2
  await page.getByRole('button', { name: /compile/i }).click();
  await expect(page.getByText(/compile succeeded/i)).toBeVisible({ timeout: 60_000 });
  await page.getByRole('button', { name: /deploy/i }).click();
  await expect(page.getByText(/deployed successfully/i)).toBeVisible({ timeout: 120_000 });
});
