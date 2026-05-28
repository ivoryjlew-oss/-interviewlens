import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MOOD_CFG, MoodType } from '../constants/moods';
import { MoodItem } from '../context/AppContext';

interface Props {
  currentMood: MoodItem | null;
}

export default function MoodBar({ currentMood }: Props) {
  if (!currentMood) return null;

  const cfg = MOOD_CFG[currentMood.mood as MoodType];

  return (
    <View style={[styles.container, { borderColor: cfg.color }]}>
      <Text style={styles.icon}>{cfg.icon}</Text>
      <View style={styles.info}>
        <Text style={[styles.label, { color: cfg.color }]}>{cfg.label}</Text>
        <Text style={styles.sub}>Interviewer tone</Text>
      </View>
      <View style={[styles.dot, { backgroundColor: cfg.color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    gap: 10,
    backgroundColor: '#1a1a2e',
  },
  icon: { fontSize: 22 },
  info: { flex: 1 },
  label: { fontSize: 14, fontWeight: '700' },
  sub: { fontSize: 11, color: '#888', marginTop: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
