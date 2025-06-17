import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Alert } from 'react-native';
import {
    deleteHabit,
    getHabitLogs,
    getHabits,
    getHabitStatistics,
    getHabitStreak,
    saveHabit,
    saveHabitLog,
} from '../services/habitStorage';
// Temporarily disable notification service
// import * as NotificationService from '../services/notificationService';
import { Habit, HabitLog, HabitStatistics, HabitStreak } from '../types/habit';

interface HabitContextType {
  habits: Habit[];
  loading: boolean;
  refreshHabits: () => Promise<void>;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Habit | null>;
  updateHabit: (habit: Habit) => Promise<boolean>;
  removeHabit: (id: string) => Promise<boolean>;
  getHabitById: (id: string) => Habit | undefined;
  toggleHabitCompletion: (habitId: string, date: string, notes?: string) => Promise<boolean>;
  isHabitCompletedOnDate: (habitId: string, date: string) => Promise<boolean>;
  getHabitLogsForDate: (date: string) => Promise<HabitLog[]>;
  getHabitLogsForHabit: (habitId: string) => Promise<HabitLog[]>;
  getStreak: (habitId: string) => Promise<HabitStreak | null>;
  getStatistics: (habitId: string) => Promise<HabitStatistics | null>;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export function HabitProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  // Initialize the context and load habits
  useEffect(() => {
    refreshHabits();
    // Temporarily disable notification service
    // registerForPushNotificationsAsync();
    loadAllHabitLogs();
  }, []);

  // Load all habit logs
  const loadAllHabitLogs = async () => {
    try {
      const logs = await getHabitLogs();
      setHabitLogs(logs);
    } catch (error) {
      console.error('Error loading habit logs:', error);
    }
  };

  // Refresh habits from storage
  const refreshHabits = async () => {
    setLoading(true);
    try {
      const loadedHabits = await getHabits();
      setHabits(loadedHabits);
      await loadAllHabitLogs();
    } catch (error) {
      console.error('Error refreshing habits:', error);
      Alert.alert('Error', 'Failed to load habits.');
    } finally {
      setLoading(false);
    }
  };

  // Get a habit by ID
  const getHabitById = (id: string) => {
    return habits.find((h) => h.id === id);
  };

  // Add a new habit
  const addHabit = async (habitData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newHabit: Habit = {
        ...habitData,
        id: `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const success = await saveHabit(newHabit);
        if (success) {
        // Temporarily disable notification service
        // // Schedule notification if reminder is set
        // if (newHabit.reminderTime) {
        //   await scheduleHabitReminder(newHabit);
        // }
        
        await refreshHabits();
        return newHabit;
      }
      return null;
    } catch (error) {
      console.error('Error adding habit:', error);
      Alert.alert('Error', 'Failed to add habit.');
      return null;
    }
  };

  // Update an existing habit
  const updateHabit = async (habit: Habit) => {
    try {
      const success = await saveHabit(habit);
        if (success) {
        // Temporarily disable notification service
        // // Update notification if reminder is set
        // if (habit.reminderTime) {
        //   await scheduleHabitReminder(habit);
        // } else {
        //   await cancelHabitReminder(habit.id);
        // }
        
        await refreshHabits();
      }
      
      return success;
    } catch (error) {
      console.error('Error updating habit:', error);
      Alert.alert('Error', 'Failed to update habit.');
      return false;
    }
  };

  // Remove a habit
  const removeHabit = async (id: string) => {
    try {      // Temporarily disable notification service
      // // Cancel any scheduled notifications
      // await cancelHabitReminder(id);
      
      const success = await deleteHabit(id);
      
      if (success) {
        await refreshHabits();
      }
      
      return success;
    } catch (error) {
      console.error('Error removing habit:', error);
      Alert.alert('Error', 'Failed to delete habit.');
      return false;
    }
  };

  // Toggle habit completion for a specific date
  const toggleHabitCompletion = async (habitId: string, date: string, notes?: string) => {
    try {
      const existingLogs = await getHabitLogs(habitId);
      const logForDate = existingLogs.find(
        (log) => log.habitId === habitId && log.date === date
      );
      
      const newLog: HabitLog = {
        id: logForDate?.id || `log_${habitId}_${date}_${Date.now()}`,
        habitId,
        date,
        completed: logForDate ? !logForDate.completed : true,
        timestamp: Date.now(),
        notes: notes || logForDate?.notes,
      };
      
      const success = await saveHabitLog(newLog);
      
      if (success) {
        await loadAllHabitLogs();
      }
      
      return success;
    } catch (error) {
      console.error('Error toggling habit completion:', error);
      Alert.alert('Error', 'Failed to update habit completion.');
      return false;
    }
  };

  // Check if a habit is completed on a specific date
  const isHabitCompletedOnDate = async (habitId: string, date: string) => {
    try {
      const logs = habitLogs.filter((log) => log.habitId === habitId && log.date === date);
      return logs.length > 0 && logs[0].completed;
    } catch (error) {
      console.error('Error checking habit completion:', error);
      return false;
    }
  };

  // Get habit logs for a specific date
  const getHabitLogsForDate = async (date: string) => {
    try {
      return habitLogs.filter((log) => log.date === date);
    } catch (error) {
      console.error('Error getting habit logs for date:', error);
      return [];
    }
  };

  // Get habit logs for a specific habit
  const getHabitLogsForHabit = async (habitId: string) => {
    try {
      return habitLogs.filter((log) => log.habitId === habitId);
    } catch (error) {
      console.error('Error getting habit logs for habit:', error);
      return [];
    }
  };

  // Get streak information for a habit
  const getStreak = async (habitId: string) => {
    try {
      return await getHabitStreak(habitId);
    } catch (error) {
      console.error('Error getting habit streak:', error);
      return null;
    }
  };

  // Get statistics for a habit
  const getStatistics = async (habitId: string) => {
    try {
      return await getHabitStatistics(habitId);
    } catch (error) {
      console.error('Error getting habit statistics:', error);
      return null;
    }
  };

  // Provide the context
  const value = {
    habits,
    loading,
    refreshHabits,
    addHabit,
    updateHabit,
    removeHabit,
    getHabitById,
    toggleHabitCompletion,
    isHabitCompletedOnDate,
    getHabitLogsForDate,
    getHabitLogsForHabit,
    getStreak,
    getStatistics,
  };

  return (
    <HabitContext.Provider value={value}>
      {children}
    </HabitContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitContext);
  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
}
