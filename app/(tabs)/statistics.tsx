import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Will be uncommented when components are created
// import { useHabits } from '@/context/HabitContext';
// import StatisticsCard from '@/components/habits/StatisticsCard';
// import StreakChart from '@/components/habits/StreakChart';
// import CompletionRateChart from '@/components/habits/CompletionRateChart';

export default function StatisticsScreen() {
  const colorScheme = useColorScheme();
  const [selectedPeriod, setSelectedPeriod] = useState('week'); // week, month, year, all

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <ThemedText type="title">Statistics</ThemedText>
      </View>

      <View style={styles.periodSelector}>
        <TouchableOpacity 
          style={[
            styles.periodButton, 
            selectedPeriod === 'week' && { backgroundColor: Colors[colorScheme ?? 'light'].tint }
          ]}
          onPress={() => setSelectedPeriod('week')}
        >
          <ThemedText 
            style={[
              styles.periodText, 
              selectedPeriod === 'week' && styles.selectedPeriodText
            ]}
          >
            Week
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.periodButton, 
            selectedPeriod === 'month' && { backgroundColor: Colors[colorScheme ?? 'light'].tint }
          ]}
          onPress={() => setSelectedPeriod('month')}
        >
          <ThemedText 
            style={[
              styles.periodText, 
              selectedPeriod === 'month' && styles.selectedPeriodText
            ]}
          >
            Month
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.periodButton, 
            selectedPeriod === 'year' && { backgroundColor: Colors[colorScheme ?? 'light'].tint }
          ]}
          onPress={() => setSelectedPeriod('year')}
        >
          <ThemedText 
            style={[
              styles.periodText, 
              selectedPeriod === 'year' && styles.selectedPeriodText
            ]}
          >
            Year
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.periodButton, 
            selectedPeriod === 'all' && { backgroundColor: Colors[colorScheme ?? 'light'].tint }
          ]}
          onPress={() => setSelectedPeriod('all')}
        >
          <ThemedText 
            style={[
              styles.periodText, 
              selectedPeriod === 'all' && styles.selectedPeriodText
            ]}
          >
            All
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Stats Overview */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <ThemedText style={styles.statValue}>0</ThemedText>
            <ThemedText style={styles.statLabel}>Habits</ThemedText>
          </View>
          
          <View style={styles.statCard}>
            <ThemedText style={styles.statValue}>0</ThemedText>
            <ThemedText style={styles.statLabel}>Complete</ThemedText>
          </View>
          
          <View style={styles.statCard}>
            <ThemedText style={styles.statValue}>0%</ThemedText>
            <ThemedText style={styles.statLabel}>Success Rate</ThemedText>
          </View>
        </View>

        {/* Streak Chart Placeholder */}
        <View style={styles.chartCard}>
          <ThemedText type="subtitle">Current Streaks</ThemedText>
          <View style={styles.chartPlaceholder}>
            <IconSymbol 
              name="chart.bar.xaxis" 
              size={36} 
              color={Colors[colorScheme ?? 'light'].text} 
            />
            <ThemedText style={styles.placeholderText}>
              No streak data yet
            </ThemedText>
          </View>
        </View>

        {/* Completion Rate Chart Placeholder */}
        <View style={styles.chartCard}>
          <ThemedText type="subtitle">Completion Rate</ThemedText>
          <View style={styles.chartPlaceholder}>
            <IconSymbol 
              name="chart.pie.fill" 
              size={36} 
              color={Colors[colorScheme ?? 'light'].text} 
            />
            <ThemedText style={styles.placeholderText}>
              No completion data yet
            </ThemedText>
          </View>
        </View>

        {/* Calendar Heatmap Placeholder */}
        <View style={styles.chartCard}>
          <ThemedText type="subtitle">Activity Calendar</ThemedText>
          <View style={styles.chartPlaceholder}>
            <IconSymbol 
              name="calendar" 
              size={36} 
              color={Colors[colorScheme ?? 'light'].text} 
            />
            <ThemedText style={styles.placeholderText}>
              No activity data yet
            </ThemedText>
          </View>
        </View>
      </ScrollView>
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
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  periodButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  periodText: {
    fontSize: 14,
  },
  selectedPeriodText: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '30%',
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
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
  chartCard: {
    marginVertical: 10,
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#F0F0F0',
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 10,
    color: '#666',
  },
});
