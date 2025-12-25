"use client";

import type { Course, User, ProgressMap, UserCourseProgress } from "../types";
import { courses as defaultCourses } from "./courses";

const USERS_KEY = "ssu_users_v1";
const COURSES_KEY = "ssu_courses_v1";
const PROGRESS_KEY_PREFIX = "ssu_progress_v1_";

// ✅ Hardcoded admin credentials
export const ADMIN_EMAIL = "admin@ssu.local";
export const ADMIN_PASSWORD = "SSU@12345";

type StoredUser = User & { password: string; createdAt: string };

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function seedIfEmpty() {
  const users = safeParse<StoredUser[]>(localStorage.getItem(USERS_KEY), []);
  const courses = safeParse<Course[]>(localStorage.getItem(COURSES_KEY), []);
  if (courses.length === 0) localStorage.setItem(COURSES_KEY, JSON.stringify(defaultCourses));
  if (users.length === 0) localStorage.setItem(USERS_KEY, JSON.stringify([]));
}

export function getCourses(): Course[] {
  seedIfEmpty();
  return safeParse<Course[]>(localStorage.getItem(COURSES_KEY), defaultCourses);
}

export function setCourses(courses: Course[]) {
  localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
}

export function getUsers(): StoredUser[] {
  seedIfEmpty();
  return safeParse<StoredUser[]>(localStorage.getItem(USERS_KEY), []);
}

export function addUser(user: Omit<User, "unlockedCourses">, password: string) {
  const users = getUsers();
  const exists = users.some((u) => u.email.toLowerCase() === user.email.toLowerCase());
  if (exists) throw new Error("User already exists.");

  const courses = getCourses();
  const firstCourseId = courses[0]?.id ?? "";

  const stored: StoredUser = {
    ...user,
    unlockedCourses: firstCourseId ? [firstCourseId] : [],
    password,
    createdAt: new Date().toISOString(),
  };

  users.push(stored);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  // init progress
  setProgressMap(stored.id, {});
  return stored;
}

export function findUserByEmail(email: string): StoredUser | null {
  const users = getUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export function updateUser(userId: string, patch: Partial<StoredUser>) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) return;
  users[idx] = { ...users[idx], ...patch };
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getProgressMap(userId: string): ProgressMap {
  const key = PROGRESS_KEY_PREFIX + userId;
  return safeParse<ProgressMap>(localStorage.getItem(key), {});
}

export function setProgressMap(userId: string, map: ProgressMap) {
  const key = PROGRESS_KEY_PREFIX + userId;
  localStorage.setItem(key, JSON.stringify(map));
}

export function markLessonComplete(userId: string, courseId: string, lessonId: string) {
  const map = getProgressMap(userId);
  const cur: UserCourseProgress = map[courseId] ?? { completedLessonIds: [] };
  if (!cur.completedLessonIds.includes(lessonId)) cur.completedLessonIds.push(lessonId);
  map[courseId] = cur;
  setProgressMap(userId, map);
}

export function setFinalResult(userId: string, courseId: string, score: number, passed: boolean) {
  const map = getProgressMap(userId);
  const cur: UserCourseProgress = map[courseId] ?? { completedLessonIds: [] };
  cur.finalScore = score;
  cur.finalPassed = passed;
  map[courseId] = cur;
  setProgressMap(userId, map);
}

export function unlockNextCourseForUser(userId: string, currentCourseId: string) {
  const courses = getCourses();
  const idx = courses.findIndex((c) => c.id === currentCourseId);
  if (idx < 0) return;

  const next = courses[idx + 1];
  if (!next) return;

  const u = getUsers().find((x) => x.id === userId);
  if (!u) return;

  const unlocked = new Set(u.unlockedCourses ?? []);
  unlocked.add(next.id);

  updateUser(userId, { unlockedCourses: Array.from(unlocked) });
}
