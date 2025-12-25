// types.ts
export type UserRole = "admin" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;

  // optional
  unlockedCourses?: string[];
  enrolledCourses?: string[];
}

/** Supported lesson types */
export type LessonType = "text" | "video" | "quiz";

/** Video source options */
export type VideoSource =
  | { kind: "mp4"; url: string }
  | { kind: "youtube"; id: string }
  | { kind: "idb"; key: string; filename?: string };

/** Quiz types */
export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation?: string;
}

export interface Quiz {
  passingPercent?: number;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  questions: QuizQuestion[];
}

/** Gate rules */
export interface LessonGate {
  requiresAllPreviousLessons?: boolean;
}

/** Lesson */
export interface Lesson {
  id: string;
  title: string;
  type: LessonType;

  // text
  content?: string;

  // video (AdminPanel uses lesson.video ✅)
  video?: VideoSource;

  // (optional legacy/compat if you use elsewhere)
  url?: string;
  source?: VideoSource;

  completed?: boolean;

  // final assessment helpers
  isFinalAssessment?: boolean;
  gate?: LessonGate;

  // quiz
  quiz?: Quiz;
}

/** Module */
export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

/** Course */
export interface Course {
  id: string;
  title: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  duration: string;

  modules: number;
  progress?: number;

  modulesList: Module[];

  prerequisites?: string[];
}

/** Progress per user per course */
export interface UserCourseProgress {
  completedLessonIds: string[];
  finalScore?: number;
}

/** Map: courseId => progress */
export type ProgressMap = Record<string, UserCourseProgress>;
