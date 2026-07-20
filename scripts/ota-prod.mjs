#!/usr/bin/env node
/**
 * Guarded production OTA publisher.
 *
 * Prevents the "app talks to DEV after a prod OTA" trap caused by Metro's
 * transform cache inlining a stale EXPO_PUBLIC_CONVEX_URL (see
 * .github / memory: ota-and-deploy "DEV/PROD env trap").
 *
 * What it does:
 *   1. Forces .env.local to the PROD Convex URLs (backs up the original).
 *   2. Wipes Expo/Metro caches so env values are re-inlined fresh.
 *   3. Runs `eas update --clear-cache` for the chosen platform.
 *   4. Scans the exported Hermes bundle and ABORTS if the DEV deployment
 *      string is present (or the PROD one is missing).
 *   5. Restores the original .env.local.
 *
 * Usage:
 *   node scripts/ota-prod.mjs --platform ios --message "My message"
 *   npm run ota:prod -- --platform ios --message "My message"
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const PROD = "canny-bobcat-846";
const DEV = "giddy-sandpiper-781";
const ENV_FILE = ".env.local";
const BACKUP_FILE = ".env.local.ota-backup";

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const platform = arg("platform", "ios");
const message = arg("message", `Prod OTA ${new Date().toISOString()}`);

function log(msg) {
  console.log(`\n\x1b[36m[ota-prod]\x1b[0m ${msg}`);
}
function fail(msg) {
  console.error(`\n\x1b[31m[ota-prod] ABORT:\x1b[0m ${msg}\n`);
  // restore() is a hoisted function declaration; ensure .env.local is restored
  // even on abort (process.exit skips finally blocks).
  try { restore(); } catch { /* ignore */ }
  process.exit(1);
}

// 1. Force PROD URLs in .env.local
if (!fs.existsSync(ENV_FILE)) fail(`${ENV_FILE} not found`);
const original = fs.readFileSync(ENV_FILE, "utf-8");
fs.writeFileSync(BACKUP_FILE, original);
const prodEnv = original
  .replace(new RegExp(DEV, "g"), PROD)
  .replace(/dev:canny-bobcat-846/g, "prod:canny-bobcat-846");
fs.writeFileSync(ENV_FILE, prodEnv);
log(`Forced ${ENV_FILE} to PROD (${PROD}). Backup: ${BACKUP_FILE}`);

function restore() {
  if (fs.existsSync(BACKUP_FILE)) {
    fs.writeFileSync(ENV_FILE, fs.readFileSync(BACKUP_FILE, "utf-8"));
    fs.rmSync(BACKUP_FILE, { force: true });
    log(`Restored original ${ENV_FILE}`);
  }
}

try {
  // 2. Wipe ALL caches that can hold a stale inlined env value.
  //    This MUST run every time — the whole point of the trap is a stale cache.
  log("Clearing Expo/Metro/Babel caches (every run)...");
  const projDirs = [
    ".expo",
    "dist",
    path.join("node_modules", ".cache"),
    path.join("node_modules", ".cache", "metro"),
    path.join("node_modules", ".cache", "babel-loader"),
  ];
  for (const dir of projDirs) {
    fs.rmSync(path.join(process.cwd(), dir), { recursive: true, force: true });
  }
  // OS temp Metro/Haste caches (metro-cache, metro-symbolicate, haste-map-*)
  const tmp = os.tmpdir();
  try {
    for (const entry of fs.readdirSync(tmp)) {
      if (/^(metro|haste|react-native)/i.test(entry)) {
        fs.rmSync(path.join(tmp, entry), { recursive: true, force: true });
      }
    }
  } catch {
    /* temp dir not readable — non-fatal */
  }
  log("Caches cleared.");

  // 3. Publish OTA. Triple cache-bust: wiped dirs above + EXPO_NO_CACHE + --clear-cache.
  //    eas update also performs the export into dist/.
  //    --environment production avoids the interactive "Select environment"
  //    prompt added in newer EAS CLI (otherwise the run is cancelled, exit 130).
  log(`Publishing OTA → branch=production platform=${platform}`);
  execSync(
    `eas update --branch production --environment production --platform ${platform} --clear-cache --non-interactive --message ${JSON.stringify(message)}`,
    { stdio: "inherit", env: { ...process.env, EXPO_NO_CACHE: "1" } }
  );

  // 4. Verify the exported bundle
  const platDirs = platform === "all" ? ["ios", "android"] : [platform];
  for (const p of platDirs) {
    const jsDir = path.join("dist", "_expo", "static", "js", p);
    if (!fs.existsSync(jsDir)) fail(`No exported bundle dir for ${p} (${jsDir})`);
    const bundles = fs.readdirSync(jsDir).filter((f) => f.endsWith(".hbc") || f.endsWith(".js"));
    if (bundles.length === 0) fail(`No bundle file found in ${jsDir}`);
    for (const b of bundles) {
      const content = fs.readFileSync(path.join(jsDir, b), "utf-8");
      // Match the actual URL form (a real leak), not bare mentions of the name,
      // so guard/diagnostic code that references the name as a non-URL string
      // does not false-positive.
      const devUrlRe = new RegExp(`${DEV}\\.convex\\.(cloud|site)`, "g");
      const prodUrlRe = new RegExp(`${PROD}\\.convex\\.(cloud|site)`, "g");
      const devCount = (content.match(devUrlRe) || []).length;
      const prodCount = (content.match(prodUrlRe) || []).length;
      log(`[${p}/${b}] PROD(${PROD})=${prodCount}  DEV(${DEV})=${devCount}`);
      if (devCount > 0) fail(`DEV Convex URL leaked into ${p} bundle! The app would talk to dev. Cache was not clean.`);
      if (prodCount === 0) fail(`PROD Convex URL missing from ${p} bundle! Check .env.local.`);
    }
  }

  log("\x1b[32m✅ Verified: bundle points to PROD only. OTA published successfully.\x1b[0m");
} finally {
  restore();
}
