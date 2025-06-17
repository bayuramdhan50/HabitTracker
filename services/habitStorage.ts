import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, HabitLog, HabitStatistics, HabitStreak } from '../types/habit';

// Storage keys
const HABITS_STORAGE_KEY = 'habits';
const HABIT_LOGS_STORAGE_KEY = 'habit_logs';
const HABIT_STREAKS_STORAGE_KEY = 'habit_streaks';
const HABIT_STATISTICS_STORAGE_KEY = 'habit_statistics';

// Habits CRUD operations
export const getHabits = async (): Promise<Habit[]> => {
  try {
    const habitsJson = await AsyncStorage.getItem(HABITS_STORAGE_KEY);
    return habitsJson ? JSON.parse(habitsJson) : [];
  } catch (error) {
    console.error('Error getting habits:', error);
    return [];
  }
};

export const getHabit = async (id: string): Promise<Habit | null> => {
  try {
    const habits = await getHabits();
    return habits.find(habit => habit.id === id) || null;
  } catch (error) {
    console.error('Error getting habit:', error);
    return null;
  }
};

export const saveHabit = async (habit: Habit): Promise<boolean> => {
  try {
    const habits = await getHabits();
    const existingHabitIndex = habits.findIndex(h => h.id === habit.id);
    
    if (existingHabitIndex >= 0) {
      // Update existing habit
      habits[existingHabitIndex] = {
        ...habit,
        updatedAt: Date.now(),
      };
    } else {
      // Add new habit
      habits.push({
        ...habit,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    
    await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
    return true;
  } catch (error) {
    console.error('Error saving habit:', error);
    return false;
  }
};

export const deleteHabit = async (id: string): Promise<boolean> => {
  try {
    const habits = await getHabits();
    const filteredHabits = habits.filter(habit => habit.id !== id);
    
    await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(filteredHabits));
    
    // Also clean up related data
    await deleteHabitLogs(id);
    await deleteHabitStreak(id);
    await deleteHabitStatistics(id);
    
    return true;
  } catch (error) {
    console.error('Error deleting habit:', error);
    return false;
  }
};

// Habit Logs operations
export const getHabitLogs = async (habitId?: string): Promise<HabitLog[]> => {
  try {
    const logsJson = await AsyncStorage.getItem(HABIT_LOGS_STORAGE_KEY);
    const logs: HabitLog[] = logsJson ? JSON.parse(logsJson) : [];
    
    if (habitId) {
      return logs.filter(log => log.habitId === habitId);
    }
    
    return logs;
  } catch (error) {
    console.error('Error getting habit logs:', error);
    return [];
  }
};

export const getHabitLogsByDate = async (date: string): Promise<HabitLog[]> => {
  try {
    const logs = await getHabitLogs();
    return logs.filter(log => log.date === date);
  } catch (error) {
    console.error('Error getting habit logs by date:', error);
    return [];
  }
};

export const saveHabitLog = async (log: HabitLog): Promise<boolean> => {
  try {
    const logs = await getHabitLogs();
    const existingLogIndex = logs.findIndex(l => l.habitId === log.habitId && l.date === log.date);
    
    if (existingLogIndex >= 0) {
      // Update existing log
      logs[existingLogIndex] = {
        ...log,
        timestamp: Date.now(),
      };
    } else {
      // Add new log
      logs.push({
        ...log,
        id: log.id || `${log.habitId}_${log.date}_${Date.now()}`,
        timestamp: Date.now(),
      });
    }
    
    await AsyncStorage.setItem(HABIT_LOGS_STORAGE_KEY, JSON.stringify(logs));
    
    // Update streak
    await updateHabitStreak(log.habitId);
    
    // Update statistics
    await updateHabitStatistics(log.habitId);
    
    return true;
  } catch (error) {
    console.error('Error saving habit log:', error);
    return false;
  }
};

export const deleteHabitLogs = async (habitId: string): Promise<boolean> => {
  try {
    const logs = await getHabitLogs();
    const filteredLogs = logs.filter(log => log.habitId !== habitId);
    
    await AsyncStorage.setItem(HABIT_LOGS_STORAGE_KEY, JSON.stringify(filteredLogs));
    return true;
  } catch (error) {
    console.error('Error deleting habit logs:', error);
    return false;
  }
};

// Streak operations
export const getHabitStreak = async (habitId: string): Promise<HabitStreak | null> => {
  try {
    const streaksJson = await AsyncStorage.getItem(HABIT_STREAKS_STORAGE_KEY);
    const streaks: HabitStreak[] = streaksJson ? JSON.parse(streaksJson) : [];
    
    return streaks.find(streak => streak.habitId === habitId) || null;
  } catch (error) {
    console.error('Error getting habit streak:', error);
    return null;
  }
};

export const updateHabitStreak = async (habitId: string): Promise<boolean> => {
  try {
    const habit = await getHabit(habitId);
    if (!habit) return false;
    
    const logs = await getHabitLogs(habitId);
    const sortedLogs = logs.filter(log => log.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Get the streaks
    const streaksJson = await AsyncStorage.getItem(HABIT_STREAKS_STORAGE_KEY);
    const streaks: HabitStreak[] = streaksJson ? JSON.parse(streaksJson) : [];
    
    let streak = streaks.find(s => s.habitId === habitId);
    if (!streak) {
      streak = {
        habitId,
        currentStreak: 0,
        longestStreak: 0
      };
      streaks.push(streak);
    }
    
    if (sortedLogs.length === 0) {
      streak.currentStreak = 0;
      streak.lastCompletedDate = undefined;
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lastCompletedDate = new Date(sortedLogs[0].date);
      lastCompletedDate.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Calculate current streak
      if (lastCompletedDate.getTime() === today.getTime() || 
          lastCompletedDate.getTime() === yesterday.getTime()) {
        // Completed today or yesterday - continue streak
        let currentStreak = 1;
        let checkDate = new Date(lastCompletedDate);
        
        for (let i = 1; i < sortedLogs.length; i++) {
          checkDate.setDate(checkDate.getDate() - 1);
          const logDate = new Date(sortedLogs[i].date);
          logDate.setHours(0, 0, 0, 0);
          
          if (logDate.getTime() === checkDate.getTime()) {
            currentStreak++;
          } else {
            break;
          }
        }
        
        streak.currentStreak = currentStreak;
      } else {
        // Streak broken
        streak.currentStreak = 0;
      }
      
      streak.lastCompletedDate = sortedLogs[0].date;
      streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
    }
    
    // Save updated streaks
    await AsyncStorage.setItem(HABIT_STREAKS_STORAGE_KEY, JSON.stringify(streaks));
    return true;
  } catch (error) {
    console.error('Error updating habit streak:', error);
    return false;
  }
};

export const deleteHabitStreak = async (habitId: string): Promise<boolean> => {
  try {
    const streaksJson = await AsyncStorage.getItem(HABIT_STREAKS_STORAGE_KEY);
    let streaks: HabitStreak[] = streaksJson ? JSON.parse(streaksJson) : [];
    
    streaks = streaks.filter(streak => streak.habitId !== habitId);
    await AsyncStorage.setItem(HABIT_STREAKS_STORAGE_KEY, JSON.stringify(streaks));
    return true;
  } catch (error) {
    console.error('Error deleting habit streak:', error);
    return false;
  }
};

// Statistics operations
export const getHabitStatistics = async (habitId: string): Promise<HabitStatistics | null> => {
  try {
    const statsJson = await AsyncStorage.getItem(HABIT_STATISTICS_STORAGE_KEY);
    const stats: HabitStatistics[] = statsJson ? JSON.parse(statsJson) : [];
    
    return stats.find(stat => stat.habitId === habitId) || null;
  } catch (error) {
    console.error('Error getting habit statistics:', error);
    return null;
  }
};

export const updateHabitStatistics = async (habitId: string): Promise<boolean> => {
  try {
    const habit = await getHabit(habitId);
    if (!habit) return false;
    
    const logs = await getHabitLogs(habitId);
    const completedLogs = logs.filter(log => log.completed);
    
    // Get statistics
    const statsJson = await AsyncStorage.getItem(HABIT_STATISTICS_STORAGE_KEY);
    let statistics: HabitStatistics[] = statsJson ? JSON.parse(statsJson) : [];
    
    let habitStats = statistics.find(stat => stat.habitId === habitId);
    if (!habitStats) {
      habitStats = {
        habitId,
        totalCompleted: 0,
        totalPossible: 0,
        completionRate: 0,
        monthlyStats: {}
      };
      statistics.push(habitStats);
    }
    
    // Calculate total completed and possible
    habitStats.totalCompleted = completedLogs.length;
    
    // Calculate possible based on habit frequency and creation date
    const creationDate = new Date(habit.createdAt);
    const today = new Date();
    let totalDays = Math.floor((today.getTime() - creationDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    
    // Adjust totalPossible based on frequency
    switch (habit.frequency.type) {
      case 'daily':
        habitStats.totalPossible = totalDays;
        break;
      case 'weekly':
        if (habit.frequency.days && habit.frequency.days.length > 0) {
          let possibleDays = 0;
          for (let i = 0; i < totalDays; i++) {
            const date = new Date(creationDate);
            date.setDate(date.getDate() + i);
            if (habit.frequency.days.includes(date.getDay())) {
              possibleDays++;
            }
          }
          habitStats.totalPossible = possibleDays;
        } else {
          habitStats.totalPossible = Math.ceil(totalDays / 7);
        }
        break;
      case 'custom':
        if (habit.frequency.customInterval && habit.frequency.customInterval > 0) {
          habitStats.totalPossible = Math.ceil(totalDays / habit.frequency.customInterval);
        } else {
          habitStats.totalPossible = totalDays;
        }
        break;
      default:
        habitStats.totalPossible = totalDays;
    }
    
    // Calculate completion rate
    habitStats.completionRate = habitStats.totalPossible > 0 
      ? habitStats.totalCompleted / habitStats.totalPossible 
      : 0;
    
    // Calculate monthly stats
    habitStats.monthlyStats = {};
    
    logs.forEach(log => {
      const date = new Date(log.date);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!habitStats.monthlyStats[month]) {
        habitStats.monthlyStats[month] = {
          completed: 0,
          possible: 0,
          rate: 0
        };
      }
      
      if (log.completed) {
        habitStats.monthlyStats[month].completed++;
      }
      
      // Increment possible days based on frequency
      habitStats.monthlyStats[month].possible++;
      
      // Update rate
      habitStats.monthlyStats[month].rate = 
        habitStats.monthlyStats[month].completed / habitStats.monthlyStats[month].possible;
    });
    
    // Save updated statistics
    await AsyncStorage.setItem(HABIT_STATISTICS_STORAGE_KEY, JSON.stringify(statistics));
    return true;
  } catch (error) {
    console.error('Error updating habit statistics:', error);
    return false;
  }
};

export const deleteHabitStatistics = async (habitId: string): Promise<boolean> => {
  try {
    const statsJson = await AsyncStorage.getItem(HABIT_STATISTICS_STORAGE_KEY);
    let statistics: HabitStatistics[] = statsJson ? JSON.parse(statsJson) : [];
    
    statistics = statistics.filter(stat => stat.habitId !== habitId);
    await AsyncStorage.setItem(HABIT_STATISTICS_STORAGE_KEY, JSON.stringify(statistics));
    return true;
  } catch (error) {
    console.error('Error deleting habit statistics:', error);
    return false;
  }
};
