import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:3101";

if (!process.env.DATABASE_URL?.startsWith("postgresql://") && !process.env.DATABASE_URL?.startsWith("postgres://")) {
  throw new Error("Set DATABASE_URL to a migrated PostgreSQL database before running PostgreSQL end-to-end tests.");
}

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: "node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3101",
    url: `${baseURL}/api/health`,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      ...process.env,
      APP_URL: baseURL,
      FORCE_DEMO_MODE: "false",
    },
  },
});
