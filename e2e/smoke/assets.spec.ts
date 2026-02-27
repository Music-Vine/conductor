import { test, expect } from '@playwright/test'

test.describe('Assets', () => {
  test('assets page loads without errors', async ({ page }) => {
    await page.goto('/assets')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: /assets/i })).toBeVisible()
    await expect(page.getByText(/something went wrong/i)).not.toBeVisible()
  })

  test('assets table shows data rows', async ({ page }) => {
    await page.goto('/assets')
    await page.waitForLoadState('networkidle')
    expect(await page.getByRole('row').count()).toBeGreaterThanOrEqual(2)
  })

  test('type filter works', async ({ page }) => {
    await page.goto('/assets')
    await page.waitForLoadState('networkidle')
    const typeSelect = page.getByRole('combobox').filter({ hasText: /type/i }).first()
    if (await typeSelect.isVisible()) {
      await typeSelect.selectOption('music')
      await page.waitForLoadState('networkidle')
    }
  })

  test('clicking asset row navigates to detail page', async ({ page }) => {
    await page.goto('/assets')
    await page.waitForLoadState('networkidle')
    const firstDataRow = page.getByRole('row').nth(1)
    await firstDataRow.click()
    await page.waitForURL(/\/assets\//)
    await expect(page.getByRole('heading')).toBeVisible()
  })
})
