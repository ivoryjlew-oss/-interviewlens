import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  SafeAreaView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { useApp } from '../context/AppContext';
import { callAI, detectMood } from '../services/ai';
import { COMPLETION_PHRASES, MOOD_CFG } from '../constants/moods';
import { MoodItem, QAItem, Session } from '../context/AppContext';
import MoodBar from '../components/MoodBar';
import PersonaPicker from '../components/PersonaPicker';

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export default function LiveQAScreen() {
  const { state, dispatch, saveSessions } = useApp();
  const [question, setQuestion] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const isAutoStopped = useRef(false);

  function checkCompletionPhrases(text: string): boolean {
    const lower = text.toLowerCase();
    return COMPLETION_PHRASES.some((phrase) => lower.includes(phrase));
  }

  async function startSession() {
    dispatch({ type: 'SET_IS_LIVE', payload: true });
    dispatch({ type: 'SET_SESSION_START', payload: new Date().toISOString() });
    dispatch({ type: 'SET_QA_HISTORY', payload: [] });
    dispatch({ type: 'SET_MOOD_HISTORY', payload: [] });
    dispatch({ type: 'SET_CURRENT_MOOD', payload: { mood: 'neutral', confidence: 0.5 } });
    isAutoStopped.current = false;
  }

  async function endSession(autoStopped = false) {
    dispatch({ type: 'SET_IS_LIVE', payload: false });

    if (state.qaHistory.length === 0 && !autoStopped) return;

    // Auto-save session
    const sessionId = uid();
    const overallMood = state.moodHistory.length > 0
      ? state.moodHistory[Math.floor(state.moodHistory.length / 2)].mood
      : 'neutral';

    const session: Session = {
      id: sessionId,
      company: state.company || 'Unknown Company',
      role: state.jobTitle || 'Unknown Role',
      date: new Date().toISOString(),
      startTime: state.sessionStart,
      qa: state.qaHistory,
      moodHistory: state.moodHistory,
      persona: state.persona.id,
      personaLabel: state.persona.label,
      overallMood,
      context: state.qaContext,
    };

    const company = session.company;
    const updated = { ...state.sessions };
    if (!updated[company]) updated[company] = [];
    updated[company] = [session, ...updated[company]];
    await saveSessions(updated);

    Alert.alert('Session Saved', `Saved under "${company}"`);
  }

  async function sendQuestion() {
    const q = question.trim();
    if (!q || state.qaLoading) return;
    if (!state.hasApiKey) {
      Alert.alert('No API Key', 'Please add an API key in the AI Settings tab.');
      return;
    }

    setQuestion('');
    dispatch({ type: 'SET_QA_LOADING', payload: true });
    setCurrentAnswer('');

    // Check completion
    if (checkCompletionPhrases(q)) {
      dispatch({ type: 'SET_QA_LOADING', payload: false });
      isAutoStopped.current = true;
      await endSession(true);
      return;
    }

    // Detect mood
    const prevMoods = state.moodHistory.map((m) => m.mood);
    const moodResult = await detectMood(q, prevMoods);
    dispatch({ type: 'SET_CURRENT_MOOD', payload: moodResult });
    const newMoods = [...state.moodHistory, moodResult];
    dispatch({ type: 'SET_MOOD_HISTORY', payload: newMoods });

    // Build messages
    const history = state.qaHistory.flatMap((item) => [
      { role: 'user' as const, content: item.q },
      { role: 'assistant' as const, content: item.a },
    ]);

    const profileParts: string[] = [];
    if (state.profile.name) profileParts.push(`Name: ${state.profile.name}`);
    if (state.profile.title) profileParts.push(`Title: ${state.profile.title}`);
    if (state.profile.summary) profileParts.push(`Summary: ${state.profile.summary}`);
    if (state.profile.background) profileParts.push(`Background: ${state.profile.background}`);

    const system = [
      state.persona.systemPrompt,
      profileParts.length > 0 && `\nCandidate profile:\n${profileParts.join('\n')}`,
      state.jobTitle && `\nRole: ${state.jobTitle}`,
      state.company && `\nCompany: ${state.company}`,
      state.qaContext && `\nAdditional context: ${state.qaContext}`,
      `\nInterviewer mood: ${MOOD_CFG[moodResult.mood].label}. Adapt your response accordingly.`,
    ].filter(Boolean).join('');

    let fullAnswer = '';
    try {
      await callAI(
        [...history, { role: 'user', content: q }],
        system,
        (chunk) => {
          fullAnswer += chunk;
          setCurrentAnswer((prev) => prev + chunk);
        },
        1024,
      );

      const newQA: QAItem = { q, a: fullAnswer, index: state.qaHistory.length };
      const updatedHistory = [...state.qaHistory, newQA];
      dispatch({ type: 'SET_QA_HISTORY', payload: updatedHistory });
      setCurrentAnswer('');

      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      Alert.alert('Error', msg);
    } finally {
      dispatch({ type: 'SET_QA_LOADING', payload: false });
    }
  }

  async function exportTxt() {
    if (!state.qaHistory.length) return;
    const lines = state.qaHistory.map((item) => `Q: ${item.q}\n\nA: ${item.a}`).join('\n\n---\n\n');
    const header = `Phorya Live Q&A Session\nCompany: ${state.company || 'N/A'} | Role: ${state.jobTitle || 'N/A'}\nDate: ${new Date().toLocaleDateString()}\n\n`;
    try {
      const path = FileSystem.cacheDirectory + `phorya-qa-${Date.now()}.txt`;
      await FileSystem.writeAsStringAsync(path, header + lines);
      await Sharing.shareAsync(path, { mimeType: 'text/plain' });
    } catch {
      Alert.alert('Export Failed');
    }
  }

  async function exportPdf() {
    if (!state.qaHistory.length) return;
    const qaHtml = state.qaHistory.map((item) => `
      <div style="margin-bottom:24px">
        <p style="color:#5a4ac7;font-weight:bold">Q: ${item.q}</p>
        <p style="color:#111">${item.a.replace(/\n/g, '<br/>')}</p>
      </div>
    `).join('<hr/>');
    const html = `<html><body style="font-family:sans-serif;padding:24px;font-size:14px;line-height:1.6">
      <h2>Phorya Live Q&amp;A</h2>
      <p><b>Company:</b> ${state.company || 'N/A'} | <b>Role:</b> ${state.jobTitle || 'N/A'}</p>
      ${qaHtml}
    </body></html>`;
    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
    } catch {
      Alert.alert('Export Failed');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>⚡ Live Q&A</Text>
          {state.isLive ? (
            <TouchableOpacity onPress={() => endSession(false)} style={styles.endBtn}>
              <Text style={styles.endBtnText}>End Session</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={startSession} style={styles.startBtn}>
              <Text style={styles.startBtnText}>Start Session</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Persona */}
        <View style={styles.personaRow}>
          <PersonaPicker
            selected={state.persona}
            onSelect={(p) => dispatch({ type: 'SET_PERSONA', payload: p })}
          />
        </View>

        {/* Mood bar */}
        {state.isLive && (
          <View style={styles.moodContainer}>
            <MoodBar currentMood={state.currentMood} />
          </View>
        )}

        {/* Q&A history */}
        <ScrollView ref={scrollRef} style={styles.history} contentContainerStyle={styles.historyContent}>
          {!state.isLive && state.qaHistory.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>⚡</Text>
              <Text style={styles.emptyTitle}>Live Interview Coaching</Text>
              <Text style={styles.emptySub}>Tap "Start Session" then type or speak each interview question to get instant AI coaching responses.</Text>
            </View>
          )}

          {state.qaHistory.map((item, i) => (
            <View key={i} style={styles.qaBlock}>
              <View style={styles.questionBubble}>
                <Text style={styles.questionLabel}>Q</Text>
                <Text style={styles.questionText}>{item.q}</Text>
              </View>
              <View style={styles.answerBubble}>
                <Text style={styles.answerText}>{item.a}</Text>
              </View>
            </View>
          ))}

          {state.qaLoading && (
            <View style={styles.streamingBlock}>
              {currentAnswer ? (
                <Text style={styles.streamingText}>{currentAnswer}▋</Text>
              ) : (
                <ActivityIndicator color="#7c6af7" />
              )}
            </View>
          )}
        </ScrollView>

        {/* Input */}
        {state.isLive && (
          <View style={styles.inputArea}>
            {state.qaHistory.length > 0 && (
              <View style={styles.exportRow}>
                <TouchableOpacity onPress={exportTxt} style={styles.exportBtn}>
                  <Ionicons name="download-outline" size={14} color="#7c6af7" />
                  <Text style={styles.exportText}>TXT</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={exportPdf} style={styles.exportBtn}>
                  <Ionicons name="document-text-outline" size={14} color="#7c6af7" />
                  <Text style={styles.exportText}>PDF</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={question}
                onChangeText={setQuestion}
                placeholder="Type the interviewer's question..."
                placeholderTextColor="#333"
                multiline
                onSubmitEditing={sendQuestion}
              />
              <TouchableOpacity
                style={[styles.sendBtn, (!question.trim() || state.qaLoading) && styles.sendBtnDisabled]}
                onPress={sendQuestion}
                disabled={!question.trim() || state.qaLoading}
              >
                <Ionicons name="send" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080814' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#111' },
  title: { flex: 1, fontSize: 20, color: '#fff', fontWeight: '700' },
  startBtn: { backgroundColor: '#7c6af7', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  startBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  endBtn: { backgroundColor: '#ff5f57', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  endBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  personaRow: { paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#111' },
  moodContainer: { paddingHorizontal: 16, paddingTop: 8 },
  history: { flex: 1 },
  historyContent: { padding: 16, paddingBottom: 8 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, color: '#fff', fontWeight: '600', marginBottom: 8 },
  emptySub: { fontSize: 13, color: '#555', textAlign: 'center', lineHeight: 18, maxWidth: 280 },
  qaBlock: { marginBottom: 24 },
  questionBubble: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 10 },
  questionLabel: { fontSize: 11, fontWeight: '700', color: '#7c6af7', backgroundColor: '#1a1840', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  questionText: { flex: 1, fontSize: 14, color: '#aaa', fontStyle: 'italic', lineHeight: 20 },
  answerBubble: { backgroundColor: '#12122a', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#2a2a4a' },
  answerText: { color: '#e0e0ff', fontSize: 15, lineHeight: 24 },
  streamingBlock: { backgroundColor: '#12122a', borderRadius: 12, padding: 14, marginBottom: 16 },
  streamingText: { color: '#e0e0ff', fontSize: 15, lineHeight: 24 },
  inputArea: { borderTopWidth: 1, borderTopColor: '#111', padding: 12 },
  exportRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  exportBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#7c6af7', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5 },
  exportText: { color: '#7c6af7', fontSize: 12, fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  input: { flex: 1, backgroundColor: '#111', borderWidth: 1, borderColor: '#222', borderRadius: 12, padding: 12, color: '#fff', fontSize: 14, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#7c6af7', justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: '#2a2a4a' },
});
