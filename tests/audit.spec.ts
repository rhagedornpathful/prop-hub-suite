import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4173';

// Routes sourced from src/components/LazyRoutes.tsx (static paths only)
const routes = [
  '/',
  '/properties',
  '/maintenance',
  '/messages',
  '/tenants',
  '/property-owners',
  '/house-watching',
  '/property-check',
  '/home-check',
  '/activity',
  '/auth',
  '/setup',
  '/user-management',
  '/settings',
  '/finances',
  '/property-manager',
  '/dev-tools',
  '/documents',
  '/leases',
  '/resident-portal',
  '/admin-navigation',
  // Dashboards
  '/dashboard/admin',
  '/dashboard/property-manager',
  '/dashboard/property-owner',
  '/dashboard/tenant',
  '/dashboard/house-watcher',
  // Client portal
  '/client',
  '/client/properties',
  '/client/requests',
  '/client/messages',
  '/client/reports',
] as const;

// Enable emergency admin bypass before each test
test.beforeEach(async ({ page }) => {
  await page.goto(new URL('/admin-emergency', BASE_URL).toString(), { waitUntil: 'load' });
});

// Helper to assert that a page did not render the SPA 404
async function expectNo404(page: import('@playwright/test').Page) {
  const h1Text = await page.locator('h1').first().textContent().catch(() => '');
  expect(h1Text?.trim().toLowerCase()).not.toBe('404');
  const bodyText = await page.locator('body').textContent();
  expect(bodyText && bodyText.length).toBeTruthy();
}

// 1) Route audit: every declared route should render without SPA 404
test('Route audit: all static routes render', async ({ page }) => {
  for (const route of routes) {
    const url = new URL(route, BASE_URL).toString();
    await page.goto(url, { waitUntil: 'load' });
    await expectNo404(page);
  }
});

// 2) Link crawl audit: traverse internal links found on each page and ensure they don't 404
//    This helps catch broken or outdated links without manual clicking
test('Link audit: internal links discovered on pages should not 404', async ({ page }) => {
  const maxLinksPerPage = 25;

  for (const route of routes) {
    const startUrl = new URL(route, BASE_URL).toString();
    await page.goto(startUrl, { waitUntil: 'load' });
    await expectNo404(page);

    // Collect internal links from current page
    const hrefs = await page.$$eval('a[href^="/"]', (els) =>
      Array.from(new Set(
        els
          .map((el) => (el as HTMLAnchorElement).getAttribute('href') || '')
          .filter((h) => !!h && h.startsWith('/') && !h.startsWith('//') && !h.includes('#'))
      ))
    );

    // Limit and avoid re-testing the same route
    const uniqueTargets = hrefs
      .filter((h) => h !== route)
      .slice(0, maxLinksPerPage);

    for (const href of uniqueTargets) {
      const targetUrl = new URL(href, BASE_URL).toString();
      await page.goto(targetUrl, { waitUntil: 'load' });
      await expectNo404(page);
    }
  }
});
