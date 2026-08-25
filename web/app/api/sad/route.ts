import { NextResponse } from "next/server";

const SAD = process.env.SAD_FORGE_URL || "http://127.0.0.1:8765";
const FAMILY_KEY = process.env.FORGE_FAMILY_KEY || "";
const protocol = "forge-sad-v1";
const requests = new Map<string, { count: number; reset: number }>();
const MAX_BODY_BYTES = 4_096;
const MAX_REQUESTS_PER_MINUTE = 15;

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

async function validKey(request: Request) {
  const supplied = request.headers.get("x-forge-family-key") || "";
  if (!FAMILY_KEY || !supplied) return false;
  const encoder = new TextEncoder();
  const [actual, expected] = await Promise.all([crypto.subtle.digest("SHA-256", encoder.encode(supplied)), crypto.subtle.digest("SHA-256", encoder.encode(FAMILY_KEY))]);
  const left = new Uint8Array(actual); const right = new Uint8Array(expected);
  let difference = left.length ^ right.length;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}

function withinRateLimit(request: Request) {
  const key = "family";
  const now = Date.now(); const current = requests.get(key);
  if (!current || current.reset <= now) { requests.set(key, { count: 1, reset: now + 60_000 }); return true; }
  current.count += 1; return current.count <= MAX_REQUESTS_PER_MINUTE;
}

function denied(status: number, error: string) { return NextResponse.json({ connected: false, error }, { status }); }

export async function GET(request: Request) {
  if (!sameOrigin(request) || !(await validKey(request))) return denied(401, "family_access_required");
  try {
    const response = await fetch(`${SAD}/health`, { signal: AbortSignal.timeout(1500), cache: "no-store" });
    const body = await response.json();
    return NextResponse.json({ connected: response.ok && body.protocol_version === protocol });
  } catch { return NextResponse.json({ connected: false }); }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return denied(403, "origin_rejected");
  if (!(await validKey(request))) return denied(401, "family_access_required");
  if (!withinRateLimit(request)) return denied(429, "slow_down");
  const declaredLength = Number(request.headers.get("content-length") || "0");
  if (declaredLength > MAX_BODY_BYTES) return denied(413, "request_too_large");
  try {
    const raw = await request.text();
    if (!raw || new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return denied(413, "request_too_large");
    const input = JSON.parse(raw);
    if (typeof input?.mission_id !== "string" || typeof input?.student_answer !== "string" || typeof input?.correct !== "boolean" || !Number.isInteger(input?.attempt_number)) throw new Error("invalid request");
    const coaching = {
      protocol_version: protocol, mission_id: input.mission_id.slice(0, 80),
      lesson: String(input.lesson || "").slice(0, 1000), prompt: String(input.prompt || "").slice(0, 1000),
      student_answer: input.student_answer.slice(0, 500), answer_is_correct: input.correct,
      attempt_number: Math.min(100, Math.max(1, input.attempt_number)), hint: String(input.hint || "").slice(0, 500),
      result_id: crypto.randomUUID(),
    };
    const response = await fetch(`${SAD}/v1/forge/coach`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(coaching), signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error("SAD unavailable");
    const result = await response.json();
    if (result.protocol_version !== protocol || typeof result.feedback !== "string" || result.feedback.length > 500) throw new Error("invalid SAD response");
    return NextResponse.json({ connected: true, feedback: result.feedback, source: result.source });
  } catch { return denied(503, "safe_fallback"); }
}
