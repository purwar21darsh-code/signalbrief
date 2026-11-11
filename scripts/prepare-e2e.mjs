import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";

const workspaceHash = createHash("sha256").update(process.cwd().toLowerCase()).digest("hex").slice(0, 12);
const databasePath = join(tmpdir(), `signalbrief-e2e-${workspaceHash}.db`);
// Prisma's SQLite schema engine expects an absolute test database file to exist first on Windows.
writeFileSync(databasePath, Buffer.alloc(0), { flag: "a" });
const databaseUrl = `file:${databasePath.replaceAll("\\", "/")}`;
const env = { ...process.env, DATABASE_URL: databaseUrl };
const prismaCli = join(process.cwd(), "node_modules", "prisma", "build", "index.js");
for (const args of [
  ["generate", "--schema=prisma/schema.prisma"],
  ["db", "push", "--schema=prisma/schema.prisma"],
]) {
  const result = spawnSync(process.execPath, [prismaCli, ...args], { stdio: "inherit", env });
  if (result.status !== 0) process.exit(result.status || 1);
}
