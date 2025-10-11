import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Critical User Flows
 * Tests the most important user journeys to ensure core functionality works
 */

test.describe('Critical User Flows', () => {
  
  test.describe('Authentication Flow', () => {
    test('should allow user to sign in', async ({ page }) => {
      await page.goto('/');
      
      // Should redirect to auth if not logged in
      await expect(page).toHaveURL(/.*auth/);
      
      // Fill in login form
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'testpassword123');
      await page.click('button[type="submit"]');
      
      // Should redirect to dashboard after login
      await expect(page).toHaveURL(/.*dashboard|properties/);
    });

    test('should handle login errors gracefully', async ({ page }) => {
      await page.goto('/auth');
      
      await page.fill('input[type="email"]', 'invalid@example.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      
      // Should show error message
      await expect(page.locator('text=/error|invalid/i')).toBeVisible();
    });
  });

  test.describe('Property Management Flow', () => {
    test.beforeEach(async ({ page }) => {
      // Login before each test
      await page.goto('/auth');
      await page.fill('input[type="email"]', 'admin@example.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL(/.*dashboard|properties/);
    });

    test('should display properties list', async ({ page }) => {
      await page.goto('/properties');
      
      // Should load properties
      await expect(page.locator('[data-testid="property-card"]').first()).toBeVisible({ timeout: 10000 });
    });

    test('should create new property', async ({ page }) => {
      await page.goto('/properties');
      
      // Click add property button
      await page.click('button:has-text("Add Property")');
      
      // Fill in property form
      await page.fill('input[name="address"]', '123 Test Street');
      await page.fill('input[name="city"]', 'Test City');
      await page.fill('input[name="state"]', 'TS');
      await page.fill('input[name="zip_code"]', '12345');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Should show success message
      await expect(page.locator('text=/success|created/i')).toBeVisible({ timeout: 5000 });
    });

    test('should view property details', async ({ page }) => {
      await page.goto('/properties');
      
      // Click on first property
      await page.locator('[data-testid="property-card"]').first().click();
      
      // Should open property details
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('text=/address|location/i')).toBeVisible();
    });

    test('should search and filter properties', async ({ page }) => {
      await page.goto('/properties');
      
      // Use search
      await page.fill('input[placeholder*="Search"]', 'Test');
      
      // Should filter results
      await page.waitForTimeout(500); // Debounce
      const propertyCards = page.locator('[data-testid="property-card"]');
      await expect(propertyCards.first()).toBeVisible();
    });
  });

  test.describe('Maintenance Request Flow', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth');
      await page.fill('input[type="email"]', 'manager@example.com');
      await page.fill('input[type="password"]', 'manager123');
      await page.click('button[type="submit"]');
      await page.waitForURL(/.*dashboard/);
    });

    test('should create maintenance request', async ({ page }) => {
      await page.goto('/maintenance');
      
      // Click create request
      await page.click('button:has-text("Create Request")');
      
      // Fill in maintenance form
      await page.fill('input[name="title"]', 'Leaky Faucet');
      await page.fill('textarea[name="description"]', 'Kitchen faucet is leaking');
      await page.selectOption('select[name="priority"]', 'high');
      
      // Submit
      await page.click('button[type="submit"]');
      
      // Should show in list
      await expect(page.locator('text=Leaky Faucet')).toBeVisible();
    });

    test('should update maintenance request status', async ({ page }) => {
      await page.goto('/maintenance');
      
      // Click on first request
      await page.locator('[data-testid="maintenance-request"]').first().click();
      
      // Change status
      await page.selectOption('select[name="status"]', 'in_progress');
      await page.click('button:has-text("Save")');
      
      // Should show success
      await expect(page.locator('text=/updated|success/i')).toBeVisible();
    });
  });

  test.describe('House Watching Flow', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth');
      await page.fill('input[type="email"]', 'watcher@example.com');
      await page.fill('input[type="password"]', 'watcher123');
      await page.click('button[type="submit"]');
      await page.waitForURL(/.*dashboard/);
    });

    test('should start home check session', async ({ page }) => {
      await page.goto('/house-watching');
      
      // Click on property
      await page.locator('[data-testid="house-watching-property"]').first().click();
      
      // Start check
      await page.click('button:has-text("Start Check")');
      
      // Should navigate to check session
      await expect(page).toHaveURL(/.*home-check/);
    });
  });

  test.describe('Financial Reports Flow', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth');
      await page.fill('input[type="email"]', 'owner@example.com');
      await page.fill('input[type="password"]', 'owner123');
      await page.click('button[type="submit"]');
      await page.waitForURL(/.*dashboard/);
    });

    test('should display financial dashboard', async ({ page }) => {
      await page.goto('/finances');
      
      // Should show financial metrics
      await expect(page.locator('text=/revenue|income|expense/i')).toBeVisible();
      await expect(page.locator('[data-testid="financial-chart"]')).toBeVisible();
    });

    test('should generate owner statement', async ({ page }) => {
      await page.goto('/finances');
      
      // Click generate statement
      await page.click('button:has-text("Generate Statement")');
      
      // Should show statement or download
      await expect(page.locator('text=/statement|generated/i')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Performance & Accessibility', () => {
    test('should load pages within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/properties');
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should be keyboard navigable', async ({ page }) => {
      await page.goto('/properties');
      
      // Tab through interactive elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should focus on interactive elements
      const focusedElement = await page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });
  });
});
