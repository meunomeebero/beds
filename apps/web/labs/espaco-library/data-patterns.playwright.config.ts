import { defineConfig } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5287';

export default defineConfig({
  testDir: '.',
  testMatch: 'data-patterns.spec.ts',
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  timeout: 45000,
  use: { baseURL, browserName: 'chromium', locale: 'pt-BR', trace: 'retain-on-failure', screenshot: 'only-on-failure', actionTimeout: 8000 },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true } },
  ],
});
