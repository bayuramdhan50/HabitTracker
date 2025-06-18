import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useHabits } from '@/context/HabitContext';
import { useColorScheme } from '@/hooks/useColorScheme';

const DAYS_OF_WEEK = [
  { id: 0, name: 'Sun' },
  { id: 1, name: 'Mon' },
  { id: 2, name: 'Tue' },
  { id: 3, name: 'Wed' },
  { id: 4, name: 'Thu' },
  { id: 5, name: 'Fri' },
  { id: 6, name: 'Sat' },
];

const COLORS = [
  '#FF3B30', // Red
  '#FF9500', // Orange
  '#FFCC00', // Yellow
  '#4CD964', // Green
  '#5AC8FA', // Light Blue
  '#007AFF', // Blue
  '#5856D6', // Purple
  '#FF2D55', // Pink
  '#8E8E93', // Gray
];

const ICONS = [
  'heart.fill',
  'drop.fill',
  'flame.fill',
  'bolt.fill',
  'leaf.fill',
  'bookmark.fill',
  'book.fill',
  'doc.fill',
  'calendar',
  'stopwatch.fill',
  'waveform.path.badge.plus',
  'moon.stars.fill',
  'house.fill',
  'person.fill',
  'star.fill',
  'bell.fill',
  'flag.fill',
  'bag.fill',
];

export default function AddHabitScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { addHabit } = useHabits();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[3]);
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);
  const [frequencyType, setFrequencyType] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri
  const [customInterval, setCustomInterval] = useState('3'); // every 3 days
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00'); // HH:MM format

  const handleDayToggle = (dayId: number) => {
    if (selectedDays.includes(dayId)) {
      setSelectedDays(selectedDays.filter(id => id !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId]);
    }
  };

  const handleSaveHabit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a habit name.');
      return;
    }

    if (frequencyType === 'weekly' && selectedDays.length === 0) {
      Alert.alert('Error', 'Please select at least one day of the week.');
      return;
    }

    try {
      // Create habit object
      const newHabit = {
        name,
        description,
        color: selectedColor,
        icon: selectedIcon,
        frequency: {
          type: frequencyType,
          days: frequencyType === 'weekly' ? selectedDays : undefined,
          customInterval: frequencyType === 'custom' ? parseInt(customInterval, 10) : undefined,
        },
        reminderTime: reminderEnabled ? reminderTime : undefined,
      };      // Add the habit using the context
      await addHabit(newHabit);
      console.log('New habit created:', newHabit);
      
      Alert.alert('Success', 'Habit created successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error adding habit:', error);
      Alert.alert('Error', 'Failed to create habit. Please try again.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      <Stack.Screen
        options={{
          title: 'Add New Habit',
          headerRight: () => (
            <TouchableOpacity onPress={handleSaveHabit}>
              <ThemedText style={{ color: Colors[colorScheme ?? 'light'].tint }}>Save</ThemedText>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView}>
        {/* Habit Name */}
        <View style={styles.inputContainer}>
          <ThemedText type="subtitle">Name</ThemedText>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="What habit do you want to track?"
            placeholderTextColor="#888"
            maxLength={50}
          />
        </View>

        {/* Habit Description */}
        <View style={styles.inputContainer}>
          <ThemedText type="subtitle">Description (Optional)</ThemedText>
          <TextInput
            style={[styles.textInput, styles.textAreaInput]}
            value={description}
            onChangeText={setDescription}
            placeholder="Add some details about this habit..."
            placeholderTextColor="#888"
            multiline
            numberOfLines={3}
            maxLength={200}
          />
        </View>

        {/* Color Selection */}
        <View style={styles.inputContainer}>
          <ThemedText type="subtitle">Color</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorScroller}>
            {COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedColorOption,
                ]}
                onPress={() => setSelectedColor(color)}
              >
                {selectedColor === color && (
                  <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Icon Selection */}
        <View style={styles.inputContainer}>
          <ThemedText type="subtitle">Icon</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScroller}>
            {ICONS.map((icon) => (
              <TouchableOpacity
                key={icon}
                style={[
                  styles.iconOption,
                  selectedIcon === icon && { backgroundColor: selectedColor },
                ]}
                onPress={() => setSelectedIcon(icon)}
              >
                <IconSymbol
                  name={icon}
                  size={24}
                  color={selectedIcon === icon ? '#FFFFFF' : Colors[colorScheme ?? 'light'].text}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Frequency */}
        <View style={styles.inputContainer}>
          <ThemedText type="subtitle">Frequency</ThemedText>
          
          <View style={styles.frequencyOptions}>
            <TouchableOpacity
              style={[
                styles.frequencyOption,
                frequencyType === 'daily' && { backgroundColor: selectedColor }
              ]}
              onPress={() => setFrequencyType('daily')}
            >
              <ThemedText style={frequencyType === 'daily' ? styles.selectedFrequencyText : {}}>
                Daily
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.frequencyOption,
                frequencyType === 'weekly' && { backgroundColor: selectedColor }
              ]}
              onPress={() => setFrequencyType('weekly')}
            >
              <ThemedText style={frequencyType === 'weekly' ? styles.selectedFrequencyText : {}}>
                Weekly
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.frequencyOption,
                frequencyType === 'custom' && { backgroundColor: selectedColor }
              ]}
              onPress={() => setFrequencyType('custom')}
            >
              <ThemedText style={frequencyType === 'custom' ? styles.selectedFrequencyText : {}}>
                Custom
              </ThemedText>
            </TouchableOpacity>
          </View>
          
          {/* Weekly Days Selection */}
          {frequencyType === 'weekly' && (
            <View style={styles.daysContainer}>
              {DAYS_OF_WEEK.map((day) => (
                <TouchableOpacity
                  key={day.id}
                  style={[
                    styles.dayButton,
                    selectedDays.includes(day.id) && { backgroundColor: selectedColor }
                  ]}
                  onPress={() => handleDayToggle(day.id)}
                >
                  <ThemedText 
                    style={selectedDays.includes(day.id) ? styles.selectedDayText : {}}
                  >
                    {day.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {/* Custom Interval Selection */}
          {frequencyType === 'custom' && (
            <View style={styles.customIntervalContainer}>
              <ThemedText>Every</ThemedText>
              <TextInput
                style={styles.customIntervalInput}
                value={customInterval}
                onChangeText={(text: string) => setCustomInterval(text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                maxLength={2}
              />
              <ThemedText>days</ThemedText>
            </View>
          )}
        </View>

        {/* Reminder */}
        <View style={styles.inputContainer}>
          <View style={styles.reminderHeader}>
            <ThemedText type="subtitle">Reminder</ThemedText>
            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              trackColor={{ false: '#CCC', true: selectedColor }}
            />
          </View>
          
          {reminderEnabled && (
            <View style={styles.reminderTimeContainer}>
              <ThemedText>Set time</ThemedText>
              <TextInput
                style={styles.timeInput}
                value={reminderTime}
                onChangeText={setReminderTime}
                placeholder="09:00"
                placeholderTextColor="#888"
              />
            </View>
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: selectedColor }]}
          onPress={handleSaveHabit}
        >
          <ThemedText style={styles.saveButtonText}>Save Habit</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 15,
    marginTop: 8,
    fontSize: 16,
  },
  textAreaInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  colorScroller: {
    marginTop: 15,
    maxHeight: 50,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  iconScroller: {
    marginTop: 15,
    maxHeight: 60,
  },
  iconOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  frequencyOptions: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10,
  },
  frequencyOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  selectedFrequencyText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  dayButton: {
    width: '13%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    marginBottom: 10,
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  customIntervalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  customIntervalInput: {
    width: 50,
    height: 40,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    textAlign: 'center',
    marginHorizontal: 10,
    fontSize: 16,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    justifyContent: 'space-between',
  },
  timeInput: {
    width: 100,
    height: 40,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 16,
  },
  saveButton: {
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
