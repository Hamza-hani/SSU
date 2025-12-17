// app/course/[id]/page.tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import CoursePlayer from "../../../components/CoursePlayer";
import { courses } from "../../../data/courses";
import type { Course } from "../../../types";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CourseDetailPage({ params }: PageProps) {
  const { id } = await params;

  const course = (courses as Course[]).find((c) => c.id === id);

  if (!course) return <div className="p-6">Course not found</div>;

  return (
    <div className="p-6 space-y-4">
      {/* ✅ Top-left Back to Dashboard button (BLACK) */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2
                     text-sm font-semibold text-white shadow-sm
                     hover:bg-gray-900 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <div />
      </div>

      {/* Course Info */}
      <div className="rounded-2xl border bg-white p-4">
        <div className="text-2xl font-bold">{course.title}</div>
        <div className="text-sm text-gray-600 mt-1">{course.description}</div>
      </div>

      <CoursePlayer courseId={course.id} modules={course.modulesList ?? []} />
    </div>
  );
}
