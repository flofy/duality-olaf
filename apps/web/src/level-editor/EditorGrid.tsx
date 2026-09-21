import { useEffect, useRef, type CSSProperties } from "react";
import type { Level } from "@duality/level-format";
import type { LevelEditorTool } from "../LevelEditorTools";
import { switchGlyph } from "../GameBoard";
import { isDragPaintTool } from "./levelOps";

function same(
  a: { x: number; y: number } | undefined,
  b: { x: number; y: number },
) {
  return a !== undefined && a.x === b.x && a.y === b.y;
}

type EditorGridProps = {
  level: Level;
  tool: LevelEditorTool;
  onPaint: (x: number, y: number) => void;
};

export function EditorGrid({ level, tool, onPaint }: EditorGridProps) {
  const paintingRef = useRef(false);
  const lastPaintedRef = useRef<string | null>(null);

  useEffect(() => {
    const stopPainting = () => {
      paintingRef.current = false;
      lastPaintedRef.current = null;
    };
    window.addEventListener("pointerup", stopPainting);
    window.addEventListener("pointercancel", stopPainting);
    return () => {
      window.removeEventListener("pointerup", stopPainting);
      window.removeEventListener("pointercancel", stopPainting);
    };
  }, []);

  return (
    <div
      className="editor-board board"
      style={
        {
          "--cols": level.width,
          "--rows": level.height,
        } as CSSProperties
      }
      aria-label="Grille d'édition"
    >
      {level.tiles.flatMap((row, y) =>
        row.map((tile, x) => {
          const star = level.stars.some((p) => p.x === x && p.y === y);
          const ball = same(level.ball, { x, y });
          const square = same(level.square, { x, y });
          const door = level.doors?.find((d) => same(d.position, { x, y }));
          const sw = level.switches?.find((s) => same(s.position, { x, y }));
          const tp = level.teleporters?.find((t) => same(t.position, { x, y }));
          return (
            <button
              type="button"
              key={`${x}-${y}`}
              className={`editor-cell ${tile === "wall" ? "wall" : ""}`}
              style={{ gridColumn: x + 1, gridRow: y + 1 }}
              onPointerDown={(e) => {
                if (e.button !== 0 && e.pointerType === "mouse") return;
                if (isDragPaintTool(tool)) {
                  paintingRef.current = true;
                  lastPaintedRef.current = `${x}-${y}`;
                }
                onPaint(x, y);
              }}
              onPointerEnter={() => {
                if (!paintingRef.current) return;
                const key = `${x}-${y}`;
                if (lastPaintedRef.current === key) return;
                lastPaintedRef.current = key;
                onPaint(x, y);
              }}
              aria-label={`Case ${x + 1}, ${y + 1}`}
            >
              {ball && <span className="editor-entity ball">●</span>}
              {square && <span className="editor-entity square">■</span>}
              {star && <span className="editor-entity star">★</span>}
              {door && <span className="editor-entity door">▣</span>}
              {sw && (
                <span className={`editor-entity switch form-${sw.form}`}>
                  {switchGlyph(sw.form)}
                </span>
              )}
              {tp && <span className="editor-entity teleporter">◎</span>}
              {tile === "spike" && (
                <span className="editor-entity spike">🔥</span>
              )}
            </button>
          );
        }),
      )}
    </div>
  );
}
