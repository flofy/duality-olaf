export type LevelEditorTool =
  | "empty"
  | "wall"
  | "star"
  | "ball"
  | "square"
  | "door"
  | "switch"
  | "teleporter";

export const levelEditorTools: Array<{
  id: LevelEditorTool;
  label: string;
  glyph: string;
}> = [
  { id: "empty", label: "Case vide", glyph: "·" },
  { id: "wall", label: "Mur", glyph: "■" },
  { id: "star", label: "Étoile", glyph: "★" },
  { id: "ball", label: "Balle", glyph: "●" },
  { id: "square", label: "Carré", glyph: "■" },
  { id: "door", label: "Porte", glyph: "▣" },
  { id: "switch", label: "Interrupteur", glyph: "⌁" },
  { id: "teleporter", label: "Téléporteur", glyph: "◎" },
];

export function LevelEditorTools({
  selected,
  onSelect,
}: {
  selected: LevelEditorTool;
  onSelect: (tool: LevelEditorTool) => void;
}) {
  return (
    <div
      className="editor-tools"
      role="toolbar"
      aria-label="Outils de niveau"
    >
      {levelEditorTools.map((item) => (
        <button
          key={item.id}
          className={`editor-tool ${selected === item.id ? "selected" : ""}`}
          onClick={() => onSelect(item.id)}
          title={item.label}
        >
          <span>{item.glyph}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}
