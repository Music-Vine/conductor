import { test, expect } from '@playwright/test'

// Table rows are div-based (VirtualizedRow). The outer wrapper has cursor-pointer classes;
// the inner div.grid holds the React onClick handler. Coordinate-based click() is intercepted
// by the virtual scroll container — use evaluate(el.click()) to dispatch directly on the handler.
const ROW_WRAPPER = 'div.cursor-pointer.transition-colors.border-b'
const ROW_GRID = `${ROW_WRAPPER} div.grid`

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
    expect(await page.locator(ROW_WRAPPER).count()).toBeGreaterThanOrEqual(1)
  })

  test('clicking contributor row navigates to detail page', async ({ page }) => {
    await page.goto('/contributors')
    await page.waitForLoadState('networkidle')
    // Virtual scroll container intercepts coordinate-based clicks — dispatch directly
    // on the div.grid element which holds the React onClick navigation handler
    await page.locator(ROW_GRID).first().evaluate(el => (el as HTMLElement).click())
    await page.waitForURL(/\/contributors\//)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})
