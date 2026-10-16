import { hexToCss } from "./theme";

type StyleValue = string | number | null | undefined;

/** Construit un attribut `style` à partir d'un objet (équivalent de CSSProperties). */
export function styleString(styles: Record<string, StyleValue>): string {
  return Object.entries(styles)
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ");
}

/** Variables CSS `--nom: #rrggbb` pour chaque couleur numérique d'un thème. */
export function themeVars(theme: object): Record<string, string> {
  return Object.fromEntries(
    Object.entries(theme)
      .filter(([, value]) => typeof value === "number")
      .map(([key, value]) => ["--" + key, hexToCss(value as number)]),
  );
}
