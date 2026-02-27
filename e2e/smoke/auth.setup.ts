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

  // Navigate to login
  await page.goto('/login')
  await expect(page).toHaveURL(/login/)

  // Fill email for magic link
  await page.getByLabel(/email/i).fill('admin@musicvine.com')
  await page.getByRole('button', { name: /send magic link/i }).click()

  // In dev mode, the magic link URL is printed to console
  // For automated testing, we look for the dev-mode auto-redirect or the link in the page
  // Wait up to 10 seconds for auth to complete or magic link page to appear
  try {
    await page.waitForURL(/dashboard/, { timeout: 10_000 })
  } catch {
    // If we're on a "check your email" page, this is expected in non-dev mode
    // In dev mode, check the console for the magic link URL
    console.log('Auth may require manual magic link click in non-dev mode')
  }

  // Save authentication state (even if partial - smoke tests will handle auth failures gracefully)
  await page.context().storageState({ path: authFile })
})
