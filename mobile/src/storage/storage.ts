import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export const SK = {
  pin: 'il_pin_v1',
  prefs: 'il_prefs_v2',
  profile: 'il_profile_v2',
  sessions: 'il_sessions_v2',
  scripts: 'il_scripts_v1',
  provider: 'il_provider',
  model: 'il_model',
  ollamaUrl: 'il_ollama_url',
  onboarded: 'il_onboarded',
};

export function providerKey(providerId: string) {
  return `il_key_${providerId}`;
}

export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setItem(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeItem(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export async function getApiKey(providerId: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(providerKey(providerId));
  } catch {
    return null;
  }
}

export async function setApiKey(providerId: string, key: string): Promise<void> {
  await SecureStore.setItemAsync(providerKey(providerId), key);
}

export async function deleteApiKey(providerId: string): Promise<void> {
  await SecureStore.deleteItemAsync(providerKey(providerId));
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.clear();
  // Also clear API keys from secure store
  const providers = ['anthropic', 'openai', 'gemini', 'mistral', 'deepseek', 'ollama'];
  await Promise.all(providers.map((p) => SecureStore.deleteItemAsync(providerKey(p)).catch(() => {})));
}
