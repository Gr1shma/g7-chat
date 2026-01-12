import { test, expect } from '@playwright/test';

test('should redirect to auth page when not logged in', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/auth/);
    await expect(page.locator('h1')).toContainText(/Welcome to G7 Chat/i);
});
