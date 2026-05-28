import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { AI_PERSONAS, Persona } from '../constants/personas';

interface Props {
  selected: Persona;
  onSelect: (persona: Persona) => void;
}

export default function PersonaPicker({ selected, onSelect }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.container}>
      {AI_PERSONAS.map((p) => (
        <TouchableOpacity
          key={p.id}
          style={[styles.chip, selected.id === p.id && styles.active]}
          onPress={() => onSelect(p)}
        >
          <Text style={styles.emoji}>{p.emoji}</Text>
          <Text style={[styles.label, selected.id === p.id && styles.activeLabel]}>{p.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 },
  container: { gap: 8, paddingVertical: 4 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#111',
  },
  active: { borderColor: '#7c6af7', backgroundColor: '#1e1b3a' },
  emoji: { fontSize: 14 },
  label: { fontSize: 13, color: '#aaa' },
  activeLabel: { color: '#c4b8ff', fontWeight: '600' },
});
