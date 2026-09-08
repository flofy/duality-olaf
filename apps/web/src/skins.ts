import { isSeasonalEventAvailable, seasonalEvents, type SeasonalTheme } from '@duality/level-format';

export type LevelSkin = 'default' | SeasonalTheme;
export type SkinPreference = 'auto' | LevelSkin;

const STORAGE_KEY = 'duality.skin.v1';
export const skinOrder: readonly SkinPreference[] = ['auto', 'default', 'halloween', 'christmas'];

function isSkinPreference(value: unknown): value is SkinPreference {
  return typeof value === 'string' && skinOrder.includes(value as SkinPreference);
}

export function getSkinPreference(): SkinPreference {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return isSkinPreference(value) ? value : 'auto';
  } catch {
    return 'auto';
  }
}

export function setSkinPreference(preference: SkinPreference): void {
  try { localStorage.setItem(STORAGE_KEY, preference); } catch { /* best effort */ }
}

/** Seasonal overrides are only selectable while their event is active. */
export function isSkinAvailable(skin: LevelSkin, date = new Date()): boolean {
  if (skin === 'default') return true;
  const event = seasonalEvents.find((item) => item.theme === skin);
  return event ? isSeasonalEventAvailable(event, date) : false;
}

/** Preferences exposed to end users at this moment. */
export function getAvailableSkinPreferences(date = new Date()): readonly SkinPreference[] {
  return skinOrder.filter((preference) => preference === 'auto' || isSkinAvailable(preference, date));
}

/** A persisted seasonal override must not survive outside its active window. */
export function normalizeSkinPreference(preference: SkinPreference, date = new Date()): SkinPreference {
  return preference === 'auto' || isSkinAvailable(preference, date) ? preference : 'auto';
}

export function getExplicitLevelSkin(levelId: string): LevelSkin | null {
  const event = seasonalEvents.find((item) => item.levels.some((level) => level.id === levelId));
  return event?.theme ?? null;
}

export function getSeasonalSkin(date = new Date()): LevelSkin {
  const event = seasonalEvents.find((item) => isSeasonalEventAvailable(item, date));
  return event?.theme ?? 'default';
}

/**
 * Explicit seasonal levels always keep their contextual skin.
 * For every other level, AUTO follows the seasonal calendar and an explicit
 * user preference can override it while that seasonal skin is available.
 */
export function resolveLevelSkin(levelId: string, preference = getSkinPreference(), date = new Date()): LevelSkin {
  const explicit = getExplicitLevelSkin(levelId);
  if (explicit) return explicit;
  const normalized = normalizeSkinPreference(preference, date);
  if (normalized !== 'auto') return normalized;
  return getSeasonalSkin(date);
}

export const skinLabels: Record<SkinPreference, string> = {
  auto: 'AUTO',
  default: 'NORMAL',
  halloween: '🎃 HALLOWEEN',
  christmas: '🎄 NOËL',
};
