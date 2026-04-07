"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Calendar,
  Clock,
  Download,
  Gauge,
  RefreshCcw,
  Target,
} from "lucide-react";
import type { Roadmap } from "@/lib/types";
import { deriveProgress, useRoadmapStore } from "@/store/useRoadmapStore";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";

export function RoadmapSidebar({
  roadmap,
  onExport,
  isExporting,
}: {
  roadmap: Roadmap;
  onExport: () => void;
  isExporting: boolean;
}) {
  const updatePace = useRoadmapStore((s) => s.updatePace);
  const progress = deriveProgress(roadmap);
  const [hours, setHours] = useState(roadmap.hoursPerWeek);

  function applyPace() {
    if (hours !== roadmap.hoursPerWeek) updatePace(hours);
  }

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col gap-4 border-r border-slate-200 bg-white p-5">
      {/* Header */}
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">
          {roadmap.domain}
        </div>
        <h1 className="text-xl font-bold text-slate-900">{roadmap.track}</h1>
        <div className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
          {roadmap.level}
          {roadmap.source === "hybrid" && (
            <>
              <span className="text-slate-300">·</span>
              <span className="text-violet-600">AI personalized</span>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <Stat icon={Calendar} label="Weeks" value={`${roadmap.totalWeeks}`} />
        <Stat icon={Clock} label="Hours" value={`${roadmap.totalHours}`} />
        <Stat icon={Target} label="Phases" value={`${roadmap.phases.length}`} />
        <Stat
          icon={BarChart3}
          label="Topics"
          value={`${progress.total}`}
        />
      </div>

      {/* Progress */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Progress
          </span>
          <span className="font-mono text-sm font-bold text-brand-700">
            {progress.percent}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress.percent}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500"
          />
        </div>
        <div className="mt-2 text-[11px] text-slate-500">
          {progress.completed} of {progress.total} topics completed
        </div>
      </div>

      {/* Pace adjustment */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-2 flex items-center gap-2">
          <Gauge className="h-3.5 w-3.5 text-brand-600" />
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-700">
            Adjust pace
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-slate-500">Hours / week</span>
          <span className="font-mono text-lg font-bold text-slate-900">
            {hours}h
          </span>
        </div>
        <input
          type="range"
          min={2}
          max={40}
          value={hours}
          onChange={(e) => setHours(Number(e.target.value))}
          onMouseUp={applyPace}
          onTouchEnd={applyPace}
          className="mt-2 w-full accent-brand-500"
        />
        <button
          type="button"
          onClick={applyPace}
          className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
        >
          <RefreshCcw className="h-3 w-3" />
          Recompute durations
        </button>
      </div>

      {/* Phase list */}
      <div className="flex-1 overflow-y-auto">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Phases
        </div>
        <ul className="space-y-2">
          {roadmap.phases.map((p, i) => {
            const done = p.topics.filter((t) => t.completed).length;
            const pct = p.topics.length === 0 ? 0 : Math.round((done / p.topics.length) * 100);
            return (
              <li key={p.id} className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold",
                      pct === 100
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-brand-100 text-brand-700",
                    )}
                  >
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-semibold text-slate-900">
                      {p.title.replace(/^Phase \d+:\s*/, "")}
                    </div>
                    <div className="text-[10px] text-slate-500">{p.duration}</div>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">{pct}%</span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Export */}
      <button
        type="button"
        onClick={onExport}
        disabled={isExporting}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
      >
        {isExporting ? <Spinner className="h-4 w-4" /> : <Download className="h-4 w-4" />}
        {isExporting ? "Exporting…" : "Export PDF"}
      </button>
    </aside>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="mt-1 font-mono text-xl font-bold text-slate-900">{value}</div>
    </div>
  );
}
