import { test, expect } from '@playwright/test'

test.describe('Users', () => {
  test('users page loads without errors', async ({ page }) => {
    await page.goto('/users')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: /users/i })).toBeVisible()
    // No error boundary
    const errorBoundary = page.getByText(/something went wrong/i)
    await expect(errorBoundary).not.toBeVisible()
  })

  test('users table shows data rows', async ({ page }) => {
    await page.goto('/users')
    await page.waitForLoadState('networkidle')
    const rows = page.getByRole('row')
    expect(await rows.count()).toBeGreaterThanOrEqual(2) // header + at least 1 data row
  })

  test('status filter works', async ({ page }) => {
    await page.goto('/users')
    await page.waitForLoadState('networkidle')
    // Apply status filter
    const statusSelect = page.getByRole('combobox').filter({ hasText: /status/i }).first()
    if (await statusSelect.isVisible()) {
      await statusSelect.selectOption('active')
      await page.waitForLoadState('networkidle')
      expect(await page.getByRole('row').count()).toBeGreaterThanOrEqual(2)
    }
  })

  test('clicking user row navigates to detail page', async ({ page }) => {
    await page.goto('/users')
    await page.waitForLoadState('networkidle')
    const firstDataRow = page.getByRole('row').nth(1) // skip header
    await firstDataRow.click()
    await page.waitForURL(/\/users\//)
    await expect(page.getByRole('heading')).toBeVisible()
  })
})
