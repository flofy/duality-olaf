import type { Level } from '@duality/level-format';
import { solveLevel, type SolverResult } from './LevelSolver';

export type DifficultyMetrics = {
  moves: number;
  exploredStates: number;
  score: number;
};

export type LevelValidation = {
  id: string;
  result: SolverResult;
  difficulty: DifficultyMetrics | null;
};

export type CampaignValidation = {
  levels: LevelValidation[];
  solvable: number;
  unsolvable: number;
};

export function estimateDifficulty(result: SolverResult): DifficultyMetrics | null {
  if (!result.solvable) return null;

  // The shortest solution is the strongest signal. Search effort adds a smaller
  // signal for puzzle branching/ambiguity without dominating the score.
  const exploration = Math.round(Math.log2(Math.max(1, result.exploredStates)));
  return {
    moves: result.moves,
    exploredStates: result.exploredStates,
    score: result.moves * 10 + exploration,
  };
}

export function validateLevel(level: Level): LevelValidation {
  const result = solveLevel(level);
  return {
    id: level.id,
    result,
    difficulty: estimateDifficulty(result),
  };
}

export function validateCampaign(levels: readonly Level[]): CampaignValidation {
  const validated = levels.map(validateLevel);
  const solvable = validated.filter((entry) => entry.result.solvable).length;

  return {
    levels: validated,
    solvable,
    unsolvable: validated.length - solvable,
  };
}

export function rankCampaign(validation: CampaignValidation): LevelValidation[] {
  return [...validation.levels].sort((a, b) => {
    if (a.difficulty === null && b.difficulty === null) return a.id.localeCompare(b.id);
    if (a.difficulty === null) return 1;
    if (b.difficulty === null) return -1;
    return a.difficulty.score - b.difficulty.score || a.id.localeCompare(b.id);
  });
}

export function formatCampaignReport(validation: CampaignValidation): string {
  const rows = validation.levels.map(({ id, result, difficulty }) => {
    if (!result.solvable || !difficulty) {
      return `✗ ${id.padEnd(18)} UNSOLVABLE  explored: ${result.exploredStates}`;
    }

    return `✓ ${id.padEnd(18)} solvable  ${String(difficulty.moves).padStart(3)} moves  explored: ${difficulty.exploredStates}  score: ${difficulty.score}`;
  });

  const ranking = rankCampaign(validation)
    .filter((entry) => entry.difficulty)
    .map((entry, index) => `${String(index + 1).padStart(2, '0')}. ${entry.id}  score: ${entry.difficulty!.score}`);

  return [
    'CAMPAIGN VALIDATION',
    '',
    ...rows,
    '',
    'DIFFICULTY RANKING',
    ...ranking,
    '',
    `Solvable: ${validation.solvable}/${validation.levels.length}`,
    validation.unsolvable > 0 ? `Unsolvable: ${validation.unsolvable}` : 'Unsolvable: 0',
  ].join('\n');
}
