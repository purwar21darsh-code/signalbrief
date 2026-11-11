import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    include: ["src/__tests__/**/*.test.{ts,tsx}"],
    exclude: ["tests/e2e/**"],
    environment: "node",
    globals: true,
    alias: {
      "@": resolve(rootDir, "./src"),
    },
  },
});
