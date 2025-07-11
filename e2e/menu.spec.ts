// @ts-nocheck
import { test, expect } from '@playwright/test';

test.describe('Menu page', () => {
  test('loads home page and navigates to menu', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Primo's Pizza/);

    await page.click('text=New Menu');
    await expect(page).toHaveURL(/\/menu/);

    // Wait for menu category heading
    await expect(page.locator('text=Appetizers')).toBeVisible();
  });

  test('visual snapshot of menu page', async ({ page }) => {
    await page.goto('/menu');
    await page.waitForSelector('text=Appetizers');
    expect(await page.screenshot({ fullPage: true })).toMatchSnapshot('menu-page.png');
  });
});