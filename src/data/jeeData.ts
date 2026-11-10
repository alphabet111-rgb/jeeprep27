export interface Task {
  id: string;
  title: string;
  subject: 'Physics' | 'Chemistry' | 'Mathematics' | 'General';
  targetQuestions?: number;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface DailyQuestionsState {
  date: string;
  goal: number; // 100 questions daily goal
  physics: number;
  chemistry: number;
  mathematics: number;
  history: Record<string, { physics: number; chemistry: number; mathematics: number; total: number }>;
}

export interface ExamMilestone {
  id: string;
  title: string;
  dateStr: string; // YYYY-MM-DD
  isOfficial?: boolean;
}

export interface MockTest {
  id: string;
  name: string;
  date: string;
  physicsMarks: number;
  chemistryMarks: number;
  mathsMarks: number;
  sillyMistakes: number;
  notes: string;
}

export const INITIAL_TASKS: Task[] = [
  {
    id: 't-1',
    title: 'Rotational Motion: HCV Exercise 1 (Q20 - Q45)',
    subject: 'Physics',
    targetQuestions: 25,
    completed: false,
    createdAt: '2026-11-08'
  },
  {
    id: 't-2',
    title: 'Aldehydes & Ketones: NCERT Named Reactions + 30 PYQs',
    subject: 'Chemistry',
    targetQuestions: 30,
    completed: false,
    createdAt: '2026-11-08'
  },
  {
    id: 't-3',
    title: 'Definite Integration: King\'s Property & Leibnitz Rule problem set',
    subject: 'Mathematics',
    targetQuestions: 25,
    completed: false,
    createdAt: '2026-11-08'
  },
  {
    id: 't-4',
    title: 'Revise short formula notes for Modern Physics (Photoelectric + Bohr)',
    subject: 'Physics',
    completed: false,
    createdAt: '2026-11-08'
  }
];

export const INITIAL_DAILY_QS: DailyQuestionsState = {
  date: '2026-11-08',
  goal: 100,
  physics: 0,
  chemistry: 0,
  mathematics: 0,
  history: {}
};

export const INITIAL_EXAMS: ExamMilestone[] = [
  {
    id: 'ex-1',
    title: 'JEE Main (January Session)',
    dateStr: '2027-01-20',
    isOfficial: true
  },
  {
    id: 'ex-2',
    title: 'JEE Main (April Session)',
    dateStr: '2027-04-01',
    isOfficial: true
  }
];

export const INITIAL_MOCKS: MockTest[] = [
  {
    id: 'm-1',
    name: 'Allen Score JEE Main CBT 04',
    date: '2026-11-05',
    physicsMarks: 76,
    chemistryMarks: 72,
    mathsMarks: 58,
    sillyMistakes: 3,
    notes: 'Calculation errors in coordinate geometry; revise conic sections.'
  },
  {
    id: 'm-2',
    name: 'MathonGo Full Test 02',
    date: '2026-10-29',
    physicsMarks: 68,
    chemistryMarks: 80,
    mathsMarks: 48,
    sillyMistakes: 4,
    notes: 'Chemistry went great. Needed better time management in Maths.'
  }
];

export interface AppDatabasePayload {
  tasks: Task[];
  dailyQs: DailyQuestionsState;
  exams: ExamMilestone[];
  mocks: MockTest[];
  journal: Record<string, string>;
  updatedAt: string;
}
