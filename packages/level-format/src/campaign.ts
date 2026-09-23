import type { Level } from "./index";

export type PuzzleMechanic =
  | "movement"
  | "positioning"
  | "coordination"
  | "blocking"
  | "planning"
  | "precision";

export type PuzzleDifficulty = "intro" | "easy" | "medium" | "hard" | "expert";

export const puzzleMechanics: Readonly<Record<PuzzleMechanic, string>> = {
  movement: "Mouvement",
  positioning: "Positionnement",
  coordination: "Coordination",
  blocking: "Blocage",
  planning: "Planification",
  precision: "Précision",
};

export type WorldDesign = {
  mechanics: readonly PuzzleMechanic[];
  difficulty: PuzzleDifficulty;
  goal: string;
};

export const worldDesign: Readonly<Record<number, WorldDesign>> = {
  1: {
    mechanics: ["movement"],
    difficulty: "intro",
    goal: "Comprendre le mouvement, puis éviter le feu (niveau 05).",
  },
  2: {
    mechanics: ["positioning", "planning"],
    difficulty: "easy",
    goal: "Découvrir le carré, puis composer avec le feu (niveau 05).",
  },
  3: {
    mechanics: ["coordination", "blocking"],
    difficulty: "medium",
    goal: "Faire coopérer la balle et le carré pour finir chaque niveau.",
  },
  4: {
    mechanics: ["coordination", "blocking", "planning"],
    difficulty: "hard",
    goal: "Maîtriser les téléporteurs, d'abord sans le carré.",
  },
  5: {
    mechanics: ["coordination", "blocking", "planning", "precision"],
    difficulty: "expert",
    goal: "Ouvrir les portes, puis combiner balle, carré, porte et téléporteur.",
  },
};

export type WorldDefinition = {
  id: number;
  name: string;
  subtitle: string;
  status: "available" | "coming-soon";
  levels: readonly Level[];
};
