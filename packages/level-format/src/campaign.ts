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
    goal: "Comprendre le mouvement et les trajectoires.",
  },
  2: {
    mechanics: ["positioning", "planning"],
    difficulty: "medium",
    goal: "Préparer les positions avant de s'engager.",
  },
  3: {
    mechanics: ["coordination", "blocking"],
    difficulty: "hard",
    goal: "Utiliser chaque forme comme obstacle pour l'autre.",
  },
  4: {
    mechanics: ["coordination", "blocking", "planning"],
    difficulty: "hard",
    goal: "Enchaîner plusieurs positionnements interdépendants.",
  },
  5: {
    mechanics: ["coordination", "blocking", "planning", "precision"],
    difficulty: "expert",
    goal: "Maîtriser les positions critiques et les séquences longues.",
  },
};

export type WorldDefinition = {
  id: number;
  name: string;
  subtitle: string;
  status: "available" | "coming-soon";
  levels: readonly Level[];
};
