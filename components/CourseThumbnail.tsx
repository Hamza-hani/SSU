import React from "react";
import {
  Shield,
  Radio,
  Target,
  Map,
  Building2,
  GanttChartSquare,
} from "lucide-react";

type Level = "Beginner" | "Intermediate" | "Advanced";

const categoryTheme: Record<
  string,
  { gradient: string; icon: React.ElementType; badge: string }
> = {
  fundamentals: {
    gradient: "from-slate-900 via-slate-800 to-slate-900",
    icon: Building2,
    badge: "bg-slate-900/60 border-slate-200/10",
  },
  operations: {
    gradient: "from-indigo-950 via-indigo-900 to-slate-900",
    icon: GanttChartSquare,
    badge: "bg-indigo-950/60 border-white/10",
  },
  tactical: {
    gradient: "from-emerald-950 via-emerald-900 to-slate-900",
    icon: Shield,
    badge: "bg-emerald-950/60 border-white/10",
  },
  firearms: {
    gradient: "from-rose-950 via-rose-900 to-slate-900",
    icon: Target,
    badge: "bg-rose-950/60 border-white/10",
  },
  strategy: {
    gradient: "from-amber-950 via-amber-900 to-slate-900",
    icon: Map,
    badge: "bg-amber-950/60 border-white/10",
  },
  communications: {
    gradient: "from-cyan-950 via-cyan-900 to-slate-900",
    icon: Radio,
    badge: "bg-cyan-950/60 border-white/10",
  },
};

const levelPill: Record<string, string> = {
  beginner: "bg-emerald-500/15 text-emerald-200 border-emerald-400/20",
  intermediate: "bg-amber-500/15 text-amber-200 border-amber-400/20",
  advanced: "bg-rose-500/15 text-rose-200 border-rose-400/20",
};

function normalizeCategory(input: string) {
  return (input || "").trim().toLowerCase();
}

function normalizeLevel(input: string) {
  return (input || "").trim().toLowerCase();
}

function getInitials(title: string) {
  const words = (title || "").trim().split(/\s+/).slice(0, 2);
  return words.map((w) => w[0]?.toUpperCase()).join("") || "SS";
}

export default function CourseThumbnail({
  title,
  category,
  level,
}: {
  title: string;
  category: string;
  level: string;
}) {
  const catKey = normalizeCategory(category);
  const lvlKey = normalizeLevel(level);

  const theme =
    categoryTheme[catKey] ?? categoryTheme["fundamentals"]; // ✅ fallback
  const Icon = theme.icon;

  const pillClass =
    levelPill[lvlKey] ?? "bg-white/10 text-white/80 border-white/15";

  return (
    <div
  className={`relative h-40 w-full overflow-hidden bg-gradient-to-br ${theme.gradient} transition-transform duration-300 group-hover:scale-[1.02]`}
>

      {/* subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.18) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* soft glow */}
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" />

      {/* badges */}
      <div className="absolute left-3 top-3 flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-white/90 ${theme.badge}`}
        >
          <Icon className="h-4 w-4" />
          {category}
        </span>

        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs ${pillClass}`}
        >
          {level}
        </span>
      </div>

      {/* center initials */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-24 w-24 rounded-3xl bg-white/10 blur-[1px]" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-white/15 bg-white/5">
            <span className="text-3xl font-extrabold tracking-tight text-white/90">
              {getInitials(title)}
            </span>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/35 to-transparent" />
    </div>
  );
}
