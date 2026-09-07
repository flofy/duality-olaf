/**
 * Hash-based routing for the dev-level-labs section.
 *
 * URL scheme (hash fragment):
 *   #/dev/levels            → catalogue (list all levels, no solving)
 *   #/dev/levels/:levelId   → playground (single level + solver + preview)
 *
 * No React Router is used — a single pure function interprets the hash.
 */
export type DevRoute =
  | { type: 'catalogue' }
  | { type: 'playground'; levelId: string };

/**
 * Parse a `window.location.hash` value into a {@link DevRoute} or `null`.
 * Returns `null` when the hash doesn't match the dev-levels scheme.
 */
export function getDevRoute(hash: string): DevRoute | null {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  const parts = raw.split('/').filter(Boolean);
  if (parts[0] !== 'dev' || parts[1] !== 'levels') return null;
  if (parts.length === 2) return { type: 'catalogue' };
  if (parts.length === 3 && parts[2]) return { type: 'playground', levelId: parts[2] };
  return null;
}