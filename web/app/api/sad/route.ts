import { NextResponse } from "next/server";

const SAD = process.env.SAD_FORGE_URL || "http://127.0.0.1:8765";
const protocol = "forge-sad-v1";

export async function GET() {
  try {
    const response = await fetch(`${SAD}/health`, { signal: AbortSignal.timeout(1500), cache: "no-store" });
    const body = await response.json();
    return NextResponse.json({ connected: response.ok && body.protocol_version === protocol });
  } catch { return NextResponse.json({ connected: false }); }
}

export async function POST(request: Request) {
  try {
    const input = await request.json();
    if (typeof input?.mission_id !== "string" || typeof input?.student_answer !== "string" || typeof input?.correct !== "boolean" || !Number.isInteger(input?.attempt_number)) throw new Error("invalid request");
    const coaching = {
      protocol_version: protocol,
      mission_id: input.mission_id.slice(0, 80), lesson: String(input.lesson || "").slice(0, 1000),
      prompt: String(input.prompt || "").slice(0, 1000), student_answer: input.student_answer.slice(0, 500),
      answer_is_correct: input.correct, attempt_number: input.attempt_number,
      hint: String(input.hint || "").slice(0, 500), result_id: crypto.randomUUID(),
    };
    const response = await fetch(`${SAD}/v1/forge/coach`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(coaching), signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error("SAD unavailable");
    const result = await response.json();
    if (result.protocol_version !== protocol || typeof result.feedback !== "string" || result.feedback.length > 500) throw new Error("invalid SAD response");
    return NextResponse.json({ connected: true, feedback: result.feedback, source: result.source });
  } catch { return NextResponse.json({ connected: false }, { status: 503 }); }
}
