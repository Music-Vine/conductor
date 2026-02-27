import { test, expect } from '@playwright/test'

// Collections table uses a simple non-virtualized grid (not VirtualizedRow).
// Rows have class "grid cursor-pointer hover:bg-gray-50 transition-colors" (no border-b).
const ROW_WRAPPER = 'div.grid.cursor-pointer'

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
    expect(await page.locator(ROW_WRAPPER).count()).toBeGreaterThanOrEqual(1)
  })
})
