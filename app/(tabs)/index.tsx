import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Temporarily commented out the HabitContext until it's fully implemented
// import { useHabits } from '@/context/HabitContext';
// import HabitCard from '@/components/habits/HabitCard';
// import CalendarView from '@/components/habits/CalendarView';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  // const { habits, refreshHabits } = useHabits();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();

  useFocusEffect(
    useCallback(() => {
      // refreshHabits();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    // await refreshHabits();
    setRefreshing(false);
  };

  const onDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <ThemedText type="title">Habit Tracker</ThemedText>
        <ThemedText type="subtitle">{formatDate(selectedDate)}</ThemedText>
      </View>

      {/* CalendarView will be implemented later */}
      <View style={styles.calendarPlaceholder}>
        <ThemedText>Calendar will go here</ThemedText>
      </View>

      <View style={styles.habitListHeader}>
        <ThemedText type="subtitle">Today's Habits</ThemedText>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {/* Navigate to add habit screen */}}
        >
          <IconSymbol 
            name="plus.circle.fill" 
            size={24} 
            color={Colors[colorScheme ?? 'light'].tint} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.emptyState}>
        <IconSymbol 
          name="calendar.badge.plus" 
          size={50} 
          color={Colors[colorScheme ?? 'light'].text} 
        />
        <ThemedText style={styles.emptyStateText}>
          No habits yet. Add your first habit to get started!
        </ThemedText>
      </View>
    </ThemedView>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric' 
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  calendarPlaceholder: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginBottom: 20,
  },
  habitListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  addButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyStateText: {
    marginTop: 20,
    textAlign: 'center',
    maxWidth: '80%',
  },
});
