import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView,
  ActivityIndicator, Alert, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { AI_PROVIDERS } from '../constants/providers';
import { testApiKey } from '../services/ai';
import { getApiKey, setApiKey, deleteApiKey, setItem, getItem, SK, clearAllData } from '../storage/storage';
import PinScreen from './PinScreen';

export default function AISettingsScreen() {
  const { state, dispatch } = useApp();
  const [keyInputs, setKeyInputs] = useState<Record<string, string>>({});
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, boolean | null>>({});
  const [showPinSetup, setShowPinSetup] = useState(false);

  useEffect(() => {
    loadExistingKeys();
  }, []);

  async function loadExistingKeys() {
    const result: Record<string, string> = {};
    for (const p of AI_PROVIDERS) {
      if (!p.local) {
        const k = await getApiKey(p.id);
        if (k) result[p.id] = k;
      }
    }
    setKeyInputs(result);
  }

  async function handleSaveKey(providerId: string) {
    const key = keyInputs[providerId]?.trim();
    if (!key) {
      Alert.alert('Empty Key', 'Please enter an API key.');
      return;
    }
    await setApiKey(providerId, key);
    if (state.providerId === providerId) {
      dispatch({ type: 'SET_HAS_API_KEY', payload: true });
    }
    Alert.alert('Saved', 'API key saved securely.');
  }

  async function handleDeleteKey(providerId: string) {
    Alert.alert('Delete Key', `Remove API key for ${providerId}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await deleteApiKey(providerId);
          setKeyInputs((prev) => { const n = { ...prev }; delete n[providerId]; return n; });
          if (state.providerId === providerId) {
            dispatch({ type: 'SET_HAS_API_KEY', payload: false });
          }
        },
      },
    ]);
  }

  async function handleTest(providerId: string) {
    const key = keyInputs[providerId]?.trim();
    if (!key) {
      Alert.alert('No Key', 'Enter an API key first.');
      return;
    }
    setTesting(providerId);
    const ok = await testApiKey(key, providerId);
    setTesting(null);
    setTestResults((prev) => ({ ...prev, [providerId]: ok }));
  }

  function selectProvider(providerId: string) {
    const provider = AI_PROVIDERS.find((p) => p.id === providerId)!;
    setItem(SK.provider, providerId);
    setItem(SK.model, provider.defaultModel);
    dispatch({
      type: 'SET_PROVIDER',
      payload: { providerId, model: provider.defaultModel, hasApiKey: provider.local || !!keyInputs[providerId] },
    });
  }

  function selectModel(model: string) {
    setItem(SK.model, model);
    dispatch({ type: 'SET_PROVIDER', payload: { providerId: state.providerId, model, hasApiKey: state.hasApiKey } });
  }

  async function handleClearData() {
    Alert.alert(
      'Clear All Data',
      'This will delete all sessions, scripts, profile data, and API keys. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Everything', style: 'destructive', onPress: async () => {
            await clearAllData();
            Alert.alert('Cleared', 'All data has been deleted. Please restart the app.');
          },
        },
      ],
    );
  }

  async function handleDisablePin() {
    Alert.alert('Disable PIN', 'Remove PIN protection?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Disable', style: 'destructive', onPress: async () => {
          await setItem(SK.pin, null);
          dispatch({ type: 'SET_PIN_ENABLED', payload: false });
        },
      },
    ]);
  }

  const currentProvider = AI_PROVIDERS.find((p) => p.id === state.providerId)!;

  if (showPinSetup) {
    return <PinScreen mode="set" onSuccess={() => setShowPinSetup(false)} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.screenTitle}>⚙️ AI Settings</Text>

        {/* Provider selection */}
        <Text style={styles.sectionTitle}>AI Provider</Text>
        <View style={styles.providerList}>
          {AI_PROVIDERS.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[styles.providerOption, state.providerId === p.id && styles.providerOptionActive]}
              onPress={() => selectProvider(p.id)}
            >
              <View style={styles.providerInfo}>
                <Text style={[styles.providerLabel, state.providerId === p.id && styles.providerLabelActive]}>{p.label}</Text>
                {p.free && <Text style={styles.badgeFree}>FREE</Text>}
                {p.local && <Text style={styles.badgeLocal}>LOCAL</Text>}
              </View>
              {state.providerId === p.id && <Ionicons name="checkmark-circle" size={20} color="#7c6af7" />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Model selection */}
        <Text style={styles.sectionTitle}>Model</Text>
        <View style={styles.modelList}>
          {currentProvider.models.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[styles.modelOption, state.model === m.id && styles.modelOptionActive]}
              onPress={() => selectModel(m.id)}
            >
              <Text style={[styles.modelLabel, state.model === m.id && styles.modelLabelActive]}>{m.label}</Text>
              {state.model === m.id && <Ionicons name="checkmark" size={16} color="#7c6af7" />}
            </TouchableOpacity>
          ))}
        </View>

        {/* API Keys */}
        <Text style={styles.sectionTitle}>API Keys</Text>
        {AI_PROVIDERS.filter((p) => !p.local).map((p) => (
          <View key={p.id} style={styles.keyCard}>
            <Text style={styles.keyLabel}>{p.label}</Text>
            <View style={styles.keyRow}>
              <TextInput
                style={styles.keyInput}
                value={keyInputs[p.id] ?? ''}
                onChangeText={(v) => setKeyInputs((prev) => ({ ...prev, [p.id]: v }))}
                placeholder={p.keyPlaceholder}
                placeholderTextColor="#333"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <View style={styles.keyActions}>
              <TouchableOpacity style={styles.testBtn} onPress={() => handleTest(p.id)} disabled={testing === p.id}>
                {testing === p.id ? (
                  <ActivityIndicator size="small" color="#7c6af7" />
                ) : (
                  <Text style={styles.testBtnText}>
                    {testResults[p.id] === true ? '✓ Valid' : testResults[p.id] === false ? '✗ Invalid' : 'Test'}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveKeyBtn} onPress={() => handleSaveKey(p.id)}>
                <Text style={styles.saveKeyText}>Save</Text>
              </TouchableOpacity>
              {keyInputs[p.id] && (
                <TouchableOpacity style={styles.deleteKeyBtn} onPress={() => handleDeleteKey(p.id)}>
                  <Ionicons name="trash-outline" size={16} color="#ff5f57" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {/* PIN */}
        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.securityCard}>
          <View style={styles.pinRow}>
            <View>
              <Text style={styles.pinLabel}>PIN Lock</Text>
              <Text style={styles.pinSub}>Require a PIN to open the app</Text>
            </View>
            <Switch
              value={state.pinEnabled}
              onValueChange={(v) => {
                if (v) setShowPinSetup(true);
                else handleDisablePin();
              }}
              trackColor={{ false: '#222', true: '#7c6af7' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Danger zone */}
        <Text style={styles.sectionTitle}>Data</Text>
        <TouchableOpacity style={styles.dangerBtn} onPress={handleClearData}>
          <Ionicons name="trash-outline" size={16} color="#ff5f57" />
          <Text style={styles.dangerText}>Clear All App Data</Text>
        </TouchableOpacity>

        <View style={{ height: 48 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080814' },
  container: { padding: 20, paddingBottom: 48 },
  screenTitle: { fontSize: 22, color: '#fff', fontWeight: '700', marginBottom: 20 },
  sectionTitle: { fontSize: 12, color: '#7c6af7', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginTop: 24 },
  providerList: { gap: 8 },
  providerOption: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#222', backgroundColor: '#111' },
  providerOptionActive: { borderColor: '#7c6af7', backgroundColor: '#1a1840' },
  providerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  providerLabel: { fontSize: 14, color: '#ccc', fontWeight: '600' },
  providerLabelActive: { color: '#c4b8ff' },
  badgeFree: { fontSize: 10, fontWeight: '700', color: '#3dd68c', backgroundColor: '#1a3a1a', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  badgeLocal: { fontSize: 10, fontWeight: '700', color: '#5b8eff', backgroundColor: '#1a2a3a', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  modelList: { gap: 6 },
  modelOption: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#1a1a2e', backgroundColor: '#0d0d1a' },
  modelOptionActive: { borderColor: '#7c6af7' },
  modelLabel: { flex: 1, fontSize: 13, color: '#888' },
  modelLabelActive: { color: '#c4b8ff', fontWeight: '600' },
  keyCard: { backgroundColor: '#111', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#1a1a2e' },
  keyLabel: { fontSize: 13, color: '#aaa', fontWeight: '600', marginBottom: 8 },
  keyRow: { marginBottom: 8 },
  keyInput: { backgroundColor: '#0d0d1a', borderWidth: 1, borderColor: '#222', borderRadius: 8, padding: 10, color: '#fff', fontSize: 13 },
  keyActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  testBtn: { borderWidth: 1, borderColor: '#7c6af7', borderRadius: 7, paddingHorizontal: 10, paddingVertical: 6, minWidth: 64, alignItems: 'center' },
  testBtnText: { color: '#7c6af7', fontSize: 12, fontWeight: '600' },
  saveKeyBtn: { backgroundColor: '#7c6af7', borderRadius: 7, paddingHorizontal: 12, paddingVertical: 6 },
  saveKeyText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  deleteKeyBtn: { padding: 6 },
  securityCard: { backgroundColor: '#111', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#1a1a2e' },
  pinRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pinLabel: { fontSize: 14, color: '#ddd', fontWeight: '600' },
  pinSub: { fontSize: 12, color: '#555', marginTop: 2 },
  dangerBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#ff5f57', backgroundColor: '#1a0a0a' },
  dangerText: { color: '#ff5f57', fontSize: 14, fontWeight: '600' },
});
