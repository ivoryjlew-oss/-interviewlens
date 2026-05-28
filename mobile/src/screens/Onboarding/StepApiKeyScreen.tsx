import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator,
  Alert, ScrollView, SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParams } from '../../navigation/AppNavigator';
import { AI_PROVIDERS } from '../../constants/providers';
import { testApiKey } from '../../services/ai';
import { setApiKey } from '../../storage/storage';

type Props = NativeStackScreenProps<OnboardingStackParams, 'StepApiKey'>;

export default function StepApiKeyScreen({ navigation, route }: Props) {
  const { providerId } = route.params;
  const provider = AI_PROVIDERS.find((p) => p.id === providerId)!;
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    if (provider.local) {
      navigation.navigate('StepPrefs', { providerId, model: provider.defaultModel });
      return;
    }
    if (!key.trim()) {
      Alert.alert('API Key Required', 'Please enter your API key to continue.');
      return;
    }
    setLoading(true);
    const valid = await testApiKey(key.trim(), providerId);
    setLoading(false);
    if (!valid) {
      Alert.alert('Invalid Key', 'The API key could not be verified. Please check it and try again.');
      return;
    }
    await setApiKey(providerId, key.trim());
    navigation.navigate('StepPrefs', { providerId, model: provider.defaultModel });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.logo}>✦ Phorya</Text>

        <View style={styles.card}>
          <Text style={styles.step}>Step 2 of 3</Text>
          <Text style={styles.title}>Enter your {provider.shortLabel} API key</Text>
          {provider.local ? (
            <Text style={styles.subtitle}>Ollama runs locally — no API key needed. Make sure Ollama is running on your network.</Text>
          ) : (
            <Text style={styles.subtitle}>Your key is encrypted and stored only on this device. It's sent directly to {provider.label} — never to us.</Text>
          )}
        </View>

        {!provider.local && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>API Key</Text>
            <TextInput
              style={styles.input}
              value={key}
              onChangeText={setKey}
              placeholder={provider.keyPlaceholder}
              placeholderTextColor="#444"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        )}

        <TouchableOpacity style={styles.btn} onPress={handleContinue} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>{provider.local ? 'Continue →' : 'Verify & Continue →'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080814' },
  container: { padding: 24, paddingTop: 48 },
  logo: { fontSize: 28, color: '#7c6af7', fontWeight: '700', marginBottom: 32 },
  card: { backgroundColor: '#12122a', borderRadius: 16, padding: 20, marginBottom: 24 },
  step: { fontSize: 12, color: '#7c6af7', fontWeight: '600', marginBottom: 6 },
  title: { fontSize: 20, color: '#fff', fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 13, color: '#888', lineHeight: 18 },
  inputGroup: { marginBottom: 24 },
  inputLabel: { fontSize: 13, color: '#aaa', marginBottom: 8, fontWeight: '600' },
  input: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 15,
  },
  btn: {
    backgroundColor: '#7c6af7',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  back: { alignItems: 'center' },
  backText: { color: '#555', fontSize: 14 },
});
