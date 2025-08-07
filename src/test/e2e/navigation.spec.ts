import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('should navigate to main sections when authenticated', async ({ page }) => {
    // Mock authentication state
    await page.addInitScript(() => {
      window.localStorage.setItem('sb-project-auth-token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'test-user', email: 'test@example.com' }
      }))
    })

    await page.goto('/')
    
    // Should see main navigation
    await expect(page.getByText(/dashboard/i)).toBeVisible()
    await expect(page.getByText(/properties/i)).toBeVisible()
    await expect(page.getByText(/maintenance/i)).toBeVisible()
  })

  test('should redirect to auth when not authenticated', async ({ page }) => {
    await page.goto('/properties')
    
    // Should redirect to auth page
    await expect(page).toHaveURL(/\/auth/)
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
  })

  test('should have responsive navigation on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/')
    
    // Should see mobile menu button
    await expect(page.getByRole('button', { name: /menu/i })).toBeVisible()
  })
})