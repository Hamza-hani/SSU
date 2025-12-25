"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Lesson, Module, VideoSource } from "../types";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Play,
  FileText,
  ShieldCheck,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  RotateCw,
  AlertTriangle,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import {
  loadProgressMap,
  markLessonCompleteForUser,
  resolveVideoUrl,
} from "../lib/storage";

/* =========================
   Helpers
========================= */

function toPlainTitle(t: any) {
  if (typeof t === "string") return t;
  if (t && typeof t === "object") return t.en || t.title || JSON.stringify(t);
  return String(t ?? "");
}

function flatten(modules: Module[]) {
  const out: { moduleId: string; moduleTitle: string; lesson: Lesson }[] = [];
  modules.forEach((m) =>
    m.lessons.forEach((l: Lesson) =>
      out.push({ moduleId: m.id, moduleTitle: toPlainTitle(m.title), lesson: l })
    )
  );
  return out;
}

function formatTime(sec: number) {
  if (!Number.isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/* =========================
   Component
========================= */

export default function CoursePlayer({
  courseId,
  modules,
  userId: userIdProp,
}: {
  courseId: string;
  modules: Module[];
  userId?: string; // ✅ allow passing directly
}) {
  const { currentUser, ready } = useAuth();

  // ✅ Single source of truth (prefer prop if passed)
  const userId = userIdProp || currentUser?.id || "";

  const flat = useMemo(() => flatten(modules), [modules]);

  const storageActive = `course:${courseId}:activeLessonId`;
  const storageQuiz = (lessonId: string) => `course:${courseId}:quiz:${lessonId}`;

  const [activeLessonId, setActiveLessonId] = useState<string>(() => flat[0]?.lesson.id ?? "");
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<string>("");

  // ✅ If modules loaded later and activeLessonId empty, set first lesson
  useEffect(() => {
    if (!activeLessonId && flat[0]?.lesson?.id) setActiveLessonId(flat[0].lesson.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flat.length]);

  // Load saved state (per-user progress)
  useEffect(() => {
    if (!userId) {
      setCompletedMap({});
      return;
    }

    try {
      const savedActive = localStorage.getItem(storageActive);
      if (savedActive) setActiveLessonId(savedActive);

      const map = loadProgressMap(userId);
      const p = map[courseId];
      const doneIds = p?.completedLessonIds ?? [];
      const next: Record<string, boolean> = {};
      doneIds.forEach((id) => (next[id] = true));
      setCompletedMap(next);
    } catch {
      setCompletedMap({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, courseId]);

  // Save active lesson
  useEffect(() => {
    if (!activeLessonId) return;
    localStorage.setItem(storageActive, activeLessonId);
  }, [activeLessonId, storageActive]);

  const activeLesson = useMemo(() => {
    return flat.find((x) => x.lesson.id === activeLessonId)?.lesson ?? flat[0]?.lesson;
  }, [flat, activeLessonId]);

  const activeRow = useMemo(() => {
    return flat.find((x) => x.lesson.id === activeLessonId) ?? flat[0];
  }, [flat, activeLessonId]);

  const activeIndex = useMemo(
    () => flat.findIndex((x) => x.lesson.id === activeLessonId),
    [flat, activeLessonId]
  );

  const progress = useMemo(() => {
    if (!flat.length) return 0;
    const done = flat.filter((x) => completedMap[x.lesson.id]).length;
    return Math.round((done / flat.length) * 100);
  }, [flat, completedMap]);

  const doneCount = useMemo(
    () => flat.filter((x) => completedMap[x.lesson.id]).length,
    [flat, completedMap]
  );

  function setDoneLocal(id: string) {
    setCompletedMap((p) => ({ ...p, [id]: true }));
  }

  function markComplete(id: string, finalScore?: number) {
    // ✅ wait for auth check if not ready
    if (!ready) {
      setToast("Checking login...");
      return;
    }
    if (!userId) {
      setToast("Please login first.");
      return;
    }
    setDoneLocal(id);
    markLessonCompleteForUser({ userId, courseId, lessonId: id, finalScore });
  }

  function next() {
    if (activeIndex < 0 || activeIndex >= flat.length - 1) return;
    setActiveLessonId(flat[activeIndex + 1].lesson.id);
  }

  function prev() {
    if (activeIndex <= 0) return;
    setActiveLessonId(flat[activeIndex - 1].lesson.id);
  }

  const isActiveDone = !!(activeLesson && completedMap[activeLesson.id]);

  /** ✅ NO LOCKS ANYMORE */
  function isLessonLocked(_lessonId: string) {
    return false;
  }

  function tryOpenLesson(lessonId: string) {
    setActiveLessonId(lessonId);
  }

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className="relative">
      {/* Toast */}
      {toast ? (
        <div className="fixed left-1/2 top-4 z-[60] -translate-x-1/2">
          <div className="rounded-2xl border border-gray-200 bg-white text-gray-900 px-4 py-3 shadow-lg">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <AlertTriangle className="h-4 w-4" />
              {toast}
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="col-span-12 lg:col-span-4 xl:col-span-3">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Progress
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <div className="text-2xl font-extrabold text-gray-900">{progress}%</div>
                    <div className="text-sm text-gray-600">
                      ({doneCount}/{flat.length})
                    </div>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-3 py-2 text-white">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-xs font-semibold">Training</span>
                </div>
              </div>

              <div className="mt-3 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-gray-900" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="p-3 space-y-3 max-h-[70vh] overflow-auto">
              {modules.map((m) => (
                <div key={m.id} className="rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50">
                    <div className="font-bold text-gray-900">{toPlainTitle(m.title)}</div>
                    <div className="text-xs text-gray-500 mt-1">{m.lessons.length} lessons</div>
                  </div>

                  <ul className="p-2 space-y-1">
                    {m.lessons.map((l) => {
                      const isActive = l.id === activeLessonId;
                      const isDone = !!completedMap[l.id];

                      return (
                        <li key={l.id}>
                          <button
                            onClick={() => tryOpenLesson(l.id)}
                            className={[
                              "w-full text-left rounded-xl px-3 py-2 transition border",
                              "flex items-center justify-between gap-3",
                              isActive
                                ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                                : "bg-white hover:bg-gray-50 border-gray-200",
                            ].join(" ")}
                          >
                            <div className="min-w-0">
                              <div className="text-sm font-semibold line-clamp-1">
                                {toPlainTitle((l as any).title)}
                              </div>

                              <div
                                className={[
                                  "mt-1 inline-flex items-center gap-2 text-xs",
                                  isActive ? "text-white/80" : "text-gray-500",
                                ].join(" ")}
                              >
                                {(l as any).type === "video" ? (
                                  <>
                                    <Play className="h-3.5 w-3.5" />
                                    <span>Video</span>
                                  </>
                                ) : (l as any).type === "quiz" ? (
                                  <>
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    <span>Assessment</span>
                                  </>
                                ) : (
                                  <>
                                    <FileText className="h-3.5 w-3.5" />
                                    <span>Reading</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {isDone ? (
                                <span
                                  className={[
                                    "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold border",
                                    isActive
                                      ? "bg-white/10 text-white border-white/20"
                                      : "bg-green-50 text-green-700 border-green-200",
                                  ].join(" ")}
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Done
                                </span>
                              ) : (
                                <span
                                  className={[
                                    "inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold border",
                                    isActive
                                      ? "bg-white/10 text-white border-white/20"
                                      : "bg-gray-100 text-gray-700 border-gray-200",
                                  ].join(" ")}
                                >
                                  In progress
                                </span>
                              )}
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}

              {modules.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-300 p-4 text-sm text-gray-600">
                  No modules found. Add <b>modulesList</b> in courses data.
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="col-span-12 lg:col-span-8 xl:col-span-9 space-y-4">
          {/* Header */}
          <div className="sticky top-3 z-10">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Lesson
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <div className="text-xl font-extrabold text-gray-900">
                      {toPlainTitle(activeLesson?.title)}
                    </div>

                    {activeRow?.moduleTitle ? (
                      <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
                        {activeRow.moduleTitle}
                      </span>
                    ) : null}

                    {isActiveDone ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                        {activeIndex + 1}/{flat.length}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={prev}
                    disabled={activeIndex <= 0}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold
                               hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Prev
                  </button>

                  <button
                    onClick={() => activeLesson && !isLessonLocked(activeLesson.id) && markComplete(activeLesson.id)}
                    disabled={!activeLesson || isActiveDone}
                    className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white
                               hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {isActiveDone ? "Completed" : "Mark Complete"}
                  </button>

                  <button
                    onClick={next}
                    disabled={activeIndex < 0 || activeIndex >= flat.length - 1}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold
                               hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="p-4 md:p-6">
              {!activeLesson ? (
                <div className="text-sm text-gray-600">No lesson found.</div>
              ) : (activeLesson as any).type === "video" ? (
                <VideoPlayer source={(activeLesson as any).video as VideoSource | undefined} />
              ) : (activeLesson as any).type === "quiz" ? (
                <QuizRenderer
                  lesson={activeLesson as any}
                  storageKey={storageQuiz(activeLesson.id)}
                  onPass={(pct) => markComplete(activeLesson.id, pct)}
                  isCompleted={!!completedMap[activeLesson.id]}
                />
              ) : (
                <ReadingRenderer content={(activeLesson as any).content ?? ""} />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* =========================
   Reading Renderer
========================= */
function ReadingRenderer({ content }: { content: string }) {
  const text = (content || "").trim();

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="px-5 py-6 sm:px-8 sm:py-8">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Quiz Renderer
========================= */
function QuizRenderer({
  lesson,
  storageKey,
  onPass,
  isCompleted,
}: {
  lesson: any;
  storageKey: string;
  onPass: (scorePct: number) => void;
  isCompleted: boolean;
}) {
  const quiz = lesson?.quiz;
  const passing = Number(quiz?.passingPercent ?? 50);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [scorePct, setScorePct] = useState<number>(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      setAnswers(parsed.answers ?? {});
      setSubmitted(!!parsed.submitted);
      setScorePct(Number(parsed.scorePct ?? 0));
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ answers, submitted, scorePct }));
    } catch {}
  }, [answers, submitted, scorePct, storageKey]);

  const questions = Array.isArray(quiz?.questions) ? quiz.questions : [];
  const canSubmit = questions.length > 0 && Object.keys(answers).length === questions.length;

  function submit() {
    if (!questions.length) return;

    let correct = 0;
    for (const q of questions) {
      const picked = answers[q.id];
      if (picked && picked === q.correctOptionId) correct++;
    }
    const pct = Math.round((correct / questions.length) * 100);
    setScorePct(pct);
    setSubmitted(true);

    if (pct >= passing) onPass(pct);
  }

  const passed = submitted && scorePct >= passing;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-gray-500">Assessment</div>
              <div className="text-xl font-extrabold text-gray-900 mt-1">{toPlainTitle(lesson.title)}</div>
            </div>

            <div className="text-right">
              <div className="text-xs text-gray-500">Passing</div>
              <div className="text-sm font-bold text-gray-900">{passing}%</div>
            </div>
          </div>

          {submitted ? (
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
              <div className="text-sm font-semibold text-gray-900">Score: {scorePct}%</div>
              {passed ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-2 py-0.5 text-xs font-bold text-white">
                  <CheckCircle2 className="h-3.5 w-3.5" /> PASSED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-xs font-bold text-gray-900">
                  Try Again
                </span>
              )}
            </div>
          ) : null}

          {isCompleted ? <div className="mt-3 text-sm text-gray-600">✅ This assessment is marked as completed.</div> : null}
        </div>

        <div className="p-5 space-y-6">
          {questions.length === 0 ? (
            <div className="text-sm text-gray-600">No questions found in this quiz.</div>
          ) : (
            questions.map((q: any, idx: number) => {
              const picked = answers[q.id];
              return (
                <div key={q.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="text-sm font-semibold text-gray-500">Question {idx + 1}</div>
                  <div className="mt-1 text-[15px] leading-7 text-gray-900 font-semibold">{q.prompt}</div>

                  <div className="mt-3 space-y-2">
                    {(q.options ?? []).map((opt: any) => {
                      const selected = picked === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setAnswers((p) => ({ ...p, [q.id]: opt.id }))}
                          className={[
                            "w-full text-left rounded-xl px-3 py-3 border transition",
                            selected
                              ? "bg-gray-900 text-white border-gray-900"
                              : "bg-white text-gray-900 border-gray-200 hover:bg-gray-50",
                          ].join(" ")}
                        >
                          <div className="text-sm font-semibold">
                            <span className="mr-2 opacity-70">{opt.id}.</span>
                            {opt.text}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {submitted && q.explanation ? (
                    <div className="mt-3 text-sm text-gray-600">
                      <span className="font-semibold text-gray-900">Explanation:</span> {q.explanation}
                    </div>
                  ) : null}
                </div>
              );
            })
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-gray-600">
              Answered: {Object.keys(answers).length}/{questions.length}
            </div>

            <button
              onClick={submit}
              disabled={!canSubmit}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white
                         hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="h-4 w-4" />
              Submit Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Video Player (mp4/youtube/idb)
========================= */

function VideoPlayer({ source }: { source?: VideoSource }) {
  const [mode, setMode] = useState<"loading" | "iframe" | "mp4" | "error">("loading");
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!source) {
        setMode("error");
        return;
      }
      try {
        const resolved = await resolveVideoUrl(source);
        if (!mounted) return;

        if (source.kind === "youtube") {
          setUrl(resolved);
          setMode("iframe");
        } else {
          setUrl(resolved);
          setMode("mp4");
        }
      } catch {
        if (!mounted) return;
        setMode("error");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [source]);

  if (!source) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Video source missing for this lesson.
      </div>
    );
  }

  if (mode === "loading") {
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
        Loading video...
      </div>
    );
  }

  if (mode === "error") {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Video load failed. (If using uploaded video, ensure it exists in this browser.)
      </div>
    );
  }

  if (mode === "iframe") {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-black shadow-sm">
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <div className="text-sm font-semibold text-white">Video Lesson</div>
          <div className="text-xs text-white/70">SSU Academy</div>
        </div>
        <div className="aspect-video w-full">
          <iframe
            className="h-full w-full"
            src={url}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  return <EnhancedMp4Player url={url} />;
}

function EnhancedMp4Player({ url }: { url: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [vol, setVol] = useState(0.9);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(0);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    v.volume = vol;

    const onLoaded = () => {
      setDur(v.duration || 0);
      setReady(true);
    };
    const onTime = () => setT(v.currentTime || 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    v.addEventListener("loadedmetadata", onLoaded);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);

    return () => {
      v.removeEventListener("loadedmetadata", onLoaded);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePlay = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  const seekToPct = (pct: number) => {
    const v = ref.current;
    if (!v || !dur) return;
    v.currentTime = Math.max(0, Math.min(dur, dur * pct));
  };

  const skip = (sec: number) => {
    const v = ref.current;
    if (!v) return;
    const max = v.duration || 0;
    v.currentTime = Math.max(0, Math.min(max, v.currentTime + sec));
  };

  const toggleMute = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const setVolume = (value: number) => {
    const v = ref.current;
    if (!v) return;
    v.volume = value;
    setVol(value);
    if (v.muted && value > 0) {
      v.muted = false;
      setMuted(false);
    }
  };

  const fullscreen = () => {
    const container = ref.current?.parentElement;
    if (!container) return;

    if (document.fullscreenElement) document.exitFullscreen();
    else container.requestFullscreen?.();
  };

  const pct = dur ? (t / dur) * 100 : 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-black shadow-sm">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="text-sm font-semibold text-white">Training Video</div>
        <div className="text-xs text-white/70">SSU Academy</div>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute right-3 top-3 z-20 opacity-70 drop-shadow-md">
          <Image src="/assets/logo.svg" alt="SSU Academy" width={64} height={64} className="select-none" />
        </div>

        <video
          ref={ref}
          className="w-full"
          src={url}
          preload="metadata"
          controls={false}
          playsInline
          onClick={togglePlay}
        />

        {!playing && (
          <button
            onClick={togglePlay}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                       h-16 w-16 rounded-full bg-white/15 backdrop-blur
                       border border-white/20 grid place-items-center
                       hover:bg-white/20 transition z-20"
            aria-label="Play"
          >
            <Play className="h-7 w-7 text-white" />
          </button>
        )}

        <div className="absolute left-0 right-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
          <div
            className="h-2 w-full rounded-full bg-white/20 cursor-pointer overflow-hidden"
            onClick={(e) => {
              const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
              const x = e.clientX - rect.left;
              seekToPct(x / rect.width);
            }}
          >
            <div className="h-full bg-white" style={{ width: `${pct}%` }} />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="rounded-xl bg-white/10 border border-white/15 px-3 py-2 text-white hover:bg-white/15 transition"
              >
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>

              <button
                onClick={() => skip(-10)}
                className="rounded-xl bg-white/10 border border-white/15 px-3 py-2 text-white hover:bg-white/15 transition"
                title="Back 10s"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <button
                onClick={() => skip(10)}
                className="rounded-xl bg-white/10 border border-white/15 px-3 py-2 text-white hover:bg-white/15 transition"
                title="Forward 10s"
              >
                <RotateCw className="h-4 w-4" />
              </button>

              <div className="text-xs text-white/80 tabular-nums">
                {formatTime(t)} / {ready ? formatTime(dur) : "—"}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="rounded-xl bg-white/10 border border-white/15 px-3 py-2 text-white hover:bg-white/15 transition"
                title="Mute"
              >
                {muted || vol === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>

              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={muted ? 0 : vol}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-28 accent-white"
              />

              <button
                onClick={fullscreen}
                className="rounded-xl bg-white/10 border border-white/15 px-3 py-2 text-white hover:bg-white/15 transition"
                title="Fullscreen"
              >
                <Maximize className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
