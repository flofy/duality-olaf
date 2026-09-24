const STORAGE_KEY = "duality.swipe.v1";
const DEFAULT_SWIPE_ENABLED = true;

export function getSwipeEnabled(): boolean {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === null ? DEFAULT_SWIPE_ENABLED : value === "true";
  } catch {
    return DEFAULT_SWIPE_ENABLED;
  }
}

export function setSwipeEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  } catch {
    /* persist is best-effort */
  }
}

export function toggleSwipeEnabled(): boolean {
  const next = !getSwipeEnabled();
  setSwipeEnabled(next);
  return next;
}
