export interface TaskTemplate {
  id: string;
  text: string;
  createdAt: number;
}

export interface TaskProgress {
  id: string;
  text: string;
  completed: boolean;
}

export type EventCategory = 'learning' | 'entertainment' | 'finance' | 'general' | 'health' | 'social' | 'work' | 'travel';

export interface DailyEvent {
  id: string;
  time: string; // HH:mm format
  text: string;
  category: EventCategory;
}

export interface TimeBlock {
  id: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  activity: string;
  emoji?: string;
}

export interface DayLog {
  date: string; // YYYY-MM-DD format
  completed: boolean; // Marked with a cross
  tasks: TaskProgress[]; // State of tasks on that specific day
  note?: string; // Daily optional note (legacy)
  events?: DailyEvent[]; // New structured events journal
  timeBlocks?: TimeBlock[]; // Schedule blocks
}

export interface TrackerState {
  logs: Record<string, DayLog>; // Keyed by YYYY-MM-DD
  templates: TaskTemplate[];
}
