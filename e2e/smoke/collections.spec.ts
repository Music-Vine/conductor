import { test, expect } from '@playwright/test'

test.describe('Collections', () => {
  test('collections page loads without errors', async ({ page }) => {
    await page.goto('/collections')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: /collections/i })).toBeVisible()
    await expect(page.getByText(/something went wrong/i)).not.toBeVisible()
  })

  test('collections table shows data rows', async ({ page }) => {
    await page.goto('/collections')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('row')).toHaveCount({ min: 2 })
  })
})
