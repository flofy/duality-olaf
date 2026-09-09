export type DebugDirection = "LEFT" | "RIGHT" | "UP" | "DOWN";

export type DebugCommand =
  | { type: "move"; direction: DebugDirection }
  | { type: "switch" };

export function formatDebugCommands(commands: readonly DebugCommand[]): string {
  const body = commands.map((command, index) =>
    command.type === "switch"
      ? `  { step: ${index + 1}, type: "switch" },`
      : `  { step: ${index + 1}, type: "move", direction: "${command.direction}" },`,
  );

  return `// Duality debug command trace\n[\n${body.join("\n")}\n]`;
}
