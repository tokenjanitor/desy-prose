import { defineConfig, devices } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

let firefoxEnvironment: NodeJS.ProcessEnv | undefined;
if (process.platform === 'darwin') {
  // Isolate app-data bookkeeping as well as the temporary test profile.
  const appData = resolve('.cache/firefox-appdata');
  mkdirSync(appData, { recursive: true });
  firefoxEnvironment = { ...process.env, CFFIXED_USER_HOME: appData };
}

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 3,
  reporter: 'list',
  use: { baseURL: process.env.PROSE_TEST_URL || 'http://127.0.0.1:4321', trace: 'retain-on-failure' },
  webServer: process.env.PROSE_TEST_URL ? [] : [{
    command: 'node scripts/serve.ts',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: !process.env.CI,
  }],
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'], launchOptions: firefoxEnvironment ? { env: firefoxEnvironment } : {} } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
