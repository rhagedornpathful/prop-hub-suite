import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4173';

// Core routes to validate no SPA 404 is rendered (auth routes may redirect)
const routes = [
  '/',
  '/properties',
  '/maintenance',
  '/messages',
  '/tenants',
  '/property-owners',
  '/house-watching',
  '/property-check',
  '/leases',
  '/finances',
  '/documents',
  '/settings',
  '/activity',
  '/user-management',
  '/admin-navigation',
  '/property-manager-dashboard',
  '/client-portal',
  '/client-portal/properties',
  '/client-portal/requests',
  '/client-portal/messages',
  '/client-portal/reports',
];

test.beforeEach(async ({ page }) => {
  // Activate emergency admin to bypass auth in dev
  await page.goto(new URL('/admin-emergency', BASE_URL).toString(), { waitUntil: 'load' });
});

test.describe('Smoke routes', () => {
  for (const route of routes) {
    test(`route ${route} should not render 404`, async ({ page }) => {
      const url = new URL(route, BASE_URL).toString();
      await page.goto(url, { waitUntil: 'load' });

      // Assert no 404 heading rendered by the SPA
      const h1Text = await page.locator('h1').first().textContent().catch(() => '');
      expect(h1Text?.trim().toLowerCase()).not.toBe('404');

      const bodyText = await page.locator('body').textContent();
      expect(bodyText && bodyText.length).toBeTruthy();
    });
  }
});

test('Quick Actions navigation', async ({ page }) => {
  await page.goto(new URL('/', BASE_URL).toString(), { waitUntil: 'load' });

  // Open quick actions (toggle button has aria-label 'Open quick actions')
  const toggle = page.getByRole('button', { name: /quick actions|open quick actions/i });
  await toggle.click();

  // Messages
  await page.getByRole('button', { name: 'Messages' }).click();
  await expect(page).toHaveURL(/\/messages$/);

  // Back home, reopen quick actions
  await page.goto(new URL('/', BASE_URL).toString(), { waitUntil: 'load' });
  await toggle.click();

  // Documents
  await page.getByRole('button', { name: 'Documents' }).click();
  await expect(page).toHaveURL(/\/documents$/);
});
