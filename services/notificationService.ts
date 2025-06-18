import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Habit } from '../types/habit';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Request permissions
export const registerForPushNotificationsAsync = async () => {
  let token;
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('habits', {
      name: 'Habit Reminders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Permission for notifications not granted!');
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync({ projectId: 'anonymous' })).data;
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
};

// Schedule a notification for a habit
export const scheduleHabitReminder = async (habit: Habit) => {
  try {
    if (!habit.reminderTime) return;
    
    // Parse time (HH:MM format)
    const [hours, minutes] = habit.reminderTime.split(':').map(Number);
    
    // Create identifier for this habit's notification
    const identifier = `habit-reminder-${habit.id}`;
    
    // Cancel any existing notification for this habit
    await cancelHabitReminder(habit.id);
    
    // Create content object for notifications
    const content = {
      title: `Time for: ${habit.name}`,
      body: habit.description || 'Complete your habit now!',
      data: { habitId: habit.id },
    };
    
    if (habit.frequency.type === 'daily') {
      // Schedule daily at the specified time
      // Create a date object representing the next occurrence
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);
      
      // If the scheduled time has already passed today, set it for tomorrow
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }
      
      await Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 24 * 60 * 60, // 24 hours
          repeats: true
        },
        identifier,
      });
      return identifier;    } else if (habit.frequency.type === 'weekly' && habit.frequency.days) {
      // Schedule for specified days of the week
      // We need to create multiple notifications, one for each day
      for (const day of habit.frequency.days) {
        // Create a date object for the next occurrence of this day
        const now = new Date();
        const currentDay = now.getDay();
        let daysUntilTarget = day - currentDay;
        if (daysUntilTarget < 0) daysUntilTarget += 7;
        
        // If it's the same day but the time has passed, wait until next week
        if (daysUntilTarget === 0) {
          const targetTime = new Date();
          targetTime.setHours(hours, minutes, 0, 0);
          if (targetTime <= now) daysUntilTarget = 7;
        }
        
        await Notifications.scheduleNotificationAsync({
          content,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 7 * 24 * 60 * 60, // 7 days
            repeats: true
          },
          identifier: `${identifier}-day-${day}`,
        });
      }
      return identifier;    } else if (habit.frequency.type === 'custom' && habit.frequency.customInterval) {
      // For custom intervals
      // Calculate seconds for the custom interval
      const intervalSeconds = habit.frequency.customInterval * 24 * 60 * 60; // Convert days to seconds
      
      await Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: intervalSeconds,
          repeats: true
        },
        identifier,
      });
      return identifier;} else {
      // Default to daily if frequency structure is not as expected
      await Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 24 * 60 * 60, // 24 hours
          repeats: true
        },
        identifier,
      });
      return identifier;
    }
  } catch (error) {
    console.error('Error scheduling habit reminder:', error);
    return null;
  }
};

// Cancel a habit's reminder notification
export const cancelHabitReminder = async (habitId: string) => {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const notificationsToCancel = scheduledNotifications.filter(
      notification => notification.identifier?.startsWith(`habit-reminder-${habitId}`)
    );
    
    for (const notification of notificationsToCancel) {
      if (notification.identifier) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error canceling habit reminder:', error);
    return false;
  }
};
