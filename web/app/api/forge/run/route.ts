import { NextResponse } from "next/server";

const RUNTIME = process.env.FORGE_RUNTIME_URL || "http://127.0.0.1:8780";
const RUNTIME_KEY = process.env.FORGE_RUNTIME_KEY || "";
const FAMILY_KEY = process.env.FORGE_FAMILY_KEY || "";
const MAX_BODY_BYTES = 4_096;
const MAX_SOURCE_LENGTH = 1_000;
const MAX_REQUESTS_PER_MINUTE = 30;
const requests = new Map<string, { count: number; reset: number }>();
const commandTypes = new Set(["say", "unlock", "collect", "shake", "reset"]);

function response(status: number, body: object) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}
function sameOrigin(request: Request) { const origin = request.headers.get("origin"); return !origin || origin === new URL(request.url).origin; }
async function validFamilyKey(request: Request) {
  const supplied = request.headers.get("x-forge-family-key") || "";
  if (!FAMILY_KEY || !supplied) return false;
  const encoder = new TextEncoder();
  const [actual, expected] = await Promise.all([crypto.subtle.digest("SHA-256", encoder.encode(supplied)), crypto.subtle.digest("SHA-256", encoder.encode(FAMILY_KEY))]);
  const left = new Uint8Array(actual); const right = new Uint8Array(expected); let difference = left.length ^ right.length;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}
function withinRateLimit() {
  const now = Date.now(); const current = requests.get("family");
  if (!current || current.reset <= now) { requests.set("family", { count: 1, reset: now + 60_000 }); return true; }
  current.count += 1; return current.count <= MAX_REQUESTS_PER_MINUTE;
}
function validCommand(command: unknown) {
  if (!command || typeof command !== "object") return false;
  const item = command as Record<string, unknown>;
  if (typeof item.type !== "string" || !commandTypes.has(item.type)) return false;
  if (item.type === "say") return item.actor === "companion" && typeof item.value === "string" && item.value.length <= 80;
  if (item.type === "unlock") return item.target === "gate";
  if (item.type === "collect") return item.target === "crystal";
  if (item.type === "shake") return item.target === "companion";
  return Object.keys(item).length === 1;
}
export async function POST(request: Request) {
  if (!RUNTIME_KEY) return response(503, { error: "runtime_not_configured" });
  if (!sameOrigin(request)) return response(403, { error: "origin_rejected" });
  if (!(await validFamilyKey(request))) return response(401, { error: "family_access_required" });
  if (!withinRateLimit()) return response(429, { error: "slow_down" });
  const declaredLength = Number(request.headers.get("content-length") || "0");
  if (declaredLength > MAX_BODY_BYTES) return response(413, { error: "request_too_large" });
  try {
    const raw = await request.text();
    if (!raw || new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return response(413, { error: "request_too_large" });
    const input = JSON.parse(raw);
    if (input?.mission_id !== "variables" || typeof input?.source !== "string" || input.source.length > MAX_SOURCE_LENGTH) return response(400, { error: "invalid_mission_request" });
    const runtimeResponse = await fetch(`${RUNTIME}/v1/run`, { method: "POST", headers: { "Content-Type": "application/json", "x-forge-runtime-key": RUNTIME_KEY }, body: JSON.stringify({ mission_id: input.mission_id, source: input.source }), signal: AbortSignal.timeout(2_000), cache: "no-store" });
    if (!runtimeResponse.ok) throw new Error("runtime unavailable");
    const result = await runtimeResponse.json();
    if (result?.protocol_version !== "forge-runtime-v1" || typeof result?.result_id !== "string" || !["passed", "failed", "rejected"].includes(result?.status) || !Array.isArray(result?.commands) || result.commands.length > 4 || !result.commands.every(validCommand) || !Array.isArray(result?.diagnostics)) throw new Error("invalid runtime evidence");
    return response(200, { connected: true, result_id: result.result_id, status: result.status, commands: result.commands, diagnostics: result.diagnostics.slice(0, 4) });
  } catch { return response(503, { connected: false, error: "safe_fallback" }); }
}
