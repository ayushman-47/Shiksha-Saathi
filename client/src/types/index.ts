export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  currentClass?: string;
  board?: string;
  preferredLanguage?: string;
  streakDays?: number;
  totalDoubtsResolved?: number;
  totalTestsCompleted?: number;
}

export interface Subject {
  id: number;
  name: string;
  nameHindi?: string;
  icon?: string;
  color?: string;
}

export interface Chapter {
  id: number;
  title: string;
  titleHindi?: string;
  subjectId: number;
  class: string;
  board: string;
  chapterNumber?: number;
  description?: string;
  pdfUrl?: string;
}

export interface Doubt {
  id: string;
  userId: string;
  question: string;
  questionType: 'text' | 'voice' | 'image';
  questionImageUrl?: string;
  answer?: string;
  answerAudioUrl?: string;
  subjectId?: number;
  chapterId?: number;
  class?: string;
  board?: string;
  language?: string;
  status: 'pending' | 'resolved' | 'failed';
  createdAt: Date;
  resolvedAt?: Date;
}

export interface VideoLecture {
  id: number;
  title: string;
  titleHindi?: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  subjectId: number;
  chapterId?: number;
  class: string;
  board: string;
  language?: string;
  isDownloadable?: boolean;
}

export interface Test {
  id: number;
  title: string;
  titleHindi?: string;
  description?: string;
  subjectId: number;
  chapterId?: number;
  class: string;
  board: string;
  testType: 'mcq' | 'subjective' | 'mixed';
  duration?: number;
  totalMarks?: number;
  passingMarks?: number;
  questions: TestQuestion[];
}

export interface TestQuestion {
  id: number;
  question: string;
  options?: string[];
  correctAnswer?: number;
  marks: number;
  explanation?: string;
}

export interface TestAttempt {
  id: number;
  userId: string;
  testId: number;
  answers: Record<string, any>;
  score?: number;
  totalMarks?: number;
  timeTaken?: number;
  status: 'in_progress' | 'completed' | 'submitted';
  startedAt: Date;
  completedAt?: Date;
}

export interface StudyPlan {
  id: number;
  userId: string;
  title: string;
  tasks: StudyTask[];
  targetDate?: string;
  status: 'active' | 'completed' | 'paused';
  createdAt: Date;
  updatedAt: Date;
}

export interface StudyTask {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface SocialMediaLink {
  id: number;
  platform: string;
  url: string;
  icon?: string;
  isActive: boolean;
}

export interface DashboardData {
  user: User;
  todayProgress: number;
  recentDoubts: Doubt[];
  recentTests: TestAttempt[];
  studyPlan: StudyPlan | null;
}
