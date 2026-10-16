/**
 * Durée d'un déplacement, partagée par le CSS (variable `--move-duration`) et
 * par le timer JS qui retire l'overlay d'animation (cf. `useLevelGameplay`).
 *
 * La durée du déplacement est indépendante de l'échelle générale des
 * animations : il faut que les longs glissements restent visibles même quand
 * cette préférence réduit les autres animations. Le timer JS utilise la même
 * durée de base, avec une petite marge de sécurité.
 */

/** Durée de base d'un déplacement d'une case (ms). */
const MOVE_BASE_MS = 250;

/** Coût par case supplémentaire (ms) : un long glissement dure plus longtemps. */
const MOVE_MS_PER_CELL = 45;

/** Plafond : même un très long glissement reste lisible (les longs trajets sont
 *  la norme ici : la pièce glisse jusqu'au mur). */
const MOVE_MAX_MS = 500;

const TELEPORT_DEPARTURE_MS = 260;
const TELEPORT_ARRIVAL_DELAY_MS = 220;
const TELEPORT_ARRIVAL_MS = 380;
const DEFAULT_ANIMATION_SCALE = 0.65;

/** Valeurs injectées dans le board et partagées avec les animations CSS. */
export const teleportTiming = {
  departureMs: TELEPORT_DEPARTURE_MS,
  arrivalDelayMs: TELEPORT_ARRIVAL_DELAY_MS,
  arrivalMs: TELEPORT_ARRIVAL_MS,
} as const;

/** Marge ajoutée au timer JS pour ne jamais couper la dernière image CSS. */
const TIMER_SAFETY_MARGIN_MS = 16;

/** Durée de base (indépendante de l'échelle générale des animations). */
export function moveBaseDurationMs(distance: number): number {
  return Math.min(
    MOVE_MAX_MS,
    MOVE_BASE_MS + Math.max(0, distance) * MOVE_MS_PER_CELL,
  );
}

/** Durée réellement jouée par l'animation CSS, marge de sécurité comprise. */
export function moveAnimationDurationMs(distance: number): number {
  return moveBaseDurationMs(distance) + TIMER_SAFETY_MARGIN_MS;
}

/** Échelle d'animation effectivement appliquée par le document. */
function animationScale(): number {
  if (typeof window === "undefined") return DEFAULT_ANIMATION_SCALE;
  const raw = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue("--animation-scale")
    .trim();
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_ANIMATION_SCALE;
}

/** Durée totale de téléportation, de la disparition à l'arrivée glissée. */
export function teleportAnimationDurationMs(): number {
  const animatedEnd = Math.max(
    TELEPORT_DEPARTURE_MS,
    TELEPORT_ARRIVAL_DELAY_MS + TELEPORT_ARRIVAL_MS,
  );
  return animatedEnd * animationScale() + TIMER_SAFETY_MARGIN_MS;
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
