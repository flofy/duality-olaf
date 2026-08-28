/**
 * Design system: a small set of semantic colors drawn from a palette instead
 * of being hard-coded across the scenes. Adding a new ambiance is just a
 * matter of registering a Theme below and switching the active one.
 */

export type ThemeName = 'retro' | 'sunset' | 'ocean';

/** Semantic colors in Phaser numerical hex (0xRRGGBB). */
export interface Theme {
  name: string;
  background: number;
  board: number;
  gridLine: number;
  wall: number;
  ball: number;
  square: number;
  star: number;
  text: number;
  textMuted: number;
  accent: number;
  buttonText: number;
  buttonTextLocked: number;
  buttonBg: number;
  buttonCompletedBg: number;
  buttonLockedBg: number;
  nextText: number;
  nextBg: number;
}

export const themes: Record<ThemeName, Theme> = {
  // Default: the original dark-blue/amber retro look.
  retro: {
    name: 'Rétro',
    background: 0x0b1020,
    board: 0x111a2d,
    gridLine: 0x26324a,
    wall: 0x65718a,
    ball: 0x4aa3ff,
    square: 0xffd447,
    star: 0xfff2a1,
    text: 0xffffff,
    textMuted: 0x8995ad,
    accent: 0x4aa3ff,
    buttonText: 0xffffff,
    buttonTextLocked: 0x46516a,
    buttonBg: 0x1b2942,
    buttonCompletedBg: 0x25452f,
    buttonLockedBg: 0x101728,
    nextText: 0xfff2a1,
    nextBg: 0x1b2942,
  },
  // Warm amber/rose mood.
  sunset: {
    name: 'Crépuscule',
    background: 0x180f21,
    board: 0x241a2b,
    gridLine: 0x3b2e40,
    wall: 0x7c6a74,
    ball: 0xff8a5c,
    square: 0xffc17a,
    star: 0xffe3a1,
    text: 0xfdf1e6,
    textMuted: 0xb7a09b,
    accent: 0xffae6e,
    buttonText: 0xfdf1e6,
    buttonTextLocked: 0x7d6060,
    buttonBg: 0x36232f,
    buttonCompletedBg: 0x51401f,
    buttonLockedBg: 0x1d151d,
    nextText: 0xffe3a1,
    nextBg: 0x36232f,
  },
  // Deep teal/cyan mood.
  ocean: {
    name: 'Océan',
    background: 0x051320,
    board: 0x0d2130,
    gridLine: 0x1b3c52,
    wall: 0x2f6b88,
    ball: 0x46c4ff,
    square: 0x6ff2d0,
    star: 0xbcfffb,
    text: 0xeaf7ff,
    textMuted: 0x7b9cb3,
    accent: 0x46c4ff,
    buttonText: 0xeaf7ff,
    buttonTextLocked: 0x3f6180,
    buttonBg: 0x113349,
    buttonCompletedBg: 0x1d5f66,
    buttonLockedBg: 0x0a1e30,
    nextText: 0xbcfffb,
    nextBg: 0x113349,
  },
};

export const themeOrder: ThemeName[] = ['retro', 'sunset', 'ocean'];

const STORAGE_KEY = 'duality.theme.v1';

export const DEFAULT_THEME: ThemeName = 'retro';

function isValidThemeName(value: unknown): value is ThemeName {
  return typeof value === 'string' && (themeOrder as string[]).includes(value);
}

function readStoredTheme(): ThemeName {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return isValidThemeName(raw) ? raw : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

/** Active theme, persisted across reloads. */
export function getActiveThemeName(): ThemeName {
  return readStoredTheme();
}

export function getTheme(): Theme {
  return themes[getActiveThemeName()];
}

export function setTheme(name: ThemeName): void {
  try {
    localStorage.setItem(STORAGE_KEY, name);
  } catch {
    /* persist is best-effort */
  }
}

/** Switch to the next registered theme and return its name. */
export function cycleTheme(): ThemeName {
  const current = getActiveThemeName();
  const index = themeOrder.indexOf(current);
  const next = themeOrder[(index + 1) % themeOrder.length];
  setTheme(next);
  return next;
}

/** Convert a 0xRRGGBB number to a '#rrggbb' CSS string for Phaser Text styles. */
export function hexToCss(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}