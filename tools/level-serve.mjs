#!/usr/bin/env node
/**
 * Level write server — lightweight HTTP endpoint that lets the in-browser
 * level editor push validated levels straight into the local level
 * directories, without browsing the filesystem.
 *
 * Usage:
 *   node tools/level-serve.mjs              # default port 34761
 *   PORT=34762 node tools/level-serve.mjs   # custom port
 *
 * Endpoints:
 *   GET  /api/health      → { ok, port, levelsRoot }
 *   POST /api/save-level  body { level, world } (world 1-5)
 *       → 200 { ok: true, file, message } | 422 { ok: false, errors }
 *
 * Validation mirrors .github/scripts/level-intake.mjs (same rules as
 * @duality/level-format). An existing id is updated in place; a new id is
 * appended after the last level of the target world.
 */
import fs from "node:fs";
import path from "node:path";
import http from "node:http";

const REPO_ROOT = path.resolve(import.meta.dirname, "..");
const LEVELS_ROOT = path.join(REPO_ROOT, "packages/level-format/levels");
const PORT = Number(process.env.PORT ?? 34761);
const VALID_TILES = new Set(["empty", "wall", "special", "spike"]);

/** Same structural rules as level-intake.mjs / @duality/level-format. */
function validateLevel(level, worldNumber) {
  const errors = [];
  const fail = (message) => errors.push(`${level.id ?? "?"}: ${message}`);

  if (typeof level.id !== "string" || !/^world-\d+-level-\d+$/.test(level.id)) {
    fail(`id must match world-<w>-level-<n>, got "${level.id}"`);
  }
  if (!Number.isInteger(level.width) || level.width <= 0) fail("invalid width");
  if (!Number.isInteger(level.height) || level.height <= 0) {
    fail("invalid height");
  }
  if (!Array.isArray(level.tiles) || level.tiles.length !== level.height) {
    fail("tiles rows must match height");
  } else {
    level.tiles.forEach((row, y) => {
      if (!Array.isArray(row) || row.length !== level.width) {
        fail(`row ${y} has wrong column count`);
        return;
      }
      row.forEach((tile) => {
        if (!VALID_TILES.has(tile)) fail(`unknown tile '${tile}' at row ${y}`);
      });
    });
  }

  const positions = [
    ["ball", level.ball],
    ...(level.square ? [["square", level.square]] : []),
    ...(level.stars ?? []).map((star, index) => [`stars[${index}]`, star]),
  ];
  for (const [label, position] of positions) {
    const inside =
      Number.isInteger(position?.x) &&
      Number.isInteger(position?.y) &&
      position.x >= 0 &&
      position.x < level.width &&
      position.y >= 0 &&
      position.y < level.height;
    if (!inside) {
      fail(`${label} ${JSON.stringify(position)} is outside the grid`);
      continue;
    }
    if (level.tiles[position.y][position.x] === "wall") {
      fail(`${label} ${JSON.stringify(position)} sits on a wall`);
    }
  }
  if (!Array.isArray(level.stars) || level.stars.length === 0) {
    fail("stars must be a non-empty array");
  }

  const worldPrefix = `world-${worldNumber}-level-`;
  if (typeof level.id === "string" && !level.id.startsWith(worldPrefix)) {
    fail(
      `id does not match world ${worldNumber} (expected prefix ${worldPrefix})`,
    );
  }
  return errors;
}

// ── Write logic ──────────────────────────────────────────────────────────
function readWorldFiles(worldDir) {
  return fs
    .readdirSync(worldDir)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => ({
      name,
      id: JSON.parse(fs.readFileSync(path.join(worldDir, name), "utf8")).id,
    }));
}

function saveLevel(level, worldNumber) {
  const worldDir = path.join(LEVELS_ROOT, `world-0${worldNumber}`);
  if (
    !Number.isInteger(worldNumber) ||
    worldNumber < 1 ||
    worldNumber > 5 ||
    !fs.existsSync(worldDir)
  ) {
    return { ok: false, errors: [`Unknown world directory: ${worldNumber}`] };
  }

  const errors = validateLevel(level, worldNumber);
  if (errors.length > 0) return { ok: false, errors };

  const existing = readWorldFiles(worldDir);
  const existingIndex = existing.findIndex((entry) => entry.id === level.id);
  const payload = JSON.stringify(level, null, 2) + "\n";

  if (existingIndex >= 0) {
    const name = existing[existingIndex].name;
    fs.writeFileSync(path.join(worldDir, name), payload);
    return {
      ok: true,
      file: `packages/level-format/levels/world-0${worldNumber}/${name}`,
      message: `${level.id}: updated in place (${name})`,
    };
  }

  // File name follows the existing convention: `<level.id>.json`. Lexicographic
  // order then matches play order thanks to the zero-padded id.
  const name = `${level.id}.json`;
  fs.writeFileSync(path.join(worldDir, name), payload);
  return {
    ok: true,
    file: `packages/level-format/levels/world-0${worldNumber}/${name}`,
    message: `${level.id}: appended as level ${existing.length + 1}`,
  };
}

// ── HTTP layer ───────────────────────────────────────────────────────────
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const respond = (res, status, body) => {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    ...CORS,
  });
  res.end(JSON.stringify(body));
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, CORS);
    res.end();
    return;
  }

  try {
    if (req.url === "/api/health" && req.method === "GET") {
      respond(res, 200, { ok: true, port: PORT, levelsRoot: LEVELS_ROOT });
      return;
    }

    if (req.url === "/api/save-level" && req.method === "POST") {
      let payload;
      try {
        payload = JSON.parse(await readBody(req));
      } catch {
        respond(res, 400, {
          ok: false,
          errors: ["request body must be valid JSON"],
        });
        return;
      }
      const { level, world } = payload ?? {};
      if (!level || typeof level !== "object") {
        respond(res, 400, {
          ok: false,
          errors: ["missing or invalid 'level'"],
        });
        return;
      }
      const worldNumber = Number(world);
      if (
        !Number.isInteger(worldNumber) ||
        worldNumber < 1 ||
        worldNumber > 5
      ) {
        respond(res, 400, {
          ok: false,
          errors: ["'world' must be an integer 1-5"],
        });
        return;
      }
      const result = saveLevel(level, worldNumber);
      respond(res, result.ok ? 200 : 422, result);
      return;
    }

    respond(res, 404, { ok: false, errors: ["unknown endpoint"] });
  } catch (err) {
    respond(res, 500, { ok: false, errors: [`server error: ${String(err)}`] });
  }
});

if (!fs.existsSync(LEVELS_ROOT)) {
  console.error(`Levels directory not found: ${LEVELS_ROOT}`);
  console.error("Run this script from the repository root.");
  process.exit(1);
}

server.listen(PORT, () => {
  console.log("Duality level write server");
  console.log(`  health : http://localhost:${PORT}/api/health`);
  console.log(`  save   : POST http://localhost:${PORT}/api/save-level`);
  console.log(`  writes : ${LEVELS_ROOT}`);
  console.log("  Ctrl+C to stop");
});

const shutdown = (signal) => {
  console.log(`\n${signal} received — shutting down…`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 2000).unref();
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
