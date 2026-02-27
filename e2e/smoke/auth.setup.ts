import { test as setup, expect } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'

const authFile = path.join('e2e', '.auth', 'staff-user.json')

setup('authenticate', async ({ page }) => {
  // Ensure auth directory exists
  const authDir = path.dirname(authFile)
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true })
  }

  // Navigate to login and confirm the page actually loaded (not a 404 or redirect)
  await page.goto('/login')
  await expect(page.locator('#email')).toBeVisible({ timeout: 15_000 })

  // #email targets the Cadence Input directly by id — getByLabel() can fail when
  // a design-system wrapper breaks the native label↔input association
  await page.locator('#email').fill('admin@musicvine.com')
  await page.getByRole('button', { name: /send magic link/i }).click()

  // After submit, the login form shows a success state with a dev-only debug link.
  // In development mode, the "Click here to sign in" link appears on the page.
  // Click it to complete the magic link flow without needing a real email.
  const debugLink = page.getByRole('link', { name: /click here to sign in/i })
  await expect(debugLink).toBeVisible({ timeout: 10_000 })
  await debugLink.click()

  // Wait for the magic link callback to complete and redirect to dashboard
  // The dashboard lives at the root path '/', not '/dashboard'
  await page.waitForURL('/', { timeout: 15_000 })
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

  // Save authenticated session for all smoke tests
  await page.context().storageState({ path: authFile })
})
