"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Users,
  LayoutGrid,
  Plus,
  Trash2,
  Save,
  Video,
  FileText,
  ListChecks,
  Shield,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { Course, Lesson, Module, VideoSource, User } from "../types";
import {
  EVENTS,
  idbSaveVideo,
  loadCourses,
  loadUsers,
  saveUsers,
  slugifyId,
  saveCoursesRemote,
  syncCoursesFromServer,
} from "../lib/storage";

type Tab = "overview" | "courses" | "users";
type MobilePane = "courses" | "modules" | "lesson";

const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

function uid(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function defaultQuizQuestion() {
  return {
    id: uid("q"),
    prompt: "New question...",
    options: [
      { id: "A", text: "Option A" },
      { id: "B", text: "Option B" },
      { id: "C", text: "Option C" },
      { id: "D", text: "Option D" },
    ],
    correctOptionId: "A",
    explanation: "",
  };
}

export default function AdminPanel() {
  const [tab, setTab] = useState<Tab>("overview");
  const [mobilePane, setMobilePane] = useState<MobilePane>("courses");

  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");

  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState<string>("");
  const [hydrated, setHydrated] = useState(false);

  const selectedCourse = useMemo(
    () => courses.find((c) => c.id === selectedCourseId) || null,
    [courses, selectedCourseId]
  );

  const selectedModule = useMemo(() => {
    const mods = (selectedCourse?.modulesList ?? []) as Module[];
    return mods.find((m) => m.id === selectedModuleId) || null;
  }, [selectedCourse, selectedModuleId]);

  const selectedLesson = useMemo(() => {
    if (!selectedModule) return null;
    return (
      (selectedModule.lessons || []).find((l) => l.id === selectedLessonId) ||
      null
    );
  }, [selectedModule, selectedLessonId]);

  // Hydrate once
  useEffect(() => {
    const u = loadUsers();
    const c = loadCourses();

    setUsers(u);
    setCourses(c);

    // ✅ pull from DB so live becomes same for everyone
    syncCoursesFromServer().then((fresh) => {
      setCourses(fresh);
      if (fresh.length) {
        setSelectedCourseId((prev) => prev || fresh[0].id);
        setSelectedModuleId((prev) => prev || fresh[0].modulesList?.[0]?.id || "");
        setSelectedLessonId(
          (prev) => prev || fresh[0].modulesList?.[0]?.lessons?.[0]?.id || ""
        );
      }
    });

    if (c.length) {
      setSelectedCourseId((prev) => prev || c[0].id);
      setSelectedModuleId((prev) => prev || c[0].modulesList?.[0]?.id || "");
      setSelectedLessonId(
        (prev) => prev || c[0].modulesList?.[0]?.lessons?.[0]?.id || ""
      );
    }

    setHydrated(true);

    const onUsers = () => setUsers(loadUsers());
    window.addEventListener(EVENTS.USERS_UPDATED, onUsers);
    return () => window.removeEventListener(EVENTS.USERS_UPDATED, onUsers);
  }, []);

  // Helper: toast
  const showToast = (msg: string) => {
    setToast(msg);
    window.clearTimeout((showToast as any)._t);
    (showToast as any)._t = window.setTimeout(() => setToast(""), 1800);
  };

  // ✅ Save to DB (not only local)
  const handleSaveChanges = async () => {
    try {
      await saveCoursesRemote(courses);
      setDirty(false);
      showToast("Saved to DB ✅");
    } catch (e: any) {
      showToast(e?.message || "Save failed");
    }
  };

  // Draft update helpers (mark dirty)
  const setDraftCourses = (next: Course[], markDirty = true) => {
    setCourses(next);
    if (markDirty) setDirty(true);
  };

  const updateCourse = (patch: Partial<Course>) => {
    if (!selectedCourse) return;
    const next = courses.map((c) =>
      c.id === selectedCourse.id ? ({ ...c, ...patch } as Course) : c
    );
    setDraftCourses(next);
  };

  const updateModule = (moduleId: string, patch: Partial<Module>) => {
    if (!selectedCourse) return;
    const mods = (selectedCourse.modulesList ?? []) as Module[];
    const nextMods = mods.map((m) =>
      m.id === moduleId ? ({ ...m, ...patch } as Module) : m
    );
    updateCourse({ modulesList: nextMods, modules: nextMods.length });
  };

  const updateLesson = (
    moduleId: string,
    lessonId: string,
    patch: Partial<Lesson>
  ) => {
    if (!selectedCourse) return;
    const mods = (selectedCourse.modulesList ?? []) as Module[];
    const nextMods = mods.map((m) => {
      if (m.id !== moduleId) return m;
      return {
        ...m,
        lessons: (m.lessons || []).map((l) =>
          l.id === lessonId ? ({ ...l, ...patch } as Lesson) : l
        ),
      };
    });
    updateCourse({ modulesList: nextMods, modules: nextMods.length });
  };

  // Users removal (local only)
  const removeUserByEmail = (email: string) => {
    const next = loadUsers().filter(
      (u) => (u.email || "").toLowerCase() !== email.toLowerCase()
    );
    saveUsers(next);
    showToast("User removed");
  };

  const addNewCourse = () => {
    const title = `New Course ${courses.length + 1}`;
    let id = slugifyId(title);
    if (!id) id = `course-${Date.now()}`;
    let uniqueId = id;
    let n = 2;
    while (courses.some((c) => c.id === uniqueId)) uniqueId = `${id}-${n++}`;

    const newCourse: Course = {
      id: uniqueId,
      title,
      description: "Edit description in Admin Panel.",
      level: "Beginner",
      category: "FUNDAMENTALS",
      duration: "4 weeks",
      modules: 0,
      progress: 0,
      modulesList: [],
      prerequisites: [],
    };

    const next = [newCourse, ...courses];
    setDraftCourses(next);
    setSelectedCourseId(uniqueId);
    setSelectedModuleId("");
    setSelectedLessonId("");
    setTab("courses");
    setMobilePane("modules");
  };

  const deleteCourse = (courseId: string) => {
    const next = courses.filter((c) => c.id !== courseId);
    setDraftCourses(next);
    if (selectedCourseId === courseId) {
      const first = next[0];
      setSelectedCourseId(first?.id || "");
      setSelectedModuleId(first?.modulesList?.[0]?.id || "");
      setSelectedLessonId(first?.modulesList?.[0]?.lessons?.[0]?.id || "");
    }
  };

  const addModule = () => {
    if (!selectedCourse) return;
    const mods = (selectedCourse.modulesList ?? []) as Module[];
    const moduleNo = mods.length + 1;

    const newModule: Module = {
      id: uid(`${selectedCourse.id}_m${moduleNo}`),
      title: `Module ${moduleNo}`,
      lessons: [
        {
          id: uid(`${selectedCourse.id}_m${moduleNo}_t1`),
          title: "Key Points (Notes)",
          type: "text",
          content: `# ${selectedCourse.title} — Module ${moduleNo}\n\n## Notes\n- Add notes here.\n`,
        } as Lesson,
      ],
    };

    const nextMods = [...mods, newModule];
    updateCourse({ modulesList: nextMods, modules: nextMods.length });
    setSelectedModuleId(newModule.id);
    setSelectedLessonId(newModule.lessons[0].id);
    setMobilePane("lesson");
  };

  const removeModuleById = (moduleId: string) => {
    if (!selectedCourse) return;
    const mods = (selectedCourse.modulesList ?? []) as Module[];
    const nextMods = mods.filter((m) => m.id !== moduleId);
    updateCourse({ modulesList: nextMods, modules: nextMods.length });

    if (selectedModuleId === moduleId) {
      const first = nextMods[0];
      setSelectedModuleId(first?.id || "");
      setSelectedLessonId(first?.lessons?.[0]?.id || "");
    }
  };

  const addLessonToModule = (moduleId: string, type: Lesson["type"]) => {
    if (!selectedCourse) return;
    const mods = (selectedCourse.modulesList ?? []) as Module[];
    const mod = mods.find((m) => m.id === moduleId);
    if (!mod) return;

    const lessonNo = (mod.lessons?.length || 0) + 1;
    const base: Lesson = {
      id: uid(`${moduleId}_l${lessonNo}`),
      title:
        type === "text"
          ? "Reading Lesson"
          : type === "video"
          ? "Video Lesson"
          : "Assessment Quiz",
      type,
    };

    const lesson: Lesson =
      type === "text"
        ? { ...base, content: `# Heading\n\nWrite your content in **Markdown** here.\n` }
        : type === "video"
        ? { ...base, video: { kind: "mp4", url: "" } as VideoSource }
        : {
            ...base,
            quiz: {
              passingPercent: 50,
              questions: [defaultQuizQuestion()],
              shuffleQuestions: true,
              shuffleOptions: true,
            },
          };

    const nextLessons = [...(mod.lessons || []), lesson];
    updateModule(moduleId, { lessons: nextLessons });
    setSelectedModuleId(moduleId);
    setSelectedLessonId(lesson.id);
    setMobilePane("lesson");
  };

  const removeLesson = (moduleId: string, lessonId: string) => {
    if (!selectedCourse) return;
    const mods = (selectedCourse.modulesList ?? []) as Module[];
    const mod = mods.find((m) => m.id === moduleId);
    if (!mod) return;
    const nextLessons = (mod.lessons || []).filter((l) => l.id !== lessonId);
    updateModule(moduleId, { lessons: nextLessons });

    if (selectedLessonId === lessonId) {
      setSelectedLessonId(nextLessons[0]?.id || "");
    }
  };

  /** Final Assessment */
  const ensureFinalAssessment = () => {
    if (!selectedCourse) return;
    const mods = (selectedCourse.modulesList ?? []) as Module[];

    for (const m of mods) {
      for (const l of m.lessons || []) {
        if ((l as any).isFinalAssessment) {
          setSelectedModuleId(m.id);
          setSelectedLessonId(l.id);
          setMobilePane("lesson");
          return;
        }
      }
    }

    const finalModule: Module = {
      id: uid(`${selectedCourse.id}_final_module`),
      title: "Final Assessment",
      lessons: [
        {
          id: uid(`${selectedCourse.id}_final_quiz`),
          title: `${selectedCourse.title} — Final Assessment`,
          type: "quiz",
          isFinalAssessment: true,
          gate: { requiresAllPreviousLessons: true },
          quiz: {
            passingPercent: 50,
            questions: [defaultQuizQuestion()],
            shuffleQuestions: true,
            shuffleOptions: true,
          },
        } as Lesson,
      ],
    };

    const nextMods = [...mods, finalModule];
    updateCourse({ modulesList: nextMods, modules: nextMods.length });
    setSelectedModuleId(finalModule.id);
    setSelectedLessonId(finalModule.lessons[0].id);
    setMobilePane("lesson");
  };

  // When course changes, keep selection sane
  useEffect(() => {
    if (!selectedCourse) return;
    const mods = (selectedCourse.modulesList ?? []) as Module[];
    if (!mods.length) {
      setSelectedModuleId("");
      setSelectedLessonId("");
      return;
    }
    if (!mods.some((m) => m.id === selectedModuleId)) {
      setSelectedModuleId(mods[0].id);
      setSelectedLessonId(mods[0].lessons?.[0]?.id || "");
      return;
    }
    const mod = mods.find((m) => m.id === selectedModuleId);
    if (mod && !mod.lessons?.some((l) => l.id === selectedLessonId)) {
      setSelectedLessonId(mod.lessons?.[0]?.id || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseId]);

  if (!hydrated) {
    return <div className="min-h-screen bg-gray-50 p-6">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-[999] rounded-2xl bg-black text-white px-4 py-3 shadow-lg text-sm">
          {toast}
        </div>
      )}

      {/* TOP (NOT STICKY) */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-screen-2xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Manage courses, modules, lessons, videos & assessments
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <TopTab
                  label="Overview"
                  active={tab === "overview"}
                  onClick={() => setTab("overview")}
                  icon={<LayoutGrid className="h-4 w-4" />}
                />
                <TopTab
                  label="Courses"
                  active={tab === "courses"}
                  onClick={() => setTab("courses")}
                  icon={<BookOpen className="h-4 w-4" />}
                />
                <TopTab
                  label="Users"
                  active={tab === "users"}
                  onClick={() => setTab("users")}
                  icon={<Users className="h-4 w-4" />}
                />
              </div>
            </div>

            {/* Save controls */}
            <div className="flex items-center gap-2 lg:mt-1">
              {!dirty ? (
                <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Saved
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                  <AlertCircle className="h-4 w-4" />
                  Unsaved changes
                </div>
              )}

              <button
                onClick={handleSaveChanges}
                className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-900 transition disabled:opacity-50"
                disabled={!dirty}
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>

          {/* Mobile pane switch only in courses tab */}
          {tab === "courses" && (
            <div className="mt-5 lg:hidden">
              <div className="inline-flex rounded-2xl border border-gray-200 bg-white p-1">
                <MiniTab
                  active={mobilePane === "courses"}
                  onClick={() => setMobilePane("courses")}
                >
                  Courses
                </MiniTab>
                <MiniTab
                  active={mobilePane === "modules"}
                  onClick={() => setMobilePane("modules")}
                >
                  Modules
                </MiniTab>
                <MiniTab
                  active={mobilePane === "lesson"}
                  onClick={() => setMobilePane("lesson")}
                >
                  Lesson
                </MiniTab>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BODY */}
      <div className="max-w-screen-2xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-8 pb-14">
        {tab === "overview" && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900">Quick Summary</h2>
            <div className="mt-6 grid md:grid-cols-3 gap-6">
              <StatCard label="Total Users" value={users.length} />
              <StatCard label="Total Courses" value={courses.length} />
              <StatCard label="Storage" value="DB + Local Cache" />
            </div>
          </div>
        )}

        {tab === "users" && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900">User Management</h2>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-3 pr-4">NAME</th>
                    <th className="py-3 pr-4">EMAIL</th>
                    <th className="py-3 pr-4">ROLE</th>
                    <th className="py-3 pr-4">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td className="py-6 text-gray-600" colSpan={4}>
                        No users yet.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.email} className="border-b last:border-b-0">
                        <td className="py-4 pr-4 font-semibold text-gray-900">
                          {u.name}
                        </td>
                        <td className="py-4 pr-4 text-gray-700">{u.email}</td>
                        <td className="py-4 pr-4">
                          <span className="inline-flex px-3 py-1 rounded-full bg-gray-900 text-white font-semibold">
                            {u.role || "user"}
                          </span>
                        </td>
                        <td className="py-4 pr-4">
                          <button
                            onClick={() => removeUserByEmail(u.email)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
                          >
                            <Trash2 className="h-4 w-4" /> Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "courses" && (
          <>
            {/* MOBILE STACK */}
            <div className="lg:hidden space-y-6">
              {mobilePane === "courses" && (
                <CoursesList
                  courses={courses}
                  selectedCourseId={selectedCourseId}
                  onSelect={(id) => {
                    setSelectedCourseId(id);
                    const c = courses.find((x) => x.id === id);
                    setSelectedModuleId(c?.modulesList?.[0]?.id || "");
                    setSelectedLessonId(
                      c?.modulesList?.[0]?.lessons?.[0]?.id || ""
                    );
                    setMobilePane("modules");
                  }}
                  onAdd={addNewCourse}
                />
              )}

              {mobilePane === "modules" && (
                <ModulesLessonsPane
                  selectedCourse={selectedCourse}
                  selectedModuleId={selectedModuleId}
                  selectedLessonId={selectedLessonId}
                  onSelectModule={(mid) => {
                    setSelectedModuleId(mid);
                    const mod = (selectedCourse?.modulesList as Module[])?.find(
                      (m) => m.id === mid
                    );
                    setSelectedLessonId(mod?.lessons?.[0]?.id || "");
                    setMobilePane("lesson");
                  }}
                  onSelectLesson={(lid) => {
                    setSelectedLessonId(lid);
                    setMobilePane("lesson");
                  }}
                  onAddModule={addModule}
                  onRemoveModule={removeModuleById}
                  onAddLesson={(type) =>
                    selectedModule && addLessonToModule(selectedModule.id, type)
                  }
                  onRemoveLesson={(lid) =>
                    selectedModule && removeLesson(selectedModule.id, lid)
                  }
                  onFinal={ensureFinalAssessment}
                  selectedModule={selectedModule}
                />
              )}

              {mobilePane === "lesson" && (
                <EditorPane
                  selectedCourse={selectedCourse}
                  selectedModule={selectedModule}
                  selectedLesson={selectedLesson}
                  onUpdateCourse={updateCourse}
                  onUpdateModule={(patch) =>
                    selectedModule && updateModule(selectedModule.id, patch)
                  }
                  onUpdateLesson={(patch) =>
                    selectedModule &&
                    selectedLesson &&
                    updateLesson(selectedModule.id, selectedLesson.id, patch)
                  }
                  onDeleteCourse={() =>
                    selectedCourse && deleteCourse(selectedCourse.id)
                  }
                  LEVELS={LEVELS as any}
                />
              )}
            </div>

            {/* DESKTOP 3-COLUMN */}
            <div className="hidden lg:grid grid-cols-12 gap-6">
              <div className="col-span-3">
                <CoursesList
                  courses={courses}
                  selectedCourseId={selectedCourseId}
                  onSelect={(id) => {
                    setSelectedCourseId(id);
                    const c = courses.find((x) => x.id === id);
                    setSelectedModuleId(c?.modulesList?.[0]?.id || "");
                    setSelectedLessonId(
                      c?.modulesList?.[0]?.lessons?.[0]?.id || ""
                    );
                  }}
                  onAdd={addNewCourse}
                />
              </div>

              <div className="col-span-4">
                <ModulesLessonsPane
                  selectedCourse={selectedCourse}
                  selectedModuleId={selectedModuleId}
                  selectedLessonId={selectedLessonId}
                  onSelectModule={(mid) => {
                    setSelectedModuleId(mid);
                    const mod = (selectedCourse?.modulesList as Module[])?.find(
                      (m) => m.id === mid
                    );
                    setSelectedLessonId(mod?.lessons?.[0]?.id || "");
                  }}
                  onSelectLesson={(lid) => setSelectedLessonId(lid)}
                  onAddModule={addModule}
                  onRemoveModule={removeModuleById}
                  onAddLesson={(type) =>
                    selectedModule && addLessonToModule(selectedModule.id, type)
                  }
                  onRemoveLesson={(lid) =>
                    selectedModule && removeLesson(selectedModule.id, lid)
                  }
                  onFinal={ensureFinalAssessment}
                  selectedModule={selectedModule}
                />
              </div>

              <div className="col-span-5">
                <EditorPane
                  selectedCourse={selectedCourse}
                  selectedModule={selectedModule}
                  selectedLesson={selectedLesson}
                  onUpdateCourse={updateCourse}
                  onUpdateModule={(patch) =>
                    selectedModule && updateModule(selectedModule.id, patch)
                  }
                  onUpdateLesson={(patch) =>
                    selectedModule &&
                    selectedLesson &&
                    updateLesson(selectedModule.id, selectedLesson.id, patch)
                  }
                  onDeleteCourse={() =>
                    selectedCourse && deleteCourse(selectedCourse.id)
                  }
                  LEVELS={LEVELS as any}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- UI pieces ---------- */

function TopTab({
  label,
  active,
  onClick,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border transition ${
        active
          ? "bg-gray-900 text-white border-gray-900 shadow-sm"
          : "bg-white border-gray-200 hover:bg-gray-50 text-gray-900"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function MiniTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${
        active ? "bg-black text-white" : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}

function StatCard({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-2xl border border-gray-200 p-6">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-3xl font-extrabold text-gray-900 mt-1">{value}</div>
    </div>
  );
}

function CardShell({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="text-lg font-bold text-gray-900">{title}</div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function CoursesList({
  courses,
  selectedCourseId,
  onSelect,
  onAdd,
}: {
  courses: Course[];
  selectedCourseId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <CardShell
      title="Courses"
      action={
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-black text-white hover:bg-gray-900"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      }
    >
      <div className="space-y-3">
        {courses.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`w-full text-left rounded-2xl border p-4 transition ${
              selectedCourseId === c.id
                ? "border-black/20 bg-black text-white"
                : "border-gray-200 bg-white hover:bg-gray-50"
            }`}
          >
            <div className="font-semibold">{c.title}</div>
            <div
              className={`text-xs mt-1 ${
                selectedCourseId === c.id ? "text-white/80" : "text-gray-500"
              }`}
            >
              {c.level} • {c.category} • {c.modulesList?.length || 0} modules
            </div>
          </button>
        ))}
        {courses.length === 0 && (
          <div className="text-sm text-gray-600">No courses yet.</div>
        )}
      </div>
    </CardShell>
  );
}

function ModulesLessonsPane({
  selectedCourse,
  selectedModuleId,
  selectedLessonId,
  onSelectModule,
  onSelectLesson,
  onAddModule,
  onRemoveModule,
  onAddLesson,
  onRemoveLesson,
  onFinal,
  selectedModule,
}: {
  selectedCourse: Course | null;
  selectedModuleId: string;
  selectedLessonId: string;
  onSelectModule: (id: string) => void;
  onSelectLesson: (id: string) => void;
  onAddModule: () => void;
  onRemoveModule: (id: string) => void;
  onAddLesson: (t: Lesson["type"]) => void;
  onRemoveLesson: (id: string) => void;
  onFinal: () => void;
  selectedModule: Module | null;
}) {
  return (
    <div className="space-y-6">
      <CardShell
        title={selectedCourse ? `Modules — ${selectedCourse.title}` : "Modules"}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={onAddModule}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-black text-white hover:bg-gray-900"
              disabled={!selectedCourse}
            >
              <Plus className="h-4 w-4" /> Module
            </button>
            <button
              onClick={onFinal}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
              disabled={!selectedCourse}
              title="Adds a locked final assessment quiz"
            >
              <Shield className="h-4 w-4" /> Final
            </button>
          </div>
        }
      >
        {!selectedCourse ? (
          <div className="text-sm text-gray-600">Select a course first.</div>
        ) : (selectedCourse.modulesList ?? []).length === 0 ? (
          <div className="text-sm text-gray-600">
            No modules yet. Click “Module”.
          </div>
        ) : (
          <div className="space-y-3">
            {(selectedCourse.modulesList as Module[]).map((m, idx) => (
              <button
                key={m.id}
                onClick={() => onSelectModule(m.id)}
                className={`w-full text-left rounded-2xl border p-4 transition ${
                  selectedModuleId === m.id
                    ? "border-black/20 bg-black text-white"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">
                      {idx + 1}. {m.title}
                    </div>
                    <div
                      className={`text-xs mt-1 ${
                        selectedModuleId === m.id
                          ? "text-white/80"
                          : "text-gray-500"
                      }`}
                    >
                      Lessons: {m.lessons?.length || 0}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveModule(m.id);
                    }}
                    className={`inline-flex items-center justify-center h-10 w-10 rounded-xl border ${
                      selectedModuleId === m.id
                        ? "border-white/20 hover:bg-white/10"
                        : "border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                    }`}
                    title="Remove module"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardShell>

      <CardShell
        title="Lessons"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onAddLesson("text")}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
              disabled={!selectedModule}
            >
              <FileText className="h-4 w-4" /> Text
            </button>
            <button
              onClick={() => onAddLesson("video")}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
              disabled={!selectedModule}
            >
              <Video className="h-4 w-4" /> Video
            </button>
            <button
              onClick={() => onAddLesson("quiz")}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
              disabled={!selectedModule}
            >
              <ListChecks className="h-4 w-4" /> Quiz
            </button>
          </div>
        }
      >
        {!selectedModule ? (
          <div className="text-sm text-gray-600">
            Select a module to see lessons.
          </div>
        ) : (selectedModule.lessons || []).length === 0 ? (
          <div className="text-sm text-gray-600">No lessons yet. Add one.</div>
        ) : (
          <div className="space-y-2">
            {(selectedModule.lessons || []).map((l) => {
              const isFinal = !!(l as any).isFinalAssessment;
              return (
                <button
                  key={l.id}
                  onClick={() => onSelectLesson(l.id)}
                  className={`w-full text-left rounded-xl border px-3 py-3 transition ${
                    selectedLessonId === l.id
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold truncate">
                        {l.title} {isFinal ? "• Final" : ""}
                      </div>
                      <div
                        className={`text-xs mt-1 ${
                          selectedLessonId === l.id
                            ? "text-white/80"
                            : "text-gray-500"
                        }`}
                      >
                        Type: {l.type}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveLesson(l.id);
                      }}
                      className={`inline-flex items-center justify-center h-10 w-10 rounded-xl border ${
                        selectedLessonId === l.id
                          ? "border-white/20 hover:bg-white/10"
                          : "border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                      }`}
                      title="Remove lesson"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </CardShell>
    </div>
  );
}

function EditorPane({
  selectedCourse,
  selectedModule,
  selectedLesson,
  onUpdateCourse,
  onUpdateModule,
  onUpdateLesson,
  onDeleteCourse,
  LEVELS,
}: {
  selectedCourse: Course | null;
  selectedModule: Module | null;
  selectedLesson: Lesson | null;
  onUpdateCourse: (patch: Partial<Course>) => void;
  onUpdateModule: (patch: Partial<Module>) => void;
  onUpdateLesson: (patch: Partial<Lesson>) => void;
  onDeleteCourse: () => void;
  LEVELS: readonly string[];
}) {
  if (!selectedCourse) {
    return (
      <CardShell title="Editor">
        <div className="text-sm text-gray-600">Select a course to edit.</div>
      </CardShell>
    );
  }

  return (
    <div className="space-y-6">
      <CardShell
        title="Edit Course"
        action={
          <button
            onClick={onDeleteCourse}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        }
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-gray-700">Title</label>
            <input
              value={selectedCourse.title}
              onChange={(e) => onUpdateCourse({ title: e.target.value })}
              className="mt-2 w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Duration</label>
            <input
              value={selectedCourse.duration}
              onChange={(e) => onUpdateCourse({ duration: e.target.value })}
              className="mt-2 w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Level</label>
            <select
              value={selectedCourse.level}
              onChange={(e) => onUpdateCourse({ level: e.target.value as any })}
              className="mt-2 w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-gray-700">Category</label>
            <input
              value={selectedCourse.category}
              onChange={(e) => onUpdateCourse({ category: e.target.value })}
              className="mt-2 w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-gray-700">Description</label>
            <textarea
              value={selectedCourse.description}
              onChange={(e) => onUpdateCourse({ description: e.target.value })}
              rows={4}
              className="mt-2 w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
        </div>
      </CardShell>

      <CardShell title="Lesson Editor">
        {!selectedModule || !selectedLesson ? (
          <div className="text-sm text-gray-600">
            Select a module and lesson to edit content/video/quiz.
          </div>
        ) : (
          <LessonEditor
            module={selectedModule}
            lesson={selectedLesson}
            onPatchLesson={onUpdateLesson}
            onPatchModule={onUpdateModule}
          />
        )}
      </CardShell>
    </div>
  );
}

/* ---------- Lesson Editor ---------- */

function LessonEditor({
  module,
  lesson,
  onPatchLesson,
  onPatchModule,
}: {
  module: Module;
  lesson: Lesson;
  onPatchLesson: (patch: Partial<Lesson>) => void;
  onPatchModule: (patch: Partial<Module>) => void;
}) {
  const isFinal = !!(lesson as any).isFinalAssessment;

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-semibold text-gray-700">Module Title</label>
        <input
          value={module.title}
          onChange={(e) => onPatchModule({ title: e.target.value })}
          className="mt-2 w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-700">Lesson Title</label>
        <input
          value={lesson.title}
          onChange={(e) => onPatchLesson({ title: e.target.value })}
          className="mt-2 w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
        />
      </div>

      {isFinal ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
          Final Assessment is <b>locked</b> until all previous lessons are completed.
        </div>
      ) : null}

      {lesson.type === "text" && (
        <div>
          <label className="text-sm font-semibold text-gray-700">Markdown Content</label>
          <textarea
            value={lesson.content || ""}
            onChange={(e) => onPatchLesson({ content: e.target.value })}
            rows={12}
            className="mt-2 w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent font-mono text-sm"
          />
          <div className="text-xs text-gray-500 mt-2">Supports GFM markdown.</div>
        </div>
      )}

      {lesson.type === "video" && <VideoLessonEditor lesson={lesson} onPatch={onPatchLesson} />}

      {lesson.type === "quiz" && <QuizLessonEditor lesson={lesson} onPatch={onPatchLesson} />}

      <div className="rounded-xl border border-gray-200 p-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <input
            type="checkbox"
            checked={!!(lesson as any).isFinalAssessment}
            onChange={(e) =>
              onPatchLesson({
                isFinalAssessment: e.target.checked,
                gate: e.target.checked ? { requiresAllPreviousLessons: true } : lesson.gate,
              } as any)
            }
          />
          Mark as Final Assessment
        </label>
      </div>
    </div>
  );
}

function VideoLessonEditor({
  lesson,
  onPatch,
}: {
  lesson: Lesson;
  onPatch: (patch: Partial<Lesson>) => void;
}) {
  const source = (lesson.video ?? { kind: "mp4", url: "" }) as VideoSource;

  return (
    <div className="rounded-2xl border border-gray-200 p-4 space-y-4">
      <div className="font-semibold text-gray-900">Video Settings</div>

      <div>
        <label className="text-sm font-semibold text-gray-700">Source Type</label>
        <select
          value={source.kind}
          onChange={(e) => {
            const kind = e.target.value as VideoSource["kind"];
            if (kind === "mp4") onPatch({ video: { kind: "mp4", url: "" } as any });
            if (kind === "youtube") onPatch({ video: { kind: "youtube", id: "" } as any });
            if (kind === "idb") onPatch({ video: { kind: "idb", key: "", filename: "" } as any });
          }}
          className="mt-2 w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
        >
          <option value="mp4">MP4 URL</option>
          <option value="youtube">YouTube ID</option>
          <option value="idb">Upload (Browser Storage)</option>
        </select>
      </div>

      {source.kind === "mp4" && (
        <div>
          <label className="text-sm font-semibold text-gray-700">MP4 URL</label>
          <input
            value={(source as any).url || ""}
            onChange={(e) => onPatch({ video: { kind: "mp4", url: e.target.value } as any })}
            placeholder="https://.../video.mp4"
            className="mt-2 w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>
      )}

      {source.kind === "youtube" && (
        <div>
          <label className="text-sm font-semibold text-gray-700">YouTube Video ID</label>
          <input
            value={(source as any).id || ""}
            onChange={(e) => onPatch({ video: { kind: "youtube", id: e.target.value } as any })}
            placeholder="dQw4w9WgXcQ"
            className="mt-2 w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>
      )}

      {source.kind === "idb" && (
        <div className="space-y-3">
          <div className="text-sm text-gray-700">
            Upload stores the video in <b>IndexedDB</b> of this browser only.
          </div>

          <input
            type="file"
            accept="video/mp4,video/webm,video/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const { key, filename } = await idbSaveVideo(file);
              onPatch({ video: { kind: "idb", key, filename } as any });
            }}
          />

          <div className="text-xs text-gray-500">
            Current: <b>{(source as any).filename || (source as any).key || "No upload yet"}</b>
          </div>
        </div>
      )}
    </div>
  );
}

function QuizLessonEditor({
  lesson,
  onPatch,
}: {
  lesson: Lesson;
  onPatch: (patch: Partial<Lesson>) => void;
}) {
  const quiz = lesson.quiz ?? { passingPercent: 50, questions: [] };
  const patchQuiz = (q: any) => onPatch({ quiz: q });

  return (
    <div className="rounded-2xl border border-gray-200 p-4 space-y-4">
      <div className="font-semibold text-gray-900">Quiz Settings</div>

      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <label className="text-sm font-semibold text-gray-700">Passing %</label>
          <input
            type="number"
            min={0}
            max={100}
            value={quiz.passingPercent ?? 50}
            onChange={(e) => patchQuiz({ ...quiz, passingPercent: Number(e.target.value) })}
            className="mt-2 w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>

        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mt-6">
          <input
            type="checkbox"
            checked={!!quiz.shuffleQuestions}
            onChange={(e) => patchQuiz({ ...quiz, shuffleQuestions: e.target.checked })}
          />
          Shuffle Questions
        </label>

        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mt-6">
          <input
            type="checkbox"
            checked={!!quiz.shuffleOptions}
            onChange={(e) => patchQuiz({ ...quiz, shuffleOptions: e.target.checked })}
          />
          Shuffle Options
        </label>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="font-bold text-gray-900">Questions</div>
        <button
          onClick={() => patchQuiz({ ...quiz, questions: [...(quiz.questions || []), defaultQuizQuestion()] })}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-900 text-white hover:bg-black"
        >
          <Plus className="h-4 w-4" /> Add Question
        </button>
      </div>

      <div className="space-y-4">
        {(quiz.questions || []).map((q: any, idx: number) => (
          <div key={q.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-gray-900">Q{idx + 1}</div>
              <button
                onClick={() =>
                  patchQuiz({
                    ...quiz,
                    questions: (quiz.questions || []).filter((x: any) => x.id !== q.id),
                  })
                }
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" /> Remove
              </button>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Prompt</label>
              <input
                value={q.prompt}
                onChange={(e) => {
                  const next = (quiz.questions || []).map((x: any) =>
                    x.id === q.id ? { ...x, prompt: e.target.value } : x
                  );
                  patchQuiz({ ...quiz, questions: next });
                }}
                className="mt-2 w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {(q.options || []).map((opt: any) => (
                <div key={opt.id}>
                  <label className="text-sm font-semibold text-gray-700">Option {opt.id}</label>
                  <input
                    value={opt.text}
                    onChange={(e) => {
                      const next = (quiz.questions || []).map((x: any) => {
                        if (x.id !== q.id) return x;
                        return {
                          ...x,
                          options: (x.options || []).map((o: any) =>
                            o.id === opt.id ? { ...o, text: e.target.value } : o
                          ),
                        };
                      });
                      patchQuiz({ ...quiz, questions: next });
                    }}
                    className="mt-2 w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-gray-700">Correct Option</label>
                <select
                  value={q.correctOptionId}
                  onChange={(e) => {
                    const next = (quiz.questions || []).map((x: any) =>
                      x.id === q.id ? { ...x, correctOptionId: e.target.value } : x
                    );
                    patchQuiz({ ...quiz, questions: next });
                  }}
                  className="mt-2 w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  {(q.options || []).map((opt: any) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Explanation (optional)</label>
                <input
                  value={q.explanation || ""}
                  onChange={(e) => {
                    const next = (quiz.questions || []).map((x: any) =>
                      x.id === q.id ? { ...x, explanation: e.target.value } : x
                    );
                    patchQuiz({ ...quiz, questions: next });
                  }}
                  className="mt-2 w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>
          </div>
        ))}

        {(quiz.questions || []).length === 0 ? (
          <div className="text-sm text-gray-600">No questions. Add one.</div>
        ) : null}
      </div>
    </div>
  );
}
