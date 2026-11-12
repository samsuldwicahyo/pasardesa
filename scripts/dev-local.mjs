import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const clientDir = resolve(scriptDir, "..");
const dbPath = resolve(clientDir, ".pglite", "data");

let shuttingDown = false;
let currentChild = null;
let server = null;
let db = null;

function getPnpmCommand() {
  return process.platform === "win32" ? "pnpm.cmd" : "pnpm";
}

function runPnpm(args) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(getPnpmCommand(), args, {
      cwd: clientDir,
      stdio: "inherit",
      env: process.env,
    });

    currentChild = child;

    child.on("error", rejectPromise);
    child.on("close", (code) => {
      currentChild = null;

      if (code === 0) {
        resolvePromise();
        return;
      }

      rejectPromise(new Error(`pnpm ${args.join(" ")} exited with code ${code}`));
    });
  });
}

async function cleanup(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  if (currentChild && !currentChild.killed) {
    currentChild.kill("SIGTERM");
  }

  if (server) {
    await server.stop();
  }

  if (db) {
    await db.close();
  }

  process.exit(exitCode);
}

async function main() {
  await mkdir(dbPath, { recursive: true });

  db = new PGlite(dbPath);
  await db.waitReady;

  server = new PGLiteSocketServer({
    db,
    host: "127.0.0.1",
    port: 5432,
    maxConnections: 20,
  });

  process.on("SIGINT", () => void cleanup(0));
  process.on("SIGTERM", () => void cleanup(0));

  await server.start();
  console.log("Local PGlite server is running on 127.0.0.1:5432");

  await runPnpm(["run", "db:setup"]);
  await runPnpm(["run", "dev"]);
  await cleanup(0);
}

main().catch(async (error) => {
  console.error(error);
  await cleanup(1);
});
