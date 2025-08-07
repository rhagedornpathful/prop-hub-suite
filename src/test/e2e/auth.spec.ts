import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should navigate to auth page and display sign in form', async ({ page }) => {
    await page.goto('/auth')
    
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('should switch between sign in and sign up forms', async ({ page }) => {
    await page.goto('/auth')
    
    // Start with sign in form
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
    
    // Switch to sign up
    await page.getByText(/don't have an account/i).click()
    await expect(page.getByRole('heading', { name: /sign up/i })).toBeVisible()
    await expect(page.getByLabel(/first name/i)).toBeVisible()
    
    // Switch back to sign in
    await page.getByText(/already have an account/i).click()
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
  })

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/auth')
    
    await page.getByRole('button', { name: /sign in/i }).click()
    
    await expect(page.getByText(/email is required/i)).toBeVisible()
    await expect(page.getByText(/password is required/i)).toBeVisible()
  })

  test('should show password strength indicator in sign up', async ({ page }) => {
    await page.goto('/auth')
    
    // Switch to sign up
    await page.getByText(/don't have an account/i).click()
    
    // Type in password field
    await page.getByLabel(/^password$/i).fill('weak')
    
    // Check for password strength indicator
    await expect(page.locator('[data-testid="password-strength"]')).toBeVisible()
  })
})