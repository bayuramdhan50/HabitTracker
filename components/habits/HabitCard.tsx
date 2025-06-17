import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Habit } from '@/types/habit';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
// import { useHabits } from '@/context/HabitContext';

interface HabitCardProps {
  habit: Habit;
  date: string; // Format: 'YYYY-MM-DD'
  onPress?: () => void;
}

export default function HabitCard({ habit, date, onPress }: HabitCardProps) {
  const colorScheme = useColorScheme();
  // const { isHabitCompletedOnDate, toggleHabitCompletion } = useHabits();
  
  // Temporary state until context is working
  const isCompleted = false;

  const handleToggleCompletion = async () => {
    // await toggleHabitCompletion(habit.id, date);
    console.log('Toggle completion for', habit.id, 'on', date);
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity 
        style={styles.card} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.infoContainer}>
          <View style={[styles.iconContainer, { backgroundColor: habit.color || '#A1CEDC' }]}>
            <IconSymbol 
              name={habit.icon || "checkmark"} 
              size={18} 
              color="#FFFFFF" 
            />
          </View>
          
          <View style={styles.textContainer}>
            <ThemedText type="defaultSemiBold">{habit.name}</ThemedText>
            {habit.description && (
              <ThemedText style={styles.description} numberOfLines={2}>
                {habit.description}
              </ThemedText>
            )}
          </View>
        </View>

        <TouchableOpacity 
          style={[
            styles.completionButton,
            isCompleted ? styles.completedButton : styles.incompleteButton
          ]}
          onPress={handleToggleCompletion}
        >
          {isCompleted ? (
            <IconSymbol name="checkmark" size={20} color="#FFFFFF" />
          ) : (
            <View style={styles.incompleteInner} />
          )}
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Streak indicator */}
      {/* Will be uncommented when the streak functionality is implemented
      {streak > 0 && (
        <View style={styles.streakContainer}>
          <IconSymbol name="flame.fill" size={14} color="#FF9500" />
          <ThemedText style={styles.streakText}>{streak}</ThemedText>
        </View>
      )}
      */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  description: {
    fontSize: 12,
    marginTop: 3,
    opacity: 0.7,
  },
  completionButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedButton: {
    backgroundColor: '#4CD964', // Green
  },
  incompleteButton: {
    borderWidth: 2,
    borderColor: '#CCC',
    backgroundColor: 'transparent',
  },
  incompleteInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  streakContainer: {
    position: 'absolute',
    right: 10,
    top: -8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  streakText: {
    fontSize: 12,
    marginLeft: 3,
    fontWeight: 'bold',
  },
});
