"use client";

import { BookOpen, Clock, Layers, Play } from "lucide-react";
import type { Course } from "../types";

export default function CourseCard({
  course,
  onClick,
}: {
  course: Course;
  onClick: () => void;
}) {
  const progress = Number(course.progress || 0);

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative w-full text-left rounded-2xl border bg-white shadow-sm transition",
        "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-black/20",
        "border-gray-200 hover:border-gray-300",
      ].join(" ")}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-gray-900 leading-snug line-clamp-2">
              {course.title}
            </h3>
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">{course.description}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
            {course.level}
          </span>
          <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
            {course.category}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <span className="inline-flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {course.duration}
          </span>
          <span className="inline-flex items-center gap-2">
            <Layers className="h-4 w-4" />
            {course.modules || 0} modules
          </span>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-semibold">Progress</span>
            <span className="font-semibold">{Math.min(100, Math.max(0, progress))}%</span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-gray-900"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900">
            <BookOpen className="h-4 w-4" />
            {progress >= 100 ? "Completed" : progress > 0 ? "Continue" : "Start"}
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition bg-black text-white hover:bg-gray-900">
            <Play className="h-4 w-4" />
            Open
          </div>
        </div>
      </div>
    </button>
  );
}
