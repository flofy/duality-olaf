/** User preference controlling the speed of gameplay/UI animations. */
export type AnimationSpeed = "fast" | "normal" | "slow";

const STORAGE_KEY = "duality.animation-speed.v1";
export const DEFAULT_ANIMATION_SPEED: AnimationSpeed = "fast";

export const animationSpeedLabels: Record<AnimationSpeed, string> = {
  fast: "Rapide",
  normal: "Normale",
  slow: "Lente",
};

const animationSpeedOrder: readonly AnimationSpeed[] = ["fast", "normal", "slow"];

export const animationSpeedMultipliers: Record<AnimationSpeed, number> = {
  fast: 0.65,
  normal: 1,
  slow: 1.5,
};

function isAnimationSpeed(value: unknown): value is AnimationSpeed {
  return typeof value === "string" && animationSpeedOrder.includes(value as AnimationSpeed);
}

export function getAnimationSpeed(): AnimationSpeed {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return isAnimationSpeed(value) ? value : DEFAULT_ANIMATION_SPEED;
  } catch {
    return DEFAULT_ANIMATION_SPEED;
  }
}

export function setAnimationSpeed(speed: AnimationSpeed): void {
  try {
    localStorage.setItem(STORAGE_KEY, speed);
  } catch {
    /* persistence is best-effort */
  }
}

export function cycleAnimationSpeed(): AnimationSpeed {
  const current = getAnimationSpeed();
  const index = animationSpeedOrder.indexOf(current);
  const next = animationSpeedOrder[(index + 1) % animationSpeedOrder.length];
  setAnimationSpeed(next);
  return next;
}

export function getAnimationDuration(baseMs: number, speed = getAnimationSpeed()): number {
  return Math.round(baseMs * animationSpeedMultipliers[speed]);
}

export function syncAnimationSpeed(speed = getAnimationSpeed()): void {
  document.documentElement.style.setProperty(
    "--animation-scale",
    String(animationSpeedMultipliers[speed]),
  );
}
