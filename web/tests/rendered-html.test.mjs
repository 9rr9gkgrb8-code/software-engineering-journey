import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");

test("teaches real Python foundations", () => {
  for (const item of ["Variables", "Decisions", "Loops", "Functions"]) assert.match(page, new RegExp(item));
  assert.match(page, /Nothing runs here/);
});
test("teaches responsible AI assistant design", () => {
  for (const item of ["Give it a role", "Add useful context", "Set boundaries", "Test the answer"]) assert.match(page, new RegExp(item));
  assert.match(page, /AI can be confidently wrong/);
});
test("includes a guided assistant blueprint", () => {
  assert.match(page, /MY ASSISTANT BLUEPRINT/);
  assert.match(page, /ask what I have already tried/);
  assert.match(page, /trusted adult/);
});
test("protects young learners and keeps progress local", () => {
  assert.match(page, /No account\. No public chat/);
  assert.match(page, /localStorage/);
  assert.match(page, /names, passwords, school details/);
  assert.doesNotMatch(page, /dangerouslySetInnerHTML|eval\(/);
});
test("uses clean product metadata", () => {
  assert.match(layout, /Forge — Code, design, and build with AI/);
  assert.doesNotMatch(layout, /â|Starter Project|codex-preview/);
});
test("source has no common encoding damage", () => {
  assert.doesNotMatch(page, /â|Ã|�/);
});
