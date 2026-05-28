import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParams } from '../../navigation/AppNavigator';
import { AI_PROVIDERS } from '../../constants/providers';

type Props = NativeStackScreenProps<OnboardingStackParams, 'StepProvider'>;

export default function StepProviderScreen({ navigation }: Props) {
  const [selected, setSelected] = useState('anthropic');

  const provider = AI_PROVIDERS.find((p) => p.id === selected)!;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.logo}>✦ Phorya</Text>
        <Text style={styles.tagline}>Go back, prepared. Get the job.</Text>

        <View style={styles.card}>
          <Text style={styles.step}>Step 1 of 3</Text>
          <Text style={styles.title}>Choose your AI provider</Text>
          <Text style={styles.subtitle}>Your API key is stored only on this device and sent directly to the provider — never to us.</Text>
        </View>

        <View style={styles.list}>
          {AI_PROVIDERS.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[styles.option, selected === p.id && styles.optionActive]}
              onPress={() => setSelected(p.id)}
            >
              <View style={styles.optionInner}>
                <Text style={[styles.optionLabel, selected === p.id && styles.optionLabelActive]}>{p.label}</Text>
                {p.free && <Text style={styles.badge}>FREE</Text>}
                {p.local && <Text style={styles.badgeLocal}>LOCAL</Text>}
              </View>
              <Text style={styles.optionKey}>{p.keyPlaceholder}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate('StepApiKey', { providerId: selected })}
        >
          <Text style={styles.btnText}>Continue →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080814' },
  container: { padding: 24, paddingTop: 48 },
  logo: { fontSize: 28, color: '#7c6af7', fontWeight: '700', marginBottom: 4 },
  tagline: { fontSize: 14, color: '#888', marginBottom: 32 },
  card: { backgroundColor: '#12122a', borderRadius: 16, padding: 20, marginBottom: 24 },
  step: { fontSize: 12, color: '#7c6af7', fontWeight: '600', marginBottom: 6 },
  title: { fontSize: 20, color: '#fff', fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 13, color: '#888', lineHeight: 18 },
  list: { gap: 10, marginBottom: 32 },
  option: {
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#111',
  },
  optionActive: { borderColor: '#7c6af7', backgroundColor: '#1a1840' },
  optionInner: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  optionLabel: { fontSize: 15, color: '#ccc', fontWeight: '600', flex: 1 },
  optionLabelActive: { color: '#c4b8ff' },
  optionKey: { fontSize: 12, color: '#555' },
  badge: { backgroundColor: '#1a3a1a', color: '#3dd68c', fontSize: 10, fontWeight: '700', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, overflow: 'hidden' },
  badgeLocal: { backgroundColor: '#1a2a3a', color: '#5b8eff', fontSize: 10, fontWeight: '700', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, overflow: 'hidden' },
  btn: {
    backgroundColor: '#7c6af7',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
