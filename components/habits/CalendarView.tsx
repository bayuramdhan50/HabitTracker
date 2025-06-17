import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface CalendarViewProps {
  selectedDate: string; // Format: 'YYYY-MM-DD'
  onSelectDate: (date: string) => void;
  // We'll add completion data integration later
  // completedDates?: string[];
}

export default function CalendarView({ selectedDate, onSelectDate }: CalendarViewProps) {
  const colorScheme = useColorScheme();
  const [dates, setDates] = useState<{ date: Date; dateString: string }[]>([]);
  
  useEffect(() => {
    const today = new Date();
    const dates = [];
    
    // Generate dates for last 2 weeks, this week, and next week
    for (let i = -14; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push({
        date,
        dateString: formatDateToYYYYMMDD(date),
      });
    }
    
    setDates(dates);
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {dates.map(({ date, dateString }, index) => {
          const isSelected = dateString === selectedDate;
          const isToday = dateString === formatDateToYYYYMMDD(new Date());
          // We'll add completion check later
          // const isCompleted = completedDates?.includes(dateString);
          const isCompleted = false;
          
          return (
            <TouchableOpacity
              key={dateString}
              style={[
                styles.dateContainer,
                isSelected && styles.selectedDateContainer,
                isToday && styles.todayContainer
              ]}
              onPress={() => onSelectDate(dateString)}
            >
              <ThemedText style={styles.dayText}>
                {getDayName(date)}
              </ThemedText>
              
              <View 
                style={[
                  styles.dateCircle,
                  isSelected && { backgroundColor: Colors[colorScheme ?? 'light'].tint },
                  isToday && !isSelected && styles.todayCircle,
                  isCompleted && !isSelected && styles.completedCircle
                ]}
              >
                <ThemedText 
                  style={[
                    styles.dateText,
                    isSelected && styles.selectedDateText
                  ]}
                >
                  {date.getDate()}
                </ThemedText>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

// Formatting utilities
function formatDateToYYYYMMDD(date: Date): string {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

function getDayName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

const styles = StyleSheet.create({
  container: {
    height: 90,
    marginBottom: 10,
  },
  scrollViewContent: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dateContainer: {
    width: 45,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  selectedDateContainer: {
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  todayContainer: {
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  dayText: {
    fontSize: 12,
    marginBottom: 5,
  },
  dateCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  todayCircle: {
    borderWidth: 1,
    borderColor: '#ccc',
  },
  completedCircle: {
    backgroundColor: '#4CD964',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedDateText: {
    color: '#FFFFFF',
  },
});
