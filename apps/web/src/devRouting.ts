/**
 * Hash-based routing for the dev-level-lab section.
 *
 * URL scheme (hash fragment):
 *   #/dev/levels            → catalogue
 *   #/dev/levels/:levelId   → playground
 *   #/dev/generator         → generator
 *   #/dev/editor            → interactive editor (blank level)
 *   #/dev/editor/new        → interactive editor (blank level)
 *   #/dev/editor/:levelId   → interactive editor seeded with an existing level
 */
export type DevRoute =
  | { type: "generator" }
  | { type: "catalogue" }
  | { type: "playground"; levelId: string }
  | { type: "editor"; levelId: string | null };

export function getDevRoute(hash: string): DevRoute | null {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  const parts = raw.split("/").filter(Boolean);

  if (parts[0] === "dev" && parts[1] === "generator" && parts.length === 2) {
    return { type: "generator" };
  }

  if (parts[0] === "dev" && parts[1] === "editor") {
    if (parts.length === 2) return { type: "editor", levelId: null };
    if (parts.length === 3 && parts[2]) {
      return { type: "editor", levelId: parts[2] === "new" ? null : parts[2] };
    }
    return null;
  }

  if (parts[0] !== "dev" || parts[1] !== "levels") return null;
  if (parts.length === 2) return { type: "catalogue" };
  if (parts.length === 3 && parts[2]) {
    return { type: "playground", levelId: parts[2] };
  }
  return null;
}
