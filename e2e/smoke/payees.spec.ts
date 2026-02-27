import { test, expect } from '@playwright/test'

test.describe('Payees', () => {
  test('payees page loads without errors', async ({ page }) => {
    await page.goto('/payees')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: /payees/i })).toBeVisible()
    await expect(page.getByText(/something went wrong/i)).not.toBeVisible()
  })

  test('payees table shows data rows', async ({ page }) => {
    await page.goto('/payees')
    await page.waitForLoadState('networkidle')
    expect(await page.getByRole('row').count()).toBeGreaterThanOrEqual(2)
  })

  test('clicking payee row navigates to detail page', async ({ page }) => {
    await page.goto('/payees')
    await page.waitForLoadState('networkidle')
    const firstDataRow = page.getByRole('row').nth(1)
    await firstDataRow.click()
    await page.waitForURL(/\/payees\//)
    await expect(page.getByRole('heading')).toBeVisible()
  })
})
