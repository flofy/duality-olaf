import type { Level } from '@duality/level-format';
import { solveLevel, type SolverResult } from './LevelSolver';

export type LevelValidation = {
  id: string;
  result: SolverResult;
};

export type CampaignValidation = {
  levels: LevelValidation[];
  solvable: number;
  unsolvable: number;
};

export function validateLevel(level: Level): LevelValidation {
  return {
    id: level.id,
    result: solveLevel(level),
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

export function formatCampaignReport(validation: CampaignValidation): string {
  const rows = validation.levels.map(({ id, result }) => {
    if (!result.solvable) {
      return `✗ ${id.padEnd(18)} UNSOLVABLE  explored: ${result.exploredStates}`;
    }

    return `✓ ${id.padEnd(18)} solvable  ${String(result.moves).padStart(3)} moves  explored: ${result.exploredStates}`;
  });

  return [
    'CAMPAIGN VALIDATION',
    '',
    ...rows,
    '',
    `Solvable: ${validation.solvable}/${validation.levels.length}`,
    validation.unsolvable > 0 ? `Unsolvable: ${validation.unsolvable}` : 'Unsolvable: 0',
  ].join('\n');
}
