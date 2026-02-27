import { test, expect } from '@playwright/test'

test.describe('Contributors', () => {
  test('contributors page loads without errors', async ({ page }) => {
    await page.goto('/contributors')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: /contributors/i })).toBeVisible()
    await expect(page.getByText(/something went wrong/i)).not.toBeVisible()
  })

  test('contributors table shows data rows', async ({ page }) => {
    await page.goto('/contributors')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('row')).toHaveCount({ min: 2 })
  })

  test('clicking contributor row navigates to detail page', async ({ page }) => {
    await page.goto('/contributors')
    await page.waitForLoadState('networkidle')
    const firstDataRow = page.getByRole('row').nth(1)
    await firstDataRow.click()
    await page.waitForURL(/\/contributors\//)
    await expect(page.getByRole('heading')).toBeVisible()
  })
})
