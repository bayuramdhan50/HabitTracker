export type Habit = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  frequency: {
    type: 'daily' | 'weekly' | 'custom';
    days?: number[]; // 0-6 for days of the week (Sunday-Saturday)
    customInterval?: number; // Number of days for custom interval
  };
  reminderTime?: string; // time in HH:MM format
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
};

export type HabitLog = {
  id: string;
  habitId: string;
  date: string; // ISO date string YYYY-MM-DD
  completed: boolean;
  timestamp: number; // timestamp when the habit was marked complete/incomplete
  notes?: string;
};

export type HabitStreak = {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string; // ISO date string YYYY-MM-DD
};

export type HabitStatistics = {
  habitId: string;
  totalCompleted: number;
  totalPossible: number; // Number of days the habit was supposed to be done
  completionRate: number; // totalCompleted / totalPossible
  monthlyStats: {
    [month: string]: {
      completed: number;
      possible: number;
      rate: number;
    };
  };
};

export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon?: string;
  unlocked: boolean;
  unlockedAt?: number; // timestamp
  progress?: {
    current: number;
    target: number;
  };
};
