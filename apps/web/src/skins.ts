import { seasonalEvents, type SeasonalTheme } from '@duality/level-format';

export type LevelSkin = 'default' | SeasonalTheme;
export type SkinPreference = 'auto' | LevelSkin;

const STORAGE_KEY = 'duality.skin.v1';
export const skinOrder: readonly SkinPreference[] = ['auto', 'default', 'halloween', 'christmas'];

function isSkinPreference(value: unknown): value is SkinPreference {
  return typeof value === 'string' && skinOrder.includes(value as SkinPreference);
}

export function getSkinPreference(): SkinPreference {
  try { const value = localStorage.getItem(STORAGE_KEY); return isSkinPreference(value) ? value : 'auto'; }
  catch { return 'auto'; }
}

export function setSkinPreference(preference: SkinPreference): void {
  try { localStorage.setItem(STORAGE_KEY, preference); } catch { /* best effort */ }
}

export function getExplicitLevelSkin(levelId: string): LevelSkin | null {
  const event = seasonalEvents.find((item) => item.levels.some((level) => level.id === levelId));
  return event?.theme ?? null;
}

export function getSeasonalSkin(date = new Date()): LevelSkin {
  const event = seasonalEvents.find((item) => {
    const year = date.getFullYear();
    const start = new Date(year, item.start.month - 1, item.start.day);
    const end = new Date(year + (item.end.month < item.start.month ? 1 : 0), item.end.month - 1, item.end.day, 23, 59, 59, 999);
    if (end.getFullYear() !== year && date < start) {
      return date <= new Date(year, item.end.month - 1, item.end.day, 23, 59, 59, 999);
    }
    return date >= start && date <= end;
  });
  return event?.theme ?? 'default';
}

/**
 * Explicit seasonal levels always keep their contextual skin.
 * For every other level, a user preference can override automatic seasonality.
 */
export function resolveLevelSkin(levelId: string, preference = getSkinPreference(), date = new Date()): LevelSkin {
  const explicit = getExplicitLevelSkin(levelId);
  if (explicit) return explicit;
  if (preference !== 'auto') return preference;
  return getSeasonalSkin(date);
}

export const skinLabels: Record<SkinPreference, string> = {
  auto: 'AUTO',
  default: 'NORMAL',
  halloween: '🎃 HALLOWEEN',
  christmas: '🎄 NOËL',
};
