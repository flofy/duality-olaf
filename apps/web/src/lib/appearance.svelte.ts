/**
 * Thème et skin vivent dans localStorage (cf. theme.ts / skins.ts). Ce compteur
 * réactif sert à prévenir l'interface qu'ils ont changé, comme le « tick » de
 * AppLayout dans la version React.
 */
export const appearance = $state({ tick: 0 });

export function bumpAppearance(): void {
  appearance.tick += 1;
}
