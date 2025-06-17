import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Will be uncommented when components are created
// import { useHabits } from '@/context/HabitContext';
// import HabitListItem from '@/components/habits/HabitListItem';

export default function HabitsScreen() {
  const colorScheme = useColorScheme();
  // const { habits, refreshHabits } = useHabits();
  const [refreshing, setRefreshing] = useState(false);
  const [habits, setHabits] = useState([]);

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

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <ThemedText type="title">My Habits</ThemedText>
      </View>

      <View style={styles.searchAndFilterContainer}>
        <TouchableOpacity style={styles.searchBar}>
          <IconSymbol name="magnifyingglass" size={16} color={Colors[colorScheme ?? 'light'].text} />
          <ThemedText style={styles.searchText}>Search habits...</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.filterButton}>
          <IconSymbol name="slider.horizontal.3" size={16} color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
      </View>

      {/* Empty state for now - will be replaced with actual habit list */}
      <View style={styles.emptyState}>
        <IconSymbol 
          name="list.bullet.clipboard" 
          size={50} 
          color={Colors[colorScheme ?? 'light'].text} 
        />
        <ThemedText style={styles.emptyStateText}>
          No habits created yet. Use the + button to add a new habit.
        </ThemedText>
      </View>

      <TouchableOpacity 
        style={[
          styles.floatingButton, 
          { backgroundColor: Colors[colorScheme ?? 'light'].tint }
        ]}
        onPress={() => {/* Navigate to add habit screen */}}
      >
        <IconSymbol name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </ThemedView>
  );
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
  searchAndFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchBar: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    marginRight: 10,
  },
  searchText: {
    marginLeft: 8,
    color: '#888',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    marginTop: 20,
    textAlign: 'center',
    maxWidth: '80%',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});
