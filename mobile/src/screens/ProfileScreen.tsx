import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView,
  ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useApp } from '../context/AppContext';
import { Profile } from '../context/AppContext';
import { callAIOnce } from '../services/ai';

type TabKey = 'personal' | 'personality' | 'numerology' | 'astrology' | 'files';

export default function ProfileScreen() {
  const { state, saveProfile } = useApp();
  const [tab, setTab] = useState<TabKey>('personal');
  const [generating, setGenerating] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(field: keyof Profile, value: string) {
    saveProfile({ ...state.profile, [field]: value });
  }

  function updateExtra(field: string, value: string) {
    saveProfile({ ...state.profile, extra: { ...state.profile.extra, [field]: value } });
  }

  async function pickFile() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/plain', 'application/pdf', 'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      let content = '';
      try {
        content = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.UTF8 });
      } catch {
        content = `[Binary file: ${asset.name}]`;
      }

      const newFile = { name: asset.name, content };
      await saveProfile({ ...state.profile, files: [...state.profile.files, newFile] });
    } catch {
      Alert.alert('Error', 'Could not read the file.');
    }
  }

  async function removeFile(name: string) {
    await saveProfile({ ...state.profile, files: state.profile.files.filter((f) => f.name !== name) });
  }

  async function generatePersonalitySummary() {
    if (!state.hasApiKey) {
      Alert.alert('No API Key', 'Please add an API key in the AI Settings tab.');
      return;
    }
    setGenerating(true);
    try {
      const { extra, name, title, summary, strengths, background } = state.profile;
      const prompt = [
        `Name: ${name}, Title: ${title}`,
        summary && `Summary: ${summary}`,
        strengths && `Strengths: ${strengths}`,
        background && `Background: ${background}`,
        extra.mbti && `MBTI: ${extra.mbti}`,
        extra.bigfive && `Big Five: ${extra.bigfive}`,
        extra.lifepath && `Life Path: ${extra.lifepath}`,
        extra.sun && `Sun: ${extra.sun}, Moon: ${extra.moon}, Rising: ${extra.rising}`,
        'Based on published research on these personality systems, write a 2-3 paragraph synthesis of this person\'s communication style, strengths, and how they show up in professional environments. Be specific and actionable.',
      ].filter(Boolean).join('\n');

      const result = await callAIOnce([{ role: 'user', content: prompt }],
        'You are a professional coach synthesizing personality data into actionable career insights.', 512);
      await saveProfile({ ...state.profile, personality: result });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      Alert.alert('Generation Failed', msg);
    } finally {
      setGenerating(false);
    }
  }

  const TABS: { key: TabKey; label: string; icon: string }[] = [
    { key: 'personal', label: 'Personal', icon: '👤' },
    { key: 'personality', label: 'MBTI/B5', icon: '🧠' },
    { key: 'numerology', label: 'Numerology', icon: '🔢' },
    { key: 'astrology', label: 'Astrology', icon: '♈' },
    { key: 'files', label: 'Files', icon: '📎' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.screenTitle}>👤 My Profile</Text>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabs}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={styles.tabIcon}>{t.icon}</Text>
            <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content}>
        {tab === 'personal' && (
          <>
            <Field label="Full Name" value={state.profile.name} onChange={(v) => update('name', v)} placeholder="Jane Smith" />
            <Field label="Professional Title" value={state.profile.title} onChange={(v) => update('title', v)} placeholder="Senior Product Manager" />
            <Field label="Professional Summary" value={state.profile.summary} onChange={(v) => update('summary', v)} multiline placeholder="Brief professional summary..." />
            <Field label="Core Strengths" value={state.profile.strengths} onChange={(v) => update('strengths', v)} multiline placeholder="Leadership, strategic thinking..." />
            <Field label="Work History" value={state.profile.background} onChange={(v) => update('background', v)} multiline placeholder="Career background and key experiences..." />

            <Text style={styles.sectionLabel}>AI Personality Summary</Text>
            <TouchableOpacity style={styles.generateBtn} onPress={generatePersonalitySummary} disabled={generating}>
              {generating ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.generateBtnText}>✦ Generate AI Summary</Text>}
            </TouchableOpacity>
            {state.profile.personality ? (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryText}>{state.profile.personality}</Text>
              </View>
            ) : null}
          </>
        )}

        {tab === 'personality' && (
          <>
            <Field label="MBTI Type" value={state.profile.extra.mbti} onChange={(v) => updateExtra('mbti', v)} placeholder="e.g. INTJ" />
            <Field label="Big Five" value={state.profile.extra.bigfive} onChange={(v) => updateExtra('bigfive', v)} multiline placeholder="e.g. O:85, C:72, E:45..." />
          </>
        )}

        {tab === 'numerology' && (
          <>
            <Field label="Life Path Number" value={state.profile.extra.lifepath} onChange={(v) => updateExtra('lifepath', v)} placeholder="e.g. 7" />
            <Field label="Expression Number" value={state.profile.extra.expression} onChange={(v) => updateExtra('expression', v)} placeholder="e.g. 3" />
            <Field label="Soul Urge Number" value={state.profile.extra.soulurge} onChange={(v) => updateExtra('soulurge', v)} placeholder="e.g. 9" />
            <Field label="Destiny Number" value={state.profile.extra.destiny} onChange={(v) => updateExtra('destiny', v)} placeholder="e.g. 5" />
            <Field label="Notes" value={state.profile.extra['numerology-notes']} onChange={(v) => updateExtra('numerology-notes', v)} multiline placeholder="Any additional numerology notes..." />
          </>
        )}

        {tab === 'astrology' && (
          <>
            <Field label="Sun Sign" value={state.profile.extra.sun} onChange={(v) => updateExtra('sun', v)} placeholder="e.g. Scorpio" />
            <Field label="Moon Sign" value={state.profile.extra.moon} onChange={(v) => updateExtra('moon', v)} placeholder="e.g. Pisces" />
            <Field label="Rising Sign" value={state.profile.extra.rising} onChange={(v) => updateExtra('rising', v)} placeholder="e.g. Libra" />
            <Field label="Mercury" value={state.profile.extra.mercury} onChange={(v) => updateExtra('mercury', v)} placeholder="e.g. Sagittarius" />
            <Field label="Venus" value={state.profile.extra.venus} onChange={(v) => updateExtra('venus', v)} placeholder="e.g. Capricorn" />
            <Field label="Mars" value={state.profile.extra.mars} onChange={(v) => updateExtra('mars', v)} placeholder="e.g. Aries" />
            <Field label="Notes" value={state.profile.extra['astro-notes']} onChange={(v) => updateExtra('astro-notes', v)} multiline placeholder="Chart notes..." />
          </>
        )}

        {tab === 'files' && (
          <>
            <Text style={styles.sectionLabel}>Uploaded Documents</Text>
            {state.profile.files.map((f) => (
              <View key={f.name} style={styles.fileRow}>
                <Ionicons name="document-outline" size={16} color="#7c6af7" />
                <Text style={styles.fileName} numberOfLines={1}>{f.name}</Text>
                <TouchableOpacity onPress={() => removeFile(f.name)}>
                  <Ionicons name="close-circle-outline" size={18} color="#555" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.uploadBtn} onPress={pickFile}>
              <Ionicons name="cloud-upload-outline" size={18} color="#7c6af7" />
              <Text style={styles.uploadText}>Upload Resume / Cover Letter</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 48 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, value, onChange, placeholder, multiline }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean;
}) {
  return (
    <View style={fieldStyles.group}>
      <Text style={fieldStyles.label}>{label}</Text>
      <TextInput
        style={[fieldStyles.input, multiline && fieldStyles.multiline]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#333"
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  group: { marginBottom: 16 },
  label: { fontSize: 12, color: '#888', fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#111', borderWidth: 1, borderColor: '#222', borderRadius: 10, padding: 12, color: '#fff', fontSize: 14 },
  multiline: { minHeight: 88, textAlignVertical: 'top' },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080814' },
  screenTitle: { fontSize: 22, color: '#fff', fontWeight: '700', padding: 20, paddingBottom: 8 },
  tabScroll: { flexGrow: 0, borderBottomWidth: 1, borderBottomColor: '#111' },
  tabs: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#222', backgroundColor: '#111' },
  tabActive: { borderColor: '#7c6af7', backgroundColor: '#1a1840' },
  tabIcon: { fontSize: 14 },
  tabLabel: { fontSize: 12, color: '#666' },
  tabLabelActive: { color: '#c4b8ff', fontWeight: '600' },
  content: { padding: 20 },
  sectionLabel: { fontSize: 12, color: '#888', fontWeight: '600', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  generateBtn: { backgroundColor: '#7c6af7', borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 16 },
  generateBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  summaryCard: { backgroundColor: '#12122a', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#2a2a4a', marginBottom: 16 },
  summaryText: { color: '#e0e0ff', fontSize: 14, lineHeight: 22 },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#111' },
  fileName: { flex: 1, color: '#aaa', fontSize: 13 },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderWidth: 1, borderColor: '#7c6af7', borderRadius: 10, marginTop: 12, borderStyle: 'dashed' },
  uploadText: { color: '#7c6af7', fontSize: 14 },
});
