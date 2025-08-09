import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4173';

// Core routes to validate no 404 is served (auth-protected routes may redirect to /auth)
const routes = [
  '/',
  '/auth',
  '/setup',
  '/admin-emergency',
  '/client-portal/reports',
  '/client-portal',
  '/documents',
];

test.describe('Smoke routes', () => {
  for (const route of routes) {
    test(`route ${route} should not render 404`, async ({ page }) => {
      const url = new URL(route, BASE_URL).toString();
      await page.goto(url, { waitUntil: 'load' });

      // Assert no 404 heading rendered
      const h1Text = await page.locator('h1').first().textContent().catch(() => '');
      expect(h1Text?.toLowerCase()).not.toBe('404');

      // Basic sanity: page has some content
      const bodyText = await page.locator('body').textContent();
      expect(bodyText && bodyText.length).toBeTruthy();
    });
  }
});
