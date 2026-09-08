/**
 * Hash-based routing for the dev-level-labs section.
 *
 * URL scheme (hash fragment):
 *   #/dev/levels              → catalogue
 *   #/dev/levels/:levelId     → playground
 *   #/dev/generator            → procedural generator
 */
export type DevRoute =
  | { type: 'catalogue' }
  | { type: 'playground'; levelId: string }
  | { type: 'generator' };

/** Parse a dev hash into a route, or null when it is not a dev route. */
export function getDevRoute(hash: string): DevRoute | null {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  const parts = raw.split('/').filter(Boolean);
  if (parts[0] !== 'dev') return null;
  if (parts[1] === 'generator' && parts.length === 2) return { type: 'generator' };
  if (parts[1] !== 'levels') return null;
  if (parts.length === 2) return { type: 'catalogue' };
  if (parts.length === 3 && parts[2]) return { type: 'playground', levelId: parts[2] };
  return null;
}
