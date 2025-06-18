import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import CalendarView from '@/components/habits/CalendarView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useHabits } from '@/context/HabitContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Habit } from '@/types/habit';

export default function HabitDetailScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();  const { id } = useLocalSearchParams();
  const { getHabitById, getStreak, getStatistics } = useHabits();
  
  const [habit, setHabit] = useState<Habit | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [streak, setStreak] = useState({ current: 0, longest: 0 });
  const [completionRate, setCompletionRate] = useState(0);
  // Load habit data from context
  useEffect(() => {
    const loadHabitData = async () => {
      if (id) {
        const habitData = getHabitById(String(id));
        if (habitData) {
          setHabit(habitData);
          
          // Get streak data
          const streakData = await getStreak(String(id));
          if (streakData) {
            setStreak({
              current: streakData.currentStreak,
              longest: streakData.longestStreak,
            });
          }
          
          // Get statistics data
          const statsData = await getStatistics(String(id));
          if (statsData) {
            setCompletionRate(statsData.completionRate);
          }
        } else {
          // Handle case where habit isn't found
          router.back();
        }
      }
    };
    
    loadHabitData();
  }, [id, getHabitById, getStreak, getStatistics, router]);

  // This would be used when the context is ready
  /*
  useFocusEffect(
    useCallback(() => {
      const loadHabitDetails = async () => {
        if (id) {
          const habitData = getHabitById(String(id));
          setHabit(habitData);
          
          if (habitData) {
            const streakData = await getStreak(habitData.id);
            setStreak({
              current: streakData?.currentStreak || 0,
              longest: streakData?.longestStreak || 0,
            });
            
            const statsData = await getStatistics(habitData.id);
            setCompletionRate(statsData?.completionRate || 0);
          }
        }
      };
      
      loadHabitDetails();
    }, [id])
  );
  */

  if (!habit) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading habit details...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      <Stack.Screen
        options={{
          title: habit.name,
          headerRight: () => (
            <TouchableOpacity onPress={() => {
              // Navigate to edit screen
              // router.push(`/habit/edit/${habit.id}`);
            }}>
              <IconSymbol name="pencil" size={20} color={Colors[colorScheme ?? 'light'].tint} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView}>
        {/* Header with icon and color */}
        <View style={[styles.header, { backgroundColor: habit.color }]}>
          <View style={styles.iconContainer}>
            <IconSymbol name={habit.icon || 'checkmark'} size={40} color="#FFFFFF" />
          </View>
          <ThemedText style={styles.headerTitle}>{habit.name}</ThemedText>
          {habit.description && (
            <ThemedText style={styles.headerDescription}>{habit.description}</ThemedText>
          )}
        </View>

        {/* Calendar for tracking */}
        <ThemedView style={styles.sectionContainer}>
          <ThemedText type="subtitle">Tracking</ThemedText>
          <CalendarView
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </ThemedView>

        {/* Stats Section */}
        <ThemedView style={styles.sectionContainer}>
          <ThemedText type="subtitle">Stats</ThemedText>
          
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <ThemedText style={styles.statValue}>{streak.current}</ThemedText>
              <ThemedText style={styles.statLabel}>Current Streak</ThemedText>
            </View>
            
            <View style={styles.statBox}>
              <ThemedText style={styles.statValue}>{streak.longest}</ThemedText>
              <ThemedText style={styles.statLabel}>Longest Streak</ThemedText>
            </View>
            
            <View style={styles.statBox}>
              <ThemedText style={styles.statValue}>{Math.round(completionRate * 100)}%</ThemedText>
              <ThemedText style={styles.statLabel}>Completion</ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Habit Details */}
        <ThemedView style={styles.sectionContainer}>
          <ThemedText type="subtitle">Details</ThemedText>
          
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Frequency</ThemedText>
            <ThemedText style={styles.detailValue}>
              {getFrequencyText(habit)}
            </ThemedText>
          </View>
          
          {habit.reminderTime && (
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Reminder</ThemedText>
              <ThemedText style={styles.detailValue}>{habit.reminderTime}</ThemedText>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Created</ThemedText>
            <ThemedText style={styles.detailValue}>
              {new Date(habit.createdAt).toLocaleDateString()}
            </ThemedText>
          </View>
        </ThemedView>

        {/* Delete Button */}
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => {
            // Show confirmation dialog and delete habit
            // Alert.alert(
            //   'Delete Habit',
            //   'Are you sure you want to delete this habit and all its data?',
            //   [
            //     { text: 'Cancel', style: 'cancel' },
            //     { 
            //       text: 'Delete', 
            //       style: 'destructive',
            //       onPress: async () => {
            //         // await removeHabit(habit.id);
            //         // router.back();
            //       }
            //     },
            //   ]
            // );
          }}
        >
          <ThemedText style={styles.deleteButtonText}>Delete Habit</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

// Helper function to format frequency text
function getFrequencyText(habit: Habit): string {
  switch (habit.frequency.type) {
    case 'daily':
      return 'Every day';
    case 'weekly':
      if (!habit.frequency.days || habit.frequency.days.length === 0) {
        return 'Weekly';
      }
      
      if (habit.frequency.days.length === 7) {
        return 'Every day';
      }
      
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const days = habit.frequency.days.sort().map(day => dayNames[day]);
      return days.join(', ');
    case 'custom':
      if (!habit.frequency.customInterval || habit.frequency.customInterval <= 1) {
        return 'Daily';
      }
      return `Every ${habit.frequency.customInterval} days`;
    default:
      return 'Unknown frequency';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  headerDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  sectionContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 5,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
  },
  deleteButton: {
    margin: 20,
    padding: 15,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
