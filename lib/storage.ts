"use client";

import type { Course, ProgressMap, User, UserCourseProgress, VideoSource } from "../types";
import { courses as seedCourses } from "../data/courses";

/** =========================
 *  Events
 ========================= */
export const EVENTS = {
  USERS_UPDATED: "ssu:users_updated",
  COURSES_UPDATED: "ssu:courses_updated",
  AUTH_UPDATED: "ssu:auth_updated",
  PROGRESS_UPDATED: "ssu:progress_updated",
} as const;

/** =========================
 *  LocalStorage Keys
 ========================= */
const LS_USERS = "ssu:users";
const LS_COURSES = "ssu:courses";
const LS_CURRENT_USER = "ssu:currentUser";
const LS_PROGRESS_PREFIX = "ssu:progress:"; // + userId

const isBrowser = typeof window !== "undefined";

/** =========================
 *  Small Helpers
 ========================= */
export function slugifyId(input: string) {
  return (input || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function emit(name: string) {
  if (!isBrowser) return;
  window.dispatchEvent(new Event(name));
}

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      (data as any)?.message ||
      (res.status === 401 ? "Unauthorized" : res.status === 403 ? "Forbidden" : "Request failed");
    throw new Error(msg);
  }

  return data as T;
}

/** =========================
 *  USERS
 ========================= */
export function loadUsers(): User[] {
  if (!isBrowser) return [];
  return safeParse<User[]>(localStorage.getItem(LS_USERS), []);
}

export function saveUsers(users: User[]) {
  if (!isBrowser) return;
  localStorage.setItem(LS_USERS, JSON.stringify(users));
  emit(EVENTS.USERS_UPDATED);
}

export function upsertUser(user: User) {
  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === user.id);
  const next = [...users];
  if (idx >= 0) next[idx] = user;
  else next.unshift(user);
  saveUsers(next);
}

export function setCurrentUser(user: User | null) {
  if (!isBrowser) return;
  if (!user) localStorage.removeItem(LS_CURRENT_USER);
  else localStorage.setItem(LS_CURRENT_USER, JSON.stringify(user));
  emit(EVENTS.AUTH_UPDATED);
}

export function getCurrentUser(): User | null {
  if (!isBrowser) return null;
  return safeParse<User | null>(localStorage.getItem(LS_CURRENT_USER), null);
}

/** =========================
 *  COURSES
 ========================= */
export function normalizeCourses(raw: Course[]): Course[] {
  return (raw || []).map((c) => ({
    ...c,
    modulesList: Array.isArray(c.modulesList) ? c.modulesList : [],
    modules: typeof c.modules === "number" ? c.modules : c.modulesList?.length || 0,
    progress: typeof c.progress === "number" ? c.progress : 0,
    prerequisites: Array.isArray(c.prerequisites) ? c.prerequisites : [],
  }));
}

export function loadCourses(): Course[] {
  if (!isBrowser) return seedCourses as Course[];

  const stored = safeParse<Course[] | null>(localStorage.getItem(LS_COURSES), null);
  if (stored && Array.isArray(stored) && stored.length) return normalizeCourses(stored);

  localStorage.setItem(LS_COURSES, JSON.stringify(seedCourses));
  emit(EVENTS.COURSES_UPDATED);
  return normalizeCourses(seedCourses as Course[]);
}

export function saveCourses(courses: Course[]) {
  if (!isBrowser) return;
  localStorage.setItem(LS_COURSES, JSON.stringify(normalizeCourses(courses)));
  emit(EVENTS.COURSES_UPDATED);
}

/** =========================
 *  COURSES (REMOTE DB)
 ========================= */
export async function syncCoursesFromServer(): Promise<Course[]> {
  const data = await fetchJSON<{ ok: boolean; courses: Course[] }>("/api/auth/courses", {
    method: "GET",
  });

  const normalized = normalizeCourses(data.courses || []);
  // cache locally so app loads fast next time too
  saveCourses(normalized);
  return normalized;
}

export async function saveCoursesRemote(courses: Course[]): Promise<void> {
  await fetchJSON<{ ok: boolean }>("/api/auth/courses", {
    method: "PUT",
    body: JSON.stringify({ courses: normalizeCourses(courses) }),
  });

  // also keep local cache in sync
  saveCourses(courses);
}

/** =========================
 *  PROGRESS (per user)
 ========================= */
export function loadProgressMap(userId: string): ProgressMap {
  if (!isBrowser) return {};
  return safeParse<ProgressMap>(localStorage.getItem(LS_PROGRESS_PREFIX + userId), {});
}

export function saveProgressMap(userId: string, map: ProgressMap) {
  if (!isBrowser) return;
  localStorage.setItem(LS_PROGRESS_PREFIX + userId, JSON.stringify(map));
  emit(EVENTS.PROGRESS_UPDATED);
}

export function getCourseUserProgress(map: ProgressMap, courseId: string): UserCourseProgress {
  return map[courseId] ?? { completedLessonIds: [] };
}

export function calcCourseProgressPct(course: Course, userProgress: UserCourseProgress | undefined): number {
  const total = course.modulesList?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0;
  if (!total) return 0;
  const done = userProgress?.completedLessonIds?.length || 0;
  return Math.max(0, Math.min(100, Math.round((done / total) * 100)));
}

export function isCourseUnlocked(_user: User | null, _courseId: string): boolean {
  return true;
}

export function unlockNextCourseIfEligible(_userId: string, _courseId: string) {
  return;
}

export function markLessonCompleteForUser(params: {
  userId: string;
  courseId: string;
  lessonId: string;
  finalScore?: number;
}) {
  const { userId, courseId, lessonId, finalScore } = params;

  const map = loadProgressMap(userId);
  const current = getCourseUserProgress(map, courseId);

  const set = new Set(current.completedLessonIds || []);
  set.add(lessonId);

  const next: UserCourseProgress = {
    ...current,
    completedLessonIds: Array.from(set),
    finalScore: typeof finalScore === "number" ? finalScore : current.finalScore,
  };

  const updated: ProgressMap = { ...map, [courseId]: next };
  saveProgressMap(userId, updated);
}

/** =========================
 *  IndexedDB Video Store (optional upload)
 ========================= */
const IDB_DB = "ssu-media-db";
const IDB_STORE = "videos";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isBrowser) return reject(new Error("No browser"));
    const req = indexedDB.open(IDB_DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function idbSaveVideo(file: File): Promise<{ key: string; filename: string }> {
  const key = `vid_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(file, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  return { key, filename: file.name };
}

export async function idbGetVideoObjectUrl(key: string): Promise<string> {
  const db = await openDB();
  const blob = await new Promise<Blob | File | null>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readonly");
    const req = tx.objectStore(IDB_STORE).get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
  if (!blob) throw new Error("Video not found");
  return URL.createObjectURL(blob);
}

export async function resolveVideoUrl(source: VideoSource): Promise<string> {
  if (source.kind === "mp4") return source.url;
  if (source.kind === "youtube") return `https://www.youtube.com/embed/${source.id}?rel=0&modestbranding=1`;
  return idbGetVideoObjectUrl(source.key);
}
