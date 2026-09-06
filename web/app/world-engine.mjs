const MISSION_IDS = new Set(["variables", "decisions", "loops", "functions", "lists", "output"]);
const COMMAND_TYPES = new Set(["say", "unlock", "collect", "shake", "reset"]);
const MAX_COMMANDS = 4;
const MAX_TEXT_LENGTH = 80;

export function validateWorldCommands(commands) {
  if (!Array.isArray(commands) || commands.length > MAX_COMMANDS) return false;
  return commands.every((command) => {
    if (!command || typeof command !== "object" || !COMMAND_TYPES.has(command.type)) return false;
    if (command.type === "say") return command.actor === "companion" && typeof command.value === "string" && command.value.length <= MAX_TEXT_LENGTH;
    if (command.type === "unlock") return command.target === "gate";
    if (command.type === "collect") return command.target === "crystal";
    if (command.type === "shake") return command.target === "companion";
    return Object.keys(command).length === 1;
  });
}

export function compileMissionResult(input) {
  if (!input || typeof input !== "object" || !MISSION_IDS.has(input.missionId) || typeof input.correct !== "boolean") {
    return Object.freeze([{ type: "reset" }]);
  }
  const commands = input.correct
    ? [
        { type: "say", actor: "companion", value: "Quest complete!" },
        { type: "unlock", target: "gate" },
        { type: "collect", target: "crystal" },
      ]
    : [
        { type: "say", actor: "companion", value: "That did not unlock it yet." },
        { type: "shake", target: "companion" },
      ];
  return validateWorldCommands(commands) ? Object.freeze(commands.map((command) => Object.freeze(command))) : Object.freeze([{ type: "reset" }]);
}

export const WORLD_COMMAND_TYPES = Object.freeze([...COMMAND_TYPES]);
