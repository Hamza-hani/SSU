// components/CourseDetailClient.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Clock, CheckCircle2, Play } from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import type { Course, Lesson, Module } from "../types";

import {
  EVENTS,
  loadCourses,
  loadProgressMap,
  calcCourseProgressPct,
  markLessonCompleteForUser,
} from "../lib/storage";

/* =========================
   Helpers
========================= */
function flattenLessons(modulesList: Module[]) {
  const flat: { moduleId: string; lesson: Lesson }[] = [];
  modulesList.forEach((m) => m.lessons.forEach((l) => flat.push({ moduleId: m.id, lesson: l })));
  return flat;
}

function getNextIncompleteLesson(modulesList: Module[], completedSet: Set<string>) {
  const all = flattenLessons(modulesList);
  return (
    all.find((x) => !completedSet.has(x.lesson.id))?.lesson ??
    all[0]?.lesson ??
    null
  );
}

export default function CourseDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { currentUser } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);

  // per-user progress map
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const completedSet = useMemo(() => new Set(completedLessonIds), [completedLessonIds]);

  const hydrate = () => {
    const courses = loadCourses();
    const found = courses.find((c) => c.id === id) ?? null;
    setCourse(found);

    // ✅ load user progress map for this course
    if (currentUser?.id) {
      const map = loadProgressMap(currentUser.id);
      const courseProg = map[id];
      setCompletedLessonIds(courseProg?.completedLessonIds ?? []);
    } else {
      setCompletedLessonIds([]);
    }
  };

  useEffect(() => {
    hydrate();

    const onCourses = () => hydrate();
    const onProgress = () => hydrate();

    window.addEventListener(EVENTS.COURSES_UPDATED, onCourses);
    window.addEventListener(EVENTS.PROGRESS_UPDATED, onProgress);

    return () => {
      window.removeEventListener(EVENTS.COURSES_UPDATED, onCourses);
      window.removeEventListener(EVENTS.PROGRESS_UPDATED, onProgress);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, currentUser?.id]);

  const modulesList = (course?.modulesList ?? []) as Module[];

  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  // set default active lesson (next incomplete)
  useEffect(() => {
    if (!course?.id) return;
    const next = getNextIncompleteLesson(modulesList, completedSet);
    setActiveLessonId(next?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course?.id, completedLessonIds.join("|")]);

  const activeLesson = useMemo(() => {
    if (!modulesList.length) return null;
    for (const m of modulesList) {
      const found = m.lessons.find((l) => l.id === activeLessonId);
      if (found) return found;
    }
    return getNextIncompleteLesson(modulesList, completedSet);
  }, [modulesList, activeLessonId, completedSet]);

  const allLessons = useMemo(() => flattenLessons(modulesList), [modulesList]);

  const activeIndex = useMemo(() => {
    if (!activeLesson) return -1;
    return allLessons.findIndex((x) => x.lesson.id === activeLesson.id);
  }, [allLessons, activeLesson]);

  const progressPct = useMemo(() => {
    if (!course || !currentUser?.id) return 0;
    const map = loadProgressMap(currentUser.id);
    return calcCourseProgressPct(course, map[course.id]);
  }, [course, currentUser?.id, completedLessonIds]);

  const goPrev = () => {
    if (activeIndex <= 0) return;
    setActiveLessonId(allLessons[activeIndex - 1].lesson.id);
  };

  const goNext = () => {
    if (activeIndex < 0 || activeIndex >= allLessons.length - 1) return;
    setActiveLessonId(allLessons[activeIndex + 1].lesson.id);
  };

  const markComplete = () => {
    // ✅ FIX: Use AuthContext user, not some other storage user
    if (!currentUser) {
      alert("Please login first.");
      router.push("/");
      return;
    }
    if (!course || !activeLesson) return;

    // ✅ Save completion to per-user progress map
    markLessonCompleteForUser({
      userId: currentUser.id,
      courseId: course.id,
      lessonId: activeLesson.id,
    });

    // optimistic UI update
    if (!completedSet.has(activeLesson.id)) {
      setCompletedLessonIds((prev) => [...prev, activeLesson.id]);
    }
  };

  const handleContinue = () => {
    const next = getNextIncompleteLesson(modulesList, completedSet);
    if (next) setActiveLessonId(next.id);
  };

  if (!course) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <p className="text-gray-700">Course not found.</p>
        <Link className="text-black font-semibold" href="/">
          Go back
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <div className="text-xs font-semibold uppercase text-gray-500">
                {course.category}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mt-1">{course.title}</h1>
              <p className="text-gray-600 mt-2 max-w-2xl">{course.description}</p>

              <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4" /> {course.duration}
                </span>
                <span className="inline-flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> {course.modules} modules
                </span>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 w-full lg:w-80">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 font-medium">Progress</span>
                <span className="text-black font-semibold">{progressPct}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-black h-2 rounded-full" style={{ width: `${progressPct}%` }} />
              </div>
              <button
                onClick={handleContinue}
                className="mt-4 w-full bg-black text-white font-semibold py-2 rounded-lg"
              >
                Continue
              </button>

              {!currentUser && (
                <div className="mt-3 text-xs text-red-600 font-semibold">
                  You are not logged in. Please login to save progress.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Syllabus */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200">
                <h2 className="font-bold text-gray-900">Course Content</h2>
              </div>

              <div className="p-3 space-y-3">
                {modulesList.map((m) => (
                  <div key={m.id} className="border border-gray-200 rounded-lg">
                    <div className="px-4 py-3 bg-gray-50 font-semibold text-gray-900">
                      {m.title}
                    </div>

                    <div className="p-2 space-y-1">
                      {m.lessons.map((l) => {
                        const selected = activeLesson?.id === l.id;
                        const done = completedSet.has(l.id);

                        return (
                          <button
                            key={l.id}
                            onClick={() => setActiveLessonId(l.id)}
                            className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between gap-2
                              ${selected ? "bg-black text-white" : "hover:bg-gray-50 text-gray-900"}`}
                          >
                            <span className="text-sm font-medium">{l.title}</span>

                            {done ? (
                              <CheckCircle2 className={`h-4 w-4 ${selected ? "text-white" : "text-green-600"}`} />
                            ) : l.type === "video" ? (
                              <Play className={`h-4 w-4 ${selected ? "text-white" : "text-gray-500"}`} />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {modulesList.length === 0 && (
                  <p className="text-sm text-gray-600 p-3">
                    No syllabus found. Add modules in Admin Panel → Courses.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Lesson */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              {activeLesson ? (
                <>
                  <h3 className="text-2xl font-bold text-gray-900">{activeLesson.title}</h3>

                  <div className="mt-4">
                    {activeLesson.type === "video" ? (
                      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500">Video placeholder (add URL/embed later)</span>
                      </div>
                    ) : (
                      <div className="prose max-w-none text-gray-800">
                        {activeLesson.content ?? "No content"}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={goPrev}
                      disabled={activeIndex <= 0}
                      className="px-4 py-2 rounded-lg border border-gray-300 font-semibold disabled:opacity-50"
                    >
                      Previous
                    </button>

                    <button
                      onClick={markComplete}
                      className="px-4 py-2 rounded-lg bg-black text-white font-semibold"
                    >
                      Mark as complete
                    </button>

                    <button
                      onClick={goNext}
                      disabled={activeIndex >= allLessons.length - 1}
                      className="px-4 py-2 rounded-lg border border-gray-300 font-semibold disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-gray-700">No lessons found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
