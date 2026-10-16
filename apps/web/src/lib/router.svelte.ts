/**
 * Mini routeur History API : remplace react-router (navigate, params, redirect).
 * L'état `location` est réactif (rune $state) : tout composant qui le lit se
 * met à jour tout seul lors d'une navigation.
 */
import { isLevelLabEnabled } from "./devFlags";

const rawBase = import.meta.env.BASE_URL;
const basename = rawBase === "./" ? "" : rawBase.replace(/\/$/, "");

function stripBase(pathname: string): string {
  const path =
    basename && pathname.startsWith(basename)
      ? pathname.slice(basename.length)
      : pathname;
  return path === "" ? "/" : path.length > 1 ? path.replace(/\/$/, "") : path;
}

export const location = $state({
  path: stripBase(window.location.pathname),
  search: window.location.search,
});

function sync() {
  location.path = stripBase(window.location.pathname);
  location.search = window.location.search;
}

export function navigate(to: string, options: { replace?: boolean } = {}) {
  const url = basename + to;
  if (options.replace) window.history.replaceState(null, "", url);
  else window.history.pushState(null, "", url);
  sync();
}

window.addEventListener("popstate", sync);

type View =
  | { name: "intro" }
  | { name: "menu" }
  | { name: "help" }
  | { name: "challenge" }
  | { name: "halloween" }
  | { name: "halloween-level"; levelId: string }
  | { name: "world"; worldId: string }
  | { name: "level"; worldId: string; levelId: string }
  | { name: "dev-levels" }
  | { name: "dev-playground"; levelId: string }
  | { name: "dev-generator" }
  | { name: "dev-editor"; levelId: string | null }
  | { name: "redirect"; to: string };

/** Équivalent de la table de routes de createBrowserRouter. */
export function matchRoute(path: string): View {
  if (path === "/") return { name: "intro" };
  if (path === "/menu") return { name: "menu" };
  if (path === "/help") return { name: "help" };
  if (path === "/challenge") return { name: "challenge" };
  if (path === "/halloween") return { name: "halloween" };

  const seasonal = /^\/halloween\/level\/([^/]+)$/.exec(path);
  if (seasonal) return { name: "halloween-level", levelId: seasonal[1]! };

  const world = /^\/world\/([^/]+)$/.exec(path);
  if (world) return { name: "world", worldId: world[1]! };

  const level = /^\/world\/([^/]+)\/level\/([^/]+)$/.exec(path);
  if (level) return { name: "level", worldId: level[1]!, levelId: level[2]! };

  // Outils de dev : inaccessibles sans VITE_ENABLE_LEVEL_LAB=true (comme DevGuard).
  if (path.startsWith("/dev/")) {
    if (!isLevelLabEnabled) return { name: "redirect", to: "/menu" };
    if (path === "/dev/levels") return { name: "dev-levels" };
    if (path === "/dev/generator") return { name: "dev-generator" };
    if (path === "/dev/editor") return { name: "dev-editor", levelId: null };

    const playground = /^\/dev\/levels\/([^/]+)$/.exec(path);
    if (playground) return { name: "dev-playground", levelId: playground[1]! };

    const editor = /^\/dev\/editor\/([^/]+)$/.exec(path);
    if (editor) return { name: "dev-editor", levelId: editor[1]! };
  }

  return { name: "redirect", to: "/" };
}
