
export interface UserStats {
  wpm: number;
  accuracy: number;
  realAccuracy: number;
  totalKeys: number;
  totalKeystrokes: number;
  errorCount: number;
  level: number;
  xp: number;
  unlockedStages: number[]; // Track specific unlocked stage numbers
  lessonStars: Record<string, number>;
  soundEnabled: boolean;
}

export interface Lesson {
  id: string;
  order: number;
  title: string;
  description: string;
  content: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'Basics' | 'Speed' | 'Stories' | 'AI';
  newKeys?: string[];
}

export interface HistoryRecord {
  date: string;
  wpm: number;
  accuracy: number;
  realAccuracy: number;
  lessonId: string;
  stars: number;
}

export enum GameState {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  FINISHED = 'FINISHED'
}

export type Finger = 
  | 'left-pinky' | 'left-ring' | 'left-middle' | 'left-index' 
  | 'thumb' 
  | 'right-index' | 'right-middle' | 'right-ring' | 'right-pinky';
