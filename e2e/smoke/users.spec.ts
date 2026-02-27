import { test, expect } from '@playwright/test'

// Table rows are div-based (VirtualizedRow). The outer wrapper has cursor-pointer classes;
// the inner div.grid holds the React onClick handler. Coordinate-based click() is intercepted
// by the virtual scroll container — use evaluate(el.click()) to dispatch directly on the handler.
const ROW_WRAPPER = 'div.cursor-pointer.transition-colors.border-b'
const ROW_GRID = `${ROW_WRAPPER} div.grid`

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
    expect(await page.locator(ROW_WRAPPER).count()).toBeGreaterThanOrEqual(1)
  })

  test('status filter works', async ({ page }) => {
    await page.goto('/users')
    await page.waitForLoadState('networkidle')
    const statusSelect = page.getByRole('combobox').filter({ hasText: /status/i }).first()
    if (await statusSelect.isVisible()) {
      await statusSelect.selectOption('Active')
      await page.waitForLoadState('networkidle')
      expect(await page.locator(ROW_WRAPPER).count()).toBeGreaterThanOrEqual(1)
    }
  })

  test('clicking user row navigates to detail page', async ({ page }) => {
    await page.goto('/users')
    await page.waitForLoadState('networkidle')
    // Virtual scroll container intercepts coordinate-based clicks — dispatch directly
    // on the div.grid element which holds the React onClick navigation handler
    await page.locator(ROW_GRID).first().evaluate(el => (el as HTMLElement).click())
    await page.waitForURL(/\/users\//)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})
