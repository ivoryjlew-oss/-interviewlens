import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Switch,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParams } from '../../navigation/AppNavigator';
import { AI_PROVIDERS } from '../../constants/providers';
import { AI_PERSONAS } from '../../constants/personas';
import { setItem, SK } from '../../storage/storage';
import { useApp } from '../../context/AppContext';

type Props = NativeStackScreenProps<OnboardingStackParams, 'StepPrefs'>;

export default function StepPrefsScreen({ route }: Props) {
  const { providerId, model } = route.params;
  const { dispatch } = useApp();
  const provider = AI_PROVIDERS.find((p) => p.id === providerId)!;

  const [selectedModel, setSelectedModel] = useState(model || provider.defaultModel);
  const [selectedPersona, setSelectedPersona] = useState('coach');

  async function handleFinish() {
    await setItem(SK.provider, providerId);
    await setItem(SK.model, selectedModel);
    await setItem(SK.onboarded, true);
    await setItem(SK.prefs, {
      fontId: 'inter',
      sizeId: 'md',
      personaId: selectedPersona,
      speed: 1.5,
      jobTitle: '',
      company: '',
      jobDesc: '',
      context: '',
      savedAt: new Date().toISOString(),
      activeScriptId: '',
    });

    dispatch({ type: 'SET_ONBOARDED', payload: { providerId, model: selectedModel } });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.logo}>✦ Phorya</Text>

        <View style={styles.card}>
          <Text style={styles.step}>Step 3 of 3</Text>
          <Text style={styles.title}>Set your preferences</Text>
          <Text style={styles.subtitle}>Customize your default AI model and coaching persona. You can change these anytime.</Text>
        </View>

        <Text style={styles.sectionLabel}>AI Model</Text>
        <View style={styles.list}>
          {provider.models.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[styles.option, selectedModel === m.id && styles.optionActive]}
              onPress={() => setSelectedModel(m.id)}
            >
              <Text style={[styles.optionText, selectedModel === m.id && styles.optionTextActive]}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Default Coaching Persona</Text>
        <View style={styles.list}>
          {AI_PERSONAS.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[styles.option, selectedPersona === p.id && styles.optionActive]}
              onPress={() => setSelectedPersona(p.id)}
            >
              <Text style={styles.optionEmoji}>{p.emoji}</Text>
              <View style={styles.personaInfo}>
                <Text style={[styles.optionText, selectedPersona === p.id && styles.optionTextActive]}>{p.label}</Text>
                <Text style={styles.personaTone}>{p.tone}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleFinish}>
          <Text style={styles.btnText}>Get Started ✦</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080814' },
  container: { padding: 24, paddingTop: 48, paddingBottom: 48 },
  logo: { fontSize: 28, color: '#7c6af7', fontWeight: '700', marginBottom: 32 },
  card: { backgroundColor: '#12122a', borderRadius: 16, padding: 20, marginBottom: 24 },
  step: { fontSize: 12, color: '#7c6af7', fontWeight: '600', marginBottom: 6 },
  title: { fontSize: 20, color: '#fff', fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 13, color: '#888', lineHeight: 18 },
  sectionLabel: { fontSize: 13, color: '#aaa', fontWeight: '600', marginBottom: 10, marginTop: 8 },
  list: { gap: 8, marginBottom: 24 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#111',
  },
  optionActive: { borderColor: '#7c6af7', backgroundColor: '#1a1840' },
  optionText: { fontSize: 14, color: '#ccc', flex: 1 },
  optionTextActive: { color: '#c4b8ff', fontWeight: '600' },
  optionEmoji: { fontSize: 18 },
  personaInfo: { flex: 1 },
  personaTone: { fontSize: 11, color: '#555', marginTop: 2 },
  btn: {
    backgroundColor: '#7c6af7',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
