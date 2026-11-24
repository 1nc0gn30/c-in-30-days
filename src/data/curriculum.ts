export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface ExerciseRule {
  label: string;
  pattern: string;
  flags?: string;
  hint: string;
}

export interface Exercise {
  description: string;
  initialCode: string;
  solutionCode: string;
  expectedOutput: string;
  hint: string;
  rules: ExerciseRule[];
  requiresMain?: boolean;
}

export interface DayContent {
  day: number;
  week: number;
  title: string;
  summary: string;
  concepts: string[];
  lessonMarkdown: string;
  quiz: QuizQuestion[];
  exercise: Exercise;
}

export interface WeekMeta {
  week: number;
  title: string;
  range: string;
}

export const WEEKS: WeekMeta[] = [
  { week: 1, title: "Foundations & Control Flow", range: "Days 1–6" },
  { week: 2, title: "Loops, Functions & Scope", range: "Days 7–12" },
  { week: 3, title: "Arrays, Strings & Pointers", range: "Days 13–18" },
  { week: 4, title: "Heap Memory, Structs & Files", range: "Days 19–24" },
  { week: 5, title: "Systems C & Data Structures", range: "Days 25–30" },
];

import { curriculumPart1 } from './curriculumPart1';
import { curriculumPart2 } from './curriculumPart2';

export const curriculum: DayContent[] = [...curriculumPart1, ...curriculumPart2];
