// Shared types for the entire LearnFlow app.
// Keep these stable — both the engine and the UI depend on them.

export type Level = "beginner" | "intermediate" | "job-ready" | "expert";

export type Priority = "high" | "medium" | "low";

export interface RoadmapInput {
  domain: string;
  track: string;
  hoursPerWeek: number;
  level: Level;
  goal?: string;
}

export interface Topic {
  id: string;
  title: string;
  time: string; // human readable, e.g. "2 days"
  estimatedHours: number;
  priority: Priority;
  description: string;
  resources: { title: string; url: string }[];
  project?: string;
  completed?: boolean;
}

export interface Phase {
  id: string;
  title: string;
  duration: string;
  milestone: string;
  description: string;
  topics: Topic[];
}

export interface Roadmap {
  id: string;
  domain: string;
  track: string;
  level: Level;
  hoursPerWeek: number;
  totalWeeks: number;
  totalHours: number;
  generatedAt: number;
  source: "template" | "ai" | "hybrid";
  phases: Phase[];
}

export interface GenerateRoadmapResponse {
  roadmap: Roadmap;
  source: Roadmap["source"];
}
