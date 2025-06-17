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
      await Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        },
        identifier,
      });
      return identifier;
    } else if (habit.frequency.type === 'weekly' && habit.frequency.days) {
      // Schedule for specified days of the week
      // We need to create multiple notifications, one for each day
      for (const day of habit.frequency.days) {
        await Notifications.scheduleNotificationAsync({
          content,
          trigger: {
            weekday: day + 1, // Expo uses 1-7 for weekdays (Sunday-Saturday)
            hour: hours,
            minute: minutes,
            repeats: true,
          },
          identifier: `${identifier}-day-${day}`,
        });
      }
      return identifier;
    } else if (habit.frequency.type === 'custom' && habit.frequency.customInterval) {
      // For custom intervals, we'll schedule just for tomorrow and then reschedule when it's completed
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(hours);
      tomorrow.setMinutes(minutes);
      
      await Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          date: tomorrow,
        },
        identifier,
      });
      return identifier;
    } else {
      // Default to daily if frequency structure is not as expected
      await Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
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
