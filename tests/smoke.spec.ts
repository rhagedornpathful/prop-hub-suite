import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4173';

// Core routes to validate no SPA 404 is rendered (auth routes may redirect)
const routes = [
  '/',
  '/auth',
  '/setup',
  '/admin-emergency',
  // App core
  '/properties',
  '/maintenance',
  '/messages',
  '/tenants',
  '/documents',
  '/settings',
  '/activity',
  '/user-management',
  '/admin-navigation',
  // Client portal
  '/client-portal',
  '/client-portal/properties',
  '/client-portal/requests',
  '/client-portal/messages',
  '/client-portal/reports',
];

test.describe('Smoke routes', () => {
  for (const route of routes) {
    test(`route ${route} should not render 404`, async ({ page }) => {
      const url = new URL(route, BASE_URL).toString();
      await page.goto(url, { waitUntil: 'load' });

      // Assert no 404 heading rendered by the SPA
      const h1Text = await page.locator('h1').first().textContent().catch(() => '');
      expect(h1Text?.trim().toLowerCase()).not.toBe('404');

      // Basic sanity: page has some content
      const bodyText = await page.locator('body').textContent();
      expect(bodyText && bodyText.length).toBeTruthy();
    });
  }
});
