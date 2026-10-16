import type { Switch } from "@duality/level-format";

export type LevelEditorTool =
  | "empty"
  | "wall"
  | "spike"
  | "star"
  | "ball"
  | "square"
  | "door"
  | "switch"
  | "teleporter";

type LevelEditorToolDefinition = {
  id: LevelEditorTool;
  label: string;
  glyph: string;
};

export const levelEditorTools: LevelEditorToolDefinition[] = [
  { id: "empty", label: "Case vide", glyph: "·" },
  { id: "wall", label: "Mur", glyph: "■" },
  { id: "spike", label: "Feu", glyph: "🔥" },
  { id: "star", label: "Étoile", glyph: "★" },
  { id: "ball", label: "Balle", glyph: "●" },
  { id: "square", label: "Carré (re-clic pour retirer)", glyph: "■" },
  { id: "door", label: "Porte", glyph: "▣" },
  { id: "switch", label: "Interrupteur", glyph: "⌁" },
  { id: "teleporter", label: "Téléporteur", glyph: "◎" },
];

export function switchGlyph(form: Switch["form"]): string {
  if (form === "ball") return "●";
  if (form === "square") return "■";
  return "●⇄■";
}
