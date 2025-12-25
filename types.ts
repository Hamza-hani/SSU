export type UserRole = "admin" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;

  unlockedCourses?: string[];
  enrolledCourses?: string[];
}

export type LessonType = "text" | "video" | "quiz";

export type VideoSource =
  | { kind: "mp4"; url: string }
  | { kind: "youtube"; id: string }
  | { kind: "idb"; key: string; filename?: string };

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

export interface LessonGate {
  requiresAllPreviousLessons?: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;

  content?: string;
  video?: VideoSource;

  url?: string;
  source?: VideoSource;

  completed?: boolean;

  isFinalAssessment?: boolean;
  gate?: LessonGate;

  quiz?: Quiz;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

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

export interface UserCourseProgress {
  completedLessonIds: string[];
  finalScore?: number;
  finalPassed?: boolean;
}

export type ProgressMap = Record<string, UserCourseProgress>;
