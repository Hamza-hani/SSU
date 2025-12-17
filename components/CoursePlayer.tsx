"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Module, Lesson, VideoSource } from "../types";
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
  Lock,
  AlertTriangle,
} from "lucide-react";

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
}: {
  courseId: string;
  modules: Module[];
}) {
  const flat = useMemo(() => flatten(modules), [modules]);

  const storageActive = `course:${courseId}:activeLessonId`;
  const storageDone = `course:${courseId}:completedMap`;
  const storageQuiz = (lessonId: string) => `course:${courseId}:quiz:${lessonId}`;

  const [activeLessonId, setActiveLessonId] = useState<string>(() => flat[0]?.lesson.id ?? "");
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<string>("");

  // Load saved state
  useEffect(() => {
    try {
      const savedActive = localStorage.getItem(storageActive);
      if (savedActive) setActiveLessonId(savedActive);

      const savedDone = localStorage.getItem(storageDone);
      if (savedDone) setCompletedMap(JSON.parse(savedDone));
    } catch {
      setCompletedMap({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save active lesson
  useEffect(() => {
    if (!activeLessonId) return;
    localStorage.setItem(storageActive, activeLessonId);
  }, [activeLessonId, storageActive]);

  // Save completion map
  useEffect(() => {
    localStorage.setItem(storageDone, JSON.stringify(completedMap));
  }, [completedMap, storageDone]);

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

  function markComplete(id: string) {
    setCompletedMap((p) => ({ ...p, [id]: true }));
  }

  function next() {
    if (activeIndex < 0 || activeIndex >= flat.length - 1) return;
    const nextLessonId = flat[activeIndex + 1].lesson.id;
    if (isLessonLocked(nextLessonId)) {
      setToast("Final Assessment locked — complete all previous lessons first.");
      return;
    }
    setActiveLessonId(nextLessonId);
  }

  function prev() {
    if (activeIndex <= 0) return;
    setActiveLessonId(flat[activeIndex - 1].lesson.id);
  }

  const isActiveDone = !!(activeLesson && completedMap[activeLesson.id]);

  /* =========================
     Final Assessment Gate
  ========================= */

  function isLessonLocked(lessonId: string) {
    const idx = flat.findIndex((x) => x.lesson.id === lessonId);
    if (idx < 0) return false;

    const lesson = flat[idx].lesson as any;
    const requiresAll = !!lesson?.gate?.requiresAllPreviousLessons || !!lesson?.isFinalAssessment;
    if (!requiresAll) return false;

    // must complete ALL lessons before it (flat order)
    for (let i = 0; i < idx; i++) {
      if (!completedMap[flat[i].lesson.id]) return true;
    }
    return false;
  }

  const activeLocked = activeLesson ? isLessonLocked(activeLesson.id) : false;

  const remainingBeforeActive = useMemo(() => {
    if (!activeLesson) return 0;
    const idx = flat.findIndex((x) => x.lesson.id === activeLesson.id);
    if (idx <= 0) return 0;
    let remain = 0;
    for (let i = 0; i < idx; i++) if (!completedMap[flat[i].lesson.id]) remain++;
    return remain;
  }, [activeLesson, flat, completedMap]);

  function tryOpenLesson(lessonId: string) {
    if (isLessonLocked(lessonId)) {
      setToast("Final Assessment locked — complete all previous lessons first.");
      return;
    }
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
        {/* ===================== Sidebar ===================== */}
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
                      const locked = isLessonLocked(l.id);

                      return (
                        <li key={l.id}>
                          <button
                            onClick={() => tryOpenLesson(l.id)}
                            disabled={locked}
                            className={[
                              "w-full text-left rounded-xl px-3 py-2 transition border",
                              "flex items-center justify-between gap-3",
                              locked ? "opacity-60 cursor-not-allowed" : "",
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

                                {locked ? (
                                  <span
                                    className={[
                                      "ml-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
                                      isActive
                                        ? "border-white/20 bg-white/10 text-white"
                                        : "border-gray-200 bg-gray-50 text-gray-700",
                                    ].join(" ")}
                                  >
                                    <Lock className="h-3 w-3" />
                                    Locked
                                  </span>
                                ) : null}
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

        {/* ===================== Main ===================== */}
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

                    {activeLocked ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-900">
                        <Lock className="h-3.5 w-3.5" /> Locked
                      </span>
                    ) : isActiveDone ? (
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
                    onClick={() => activeLesson && !activeLocked && markComplete(activeLesson.id)}
                    disabled={!activeLesson || isActiveDone || activeLocked}
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
              ) : activeLocked ? (
                <LockedPanel remaining={remainingBeforeActive} />
              ) : (activeLesson as any).type === "video" ? (
                <VideoPlayer
                  source={
                    (activeLesson as any).video ??
                    ((activeLesson as any).url
                      ? ({ kind: "mp4", url: (activeLesson as any).url } as VideoSource)
                      : undefined)
                  }
                />
              ) : (activeLesson as any).type === "quiz" ? (
                <QuizRenderer
                  lesson={activeLesson as any}
                  storageKey={storageQuiz(activeLesson.id)}
                  onPass={() => markComplete(activeLesson.id)}
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
   Locked Panel
========================= */

function LockedPanel({ remaining }: { remaining: number }) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-xl bg-white p-2 border border-gray-200">
            <Lock className="h-5 w-5 text-gray-900" />
          </div>
          <div>
            <div className="text-lg font-extrabold text-gray-900">Final Assessment Locked</div>
            <p className="mt-1 text-sm text-gray-600 leading-6">
              Pehle saare previous lessons complete karo. Remaining lessons:
              <span className="ml-2 inline-flex items-center rounded-full bg-white border border-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-900">
                {remaining}
              </span>
            </p>
            <div className="mt-4 text-sm text-gray-600">
              Tip: Sidebar se next incomplete lesson open karke <b>Mark Complete</b> karte jao.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Reading Renderer (tight)
========================= */

function ReadingRenderer({ content }: { content: string }) {
  const text = (content || "").trim();

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="px-5 py-6 sm:px-8 sm:py-8">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 mt-0 mb-3">
                  {children}
                </h2>
              ),
              h2: ({ children }) => (
                <h3 className="text-xl font-bold tracking-tight text-gray-900 mt-8 mb-2">
                  {children}
                </h3>
              ),
              h3: ({ children }) => (
                <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
                  {children}
                </h4>
              ),
              p: ({ children }) => (
                <p className="text-[15px] leading-7 text-gray-700 my-2">{children}</p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-gray-900">{children}</strong>
              ),
              ul: ({ children }) => <ul className="my-2 list-disc pl-6 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="my-2 list-decimal pl-6 space-y-1">{children}</ol>,
              li: ({ children }) => (
                <li className="text-[15px] leading-7 text-gray-700">{children}</li>
              ),
              a: ({ children, href }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-700 font-medium hover:underline"
                >
                  {children}
                </a>
              ),
              blockquote: ({ children }) => (
                <div className="my-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <div className="text-gray-700 text-[15px] leading-7">{children}</div>
                </div>
              ),
              hr: () => <hr className="my-8 border-gray-200" />,

              table: ({ children }) => (
                <div className="my-4 w-full overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full border-collapse text-sm">{children}</table>
                </div>
              ),
              thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
              th: ({ children }) => (
                <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold text-gray-900">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border-b border-gray-100 px-3 py-2 align-top text-gray-700">
                  {children}
                </td>
              ),
              code: ({ children }) => (
                <code className="rounded bg-gray-100 px-1 py-0.5 text-[13px] text-gray-900">
                  {children}
                </code>
              ),
            }}
          >
            {text}
          </ReactMarkdown>
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
  onPass: () => void;
  isCompleted: boolean;
}) {
  const quiz = lesson?.quiz;
  const passing = Number(quiz?.passingPercent ?? 70);

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

    if (pct >= passing) onPass();
  }

  const passed = submitted && scorePct >= passing;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="p-5 sm:p-7 border-b border-gray-200">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-gray-500">Final Assessment</div>
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

        <div className="p-5 sm:p-7 space-y-6">
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
   Video Player
========================= */

function VideoPlayer({ source }: { source?: VideoSource }) {
  if (!source) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Video URL missing for this lesson.
      </div>
    );
  }

  if (source.kind === "youtube") {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-black shadow-sm">
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <div className="text-sm font-semibold text-white">Video Lesson</div>
          <div className="text-xs text-white/70">SSU Academy</div>
        </div>
        <div className="aspect-video w-full">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${source.id}?rel=0&modestbranding=1`}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  if (source.kind === "vimeo") {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-black shadow-sm">
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <div className="text-sm font-semibold text-white">Video Lesson</div>
          <div className="text-xs text-white/70">SSU Academy</div>
        </div>
        <div className="aspect-video w-full">
          <iframe
            className="h-full w-full"
            src={`https://player.vimeo.com/video/${source.id}`}
            title="Vimeo video"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  return <EnhancedMp4Player url={source.url} />;
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
        {/* Logo watermark */}
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
