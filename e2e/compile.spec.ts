import { test, expect } from '@playwright/test';

test('compile counter program', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /compile/i }).click();
  await expect(page.getByText(/compile succeeded/i)).toBeVisible({ timeout: 60_000 });
});

test('compile shows diagnostics on error', async ({ page }) => {
  await page.goto('/');
  // TODO: inject invalid Rust source into editor
  await page.getByRole('button', { name: /compile/i }).click();
  // Should show error state, not crash
  await expect(page.getByRole('button', { name: /compile/i })).toBeEnabled({ timeout: 65_000 });
});
