import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MOOD_CFG, MoodType } from '../constants/moods';
import { MoodItem } from '../context/AppContext';

interface Props {
  moodHistory: MoodItem[];
}

export default function MoodTimeline({ moodHistory }: Props) {
  if (!moodHistory.length) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mood Timeline</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.row}>
          {moodHistory.map((item, i) => {
            const cfg = MOOD_CFG[item.mood as MoodType];
            return (
              <View key={i} style={styles.item}>
                <View style={[styles.bubble, { backgroundColor: cfg.color }]}>
                  <Text style={styles.icon}>{cfg.icon}</Text>
                </View>
                <Text style={styles.num}>{i + 1}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8 },
  title: { fontSize: 12, color: '#888', marginBottom: 6, fontWeight: '600' },
  scroll: { flexGrow: 0 },
  row: { flexDirection: 'row', gap: 6 },
  item: { alignItems: 'center', gap: 2 },
  bubble: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 16 },
  num: { fontSize: 10, color: '#888' },
});
