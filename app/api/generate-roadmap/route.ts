// API route — POST /api/generate-roadmap
//
// Pipeline:
//   1. Validate input
//   2. Run the deterministic engine (template + constraints)
//   3. (optionally) ask Claude to refine the content
//   4. Return the merged roadmap

import { NextResponse } from "next/server";
import { generateBaseRoadmap, mergeAiPatch } from "@/lib/roadmapEngine";
import { isAiAvailable, refineRoadmapWithAi } from "@/lib/claudeClient";
import type { Level, RoadmapInput } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const VALID_LEVELS: Level[] = ["beginner", "intermediate", "job-ready", "expert"];

function validate(body: unknown): RoadmapInput | { error: string } {
  if (!body || typeof body !== "object") return { error: "Invalid request body" };
  const b = body as Record<string, unknown>;

  const domain = typeof b.domain === "string" ? b.domain.trim() : "";
  const track = typeof b.track === "string" ? b.track.trim() : "";
  const level = typeof b.level === "string" ? (b.level as Level) : "intermediate";
  const hoursPerWeek = Number(b.hoursPerWeek);
  const goal = typeof b.goal === "string" ? b.goal.trim() : undefined;

  if (!domain) return { error: "Domain is required" };
  if (!track) return { error: "Track is required" };
  if (!VALID_LEVELS.includes(level)) return { error: "Invalid level" };
  if (!Number.isFinite(hoursPerWeek) || hoursPerWeek < 1 || hoursPerWeek > 80) {
    return { error: "Hours/week must be between 1 and 80" };
  }

  return { domain, track, level, hoursPerWeek, goal };
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body must be valid JSON" }, { status: 400 });
  }

  const result = validate(body);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  // Step 1+2: deterministic engine.
  const base = generateBaseRoadmap(result);

  // Step 3: optional AI refinement.
  if (isAiAvailable()) {
    const patch = await refineRoadmapWithAi(base);
    if (patch) {
      const merged = mergeAiPatch(base, patch);
      return NextResponse.json({ roadmap: merged, source: "hybrid" });
    }
  }

  return NextResponse.json({ roadmap: base, source: "template" });
}
