#!/usr/bin/env node
/**
 * Level intake — validates a submitted level JSON and writes it to the
 * matching world directory. Used by .github/workflows/level-intake.yml.
 *
 * Usage:
 *   node .github/scripts/level-intake.mjs <level.json path> <world 1-5> \
 *     [--index N] [--action add|update]
 *
 * Rules:
 * - add: appended after the last existing level (or at --index, world is
 *   then renumbered to keep the play order contiguous).
 * - update: refreshes the file that already holds this level id (or moves
 *   it when --index is given).
 * - structural validation mirrors @duality/level-format's validateLevel.
 */
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const [levelPath, worldArg] = args;
const getOption = (name) => {
  const flag = args.indexOf(name);
  return flag >= 0 ? args[flag + 1] : undefined;
};
const action = getOption("--action") ?? "add";
const indexArg = getOption("--index");

if (!levelPath || !worldArg) {
  console.error(
    "Usage: level-intake.mjs <level.json> <world> [--index N] [--action add|update]",
  );
  process.exit(1);
}

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const worldNumber = Number(worldArg);
const worldDir = path.join(
  repoRoot,
  "packages/level-format/levels",
  `world-0${worldNumber}`,
);

if (
  !Number.isInteger(worldNumber) ||
  worldNumber < 1 ||
  worldNumber > 5 ||
  !fs.existsSync(worldDir)
) {
  console.error(`Unknown world directory: ${worldArg}`);
  process.exit(1);
}

const level = JSON.parse(fs.readFileSync(levelPath, "utf8"));

// ── Structural validation (same rules as @duality/level-format) ──────
const VALID_TILES = new Set(["empty", "wall", "special"]);
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
  ["square", level.square],
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

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(2);
}
// ── World id consistency ─────────────────────────────────────────────
const worldPrefix = `world-${worldNumber}-level-`;
if (!level.id.startsWith(worldPrefix)) {
  console.error(
    `${level.id}: id does not match world ${worldNumber} (expected prefix ${worldPrefix})`,
  );
  process.exit(2);
}

// ── Existing files (sorted = play order) ─────────────────────────────
function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(worldDir, file), "utf8"));
}
const existing = fs
  .readdirSync(worldDir)
  .filter((name) => name.endsWith(".json"))
  .sort()
  .map((name) => ({ name, id: readJson(name).id }));

const existingIndex = existing.findIndex((entry) => entry.id === level.id);
if (action === "update" && existingIndex < 0) {
  console.error(`${level.id}: update requested but no file holds this id`);
  process.exit(2);
}
if (action === "add" && existingIndex >= 0) {
  console.error(
    `${level.id}: id already exists (${existing[existingIndex].name}); use action=update`,
  );
  process.exit(2);
}

const levelCount = existing.length;
const pad = (value) => String(value).padStart(2, "0");

if (indexArg !== undefined) {
  // Insert/move at a specific position: rewrite the whole world directory
  // so numbering stays contiguous (files are re-created in play order).
  const targetIndex = Number(indexArg) - 1;
  if (
    !Number.isInteger(targetIndex) ||
    targetIndex < 0 ||
    targetIndex > levelCount
  ) {
    console.error(`--index must be between 1 and ${levelCount + 1}`);
    process.exit(2);
  }
  const orderedIds = existing.map((entry) => entry.id);
  if (existingIndex >= 0) {
    orderedIds.splice(existingIndex, 1);
  }
  orderedIds.splice(targetIndex, 0, level.id);

  // Read payloads before deleting the files they come from.
  const payloadById = new Map(
    existing.map((entry) => [entry.id, readJson(entry.name)]),
  );
  for (const entry of existing) {
    fs.unlinkSync(path.join(worldDir, entry.name));
  }
  orderedIds.forEach((id, position) => {
    const payload = id === level.id ? level : payloadById.get(id);
    fs.writeFileSync(
      path.join(worldDir, `${pad(position + 1)}-${id}.json`),
      JSON.stringify(payload, null, 2) + "\n",
    );
  });
  console.log(
    `${level.id}: written at position ${targetIndex + 1}/${orderedIds.length} (world renumbered)`,
  );
} else if (action === "add") {
  const position = levelCount + 1;
  fs.writeFileSync(
    path.join(worldDir, `${pad(position)}-${level.id}.json`),
    JSON.stringify(level, null, 2) + "\n",
  );
  console.log(`${level.id}: appended as level ${position}`);
} else {
  const name = existing[existingIndex].name;
  fs.writeFileSync(
    path.join(worldDir, name),
    JSON.stringify(level, null, 2) + "\n",
  );
  console.log(`${level.id}: updated in place (${name})`);
}
