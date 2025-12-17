// types.ts (FULL UPDATED)

export type UserRole = "admin" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;

  // optional so demo/admin logins won't break
  enrolledCourses?: string[];
}

export type LessonType = "text" | "video" | "slides" | "quiz";

export type VideoSource =
  | { kind: "mp4"; url: string }
  | { kind: "youtube"; id: string }
  | { kind: "vimeo"; id: string };

export type SlidesSource =
  | { kind: "pdf"; url: string }
  | { kind: "link"; url: string };

export interface QuizOption {
  id: string; // "A", "B", etc
  text: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation?: string;
}

export interface QuizData {
  passingPercent: number; // e.g. 70
  questions: QuizQuestion[];
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;

  // text
  content?: string;

  // back-compat for mp4
  url?: string;

  // recommended
  video?: VideoSource;

  slides?: SlidesSource;

  // quiz
  quiz?: QuizData;

  // tracking
  completed: boolean;

  // assessment/locking
  isFinalAssessment?: boolean;
  gate?: {
    requiresAllPreviousLessons?: boolean;
  };

  durationMin?: number;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";

export interface Course {
  id: string;
  title: string;
  description: string;

  level: CourseLevel;
  category: string;
  duration: string;

  modules: number;
  progress: number;

  modulesList: Module[];

  thumbnail?: string;
  tags?: string[];
}
