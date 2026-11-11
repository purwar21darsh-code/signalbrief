import { defineConfig, devices } from "@playwright/test";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";

const baseURL = "http://127.0.0.1:3000";
const workspaceHash = createHash("sha256").update(process.cwd().toLowerCase()).digest("hex").slice(0, 12);
const e2eDatabasePath = join(tmpdir(), `signalbrief-e2e-${workspaceHash}.db`);
const e2eDatabaseUrl = `file:${e2eDatabasePath.replaceAll("\\", "/")}`;

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
    command: "npm run build && npm start -- --hostname 127.0.0.1",
    url: `${baseURL}/api/health`,
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      ...process.env,
      DATABASE_URL: e2eDatabaseUrl,
      FORCE_DEMO_MODE: "false",
      APP_URL: baseURL,
    },
  },
});
