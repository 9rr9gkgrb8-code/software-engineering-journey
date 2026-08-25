import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
const sadRoute = await readFile(new URL("../app/api/sad/route.ts", import.meta.url), "utf8");

test("teaches real Python foundations", () => {
  for (const item of ["Variables", "Decisions", "Loops", "Functions", "Lists", "Output"]) assert.match(page, new RegExp(item));
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
test("provides a private learner portfolio", () => {
  assert.match(page, /Export my portfolio/);
  assert.match(page, /Reset local progress/);
  assert.match(page, /forge-portfolio\.json/);
});
test("connects to local SAD through a bounded server route", () => {
  assert.match(page, /SAD COACH CONNECTED/);
  assert.match(sadRoute, /127\.0\.0\.1:8765/);
  assert.match(sadRoute, /result_id: crypto\.randomUUID/);
  assert.match(sadRoute, /student_answer: input\.student_answer\.slice\(0, 500\)/);
  assert.doesNotMatch(sadRoute, /name|school|password|profile/);
  assert.match(sadRoute, /FORGE_FAMILY_KEY/);
  assert.match(sadRoute, /MAX_BODY_BYTES/);
  assert.match(sadRoute, /MAX_REQUESTS_PER_MINUTE/);
  assert.match(sadRoute, /sameOrigin/);
});
