"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Course } from "../../../types";
import CoursePlayer from "../../../components/CoursePlayer";
import { loadCourses } from "../../../lib/storage";
import { useAuth } from "../../../contexts/AuthContext";

export default function CourseDetailPageClient() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { currentUser, ready } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    setCourses(loadCourses());
  }, []);

  useEffect(() => {
    if (!ready) return; // ✅ wait auth check
    if (!currentUser) router.push("/");
  }, [ready, currentUser, router]);

  const course = useMemo(() => courses.find((c) => c.id === id) || null, [courses, id]);

  if (!ready) {
    return <div className="p-6">Checking login...</div>;
  }

  if (!currentUser) return null;

  if (!course) return <div className="p-6">Course not found</div>;

  return (
    <div className="p-6 space-y-4 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-900 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <div />
      </div>

      <div className="rounded-2xl border bg-white p-4">
        <div className="text-2xl font-bold">{course.title}</div>
        <div className="text-sm text-gray-600 mt-1">{course.description}</div>
      </div>

      <CoursePlayer userId={currentUser.id} courseId={course.id} modules={course.modulesList ?? []} />
    </div>
  );
}
