import type { Direction } from '@duality/game';

export type DebugCommand =
  | { type: 'move'; direction: Direction }
  | { type: 'switch' };

const directionName = (direction: Direction) => {
  if (direction.x === 1) return 'RIGHT';
  if (direction.x === -1) return 'LEFT';
  if (direction.y === 1) return 'DOWN';
  return 'UP';
};

export function formatDebugCommands(commands: readonly DebugCommand[]): string {
  const body = commands.map((command, index) =>
    command.type === 'switch'
      ? `  { step: ${index + 1}, type: 'switch' },`
      : `  { step: ${index + 1}, type: 'move', direction: '${directionName(command.direction)}' },`,
  );

  return `// Duality debug command trace\n[\n${body.join('\n')}\n]`;
}
