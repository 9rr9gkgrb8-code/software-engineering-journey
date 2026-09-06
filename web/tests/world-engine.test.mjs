import assert from "node:assert/strict";
import test from "node:test";
import { compileMissionResult, validateWorldCommands, WORLD_COMMAND_TYPES } from "../app/world-engine.mjs";

test("successful mission emits only allowlisted visual commands", () => {
  const commands = compileMissionResult({ missionId: "variables", correct: true });
  assert.deepEqual(commands.map((command) => command.type), ["say", "unlock", "collect"]);
  assert.ok(commands.every((command) => WORLD_COMMAND_TYPES.includes(command.type)));
  assert.equal(validateWorldCommands(commands), true);
});

test("failed mission emits bounded retry feedback", () => {
  assert.deepEqual(compileMissionResult({ missionId: "loops", correct: false }), [
    { type: "say", actor: "companion", value: "That did not unlock it yet." },
    { type: "shake", target: "companion" },
  ]);
});

test("unknown or malformed mission results fail closed", () => {
  assert.deepEqual(compileMissionResult({ missionId: "unknown", correct: true }), [{ type: "reset" }]);
  assert.deepEqual(compileMissionResult(null), [{ type: "reset" }]);
  assert.equal(validateWorldCommands([{ type: "script", value: "alert(1)" }]), false);
  assert.equal(validateWorldCommands([{ type: "say", actor: "companion", value: "x".repeat(81) }]), false);
});

test("command batches are capped", () => {
  assert.equal(validateWorldCommands(Array.from({ length: 5 }, () => ({ type: "reset" }))), false);
});
