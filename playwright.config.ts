import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests against the production web build (`npx expo export -p web` → dist/), in a
 * desktop and a phone-sized browser. Locally they use the Edge that ships with Windows; in CI,
 * Playwright's own Chromium.
 */
const PORT = 3030;
const channel = process.env.CI ? undefined : 'msedge';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: 'es-ES',
    timezoneId: 'Europe/Madrid',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'escritorio', use: { ...devices['Desktop Chrome'], channel } },
    { name: 'movil', use: { ...devices['Pixel 7'], channel } },
  ],
  webServer: {
    command: `npx serve dist -l ${PORT} --no-clipboard`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
