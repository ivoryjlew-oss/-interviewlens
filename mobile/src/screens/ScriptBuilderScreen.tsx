import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useApp } from '../context/AppContext';
import { QUESTION_TYPES } from '../constants/moods';
import { generateScript } from '../services/ai';
import PersonaPicker from '../components/PersonaPicker';

export default function ScriptBuilderScreen() {
  const { state, dispatch } = useApp();
  const [questionType, setQuestionType] = useState('intro');
  const [streaming, setStreaming] = useState(false);
  const [output, setOutput] = useState('');
  const [showQuestionPicker, setShowQuestionPicker] = useState(false);

  const selectedQuestion = QUESTION_TYPES.find((q) => q.id === questionType)!;

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
        content = `[${asset.name}: binary file — describe its content in the job description field]`;
      }

      const newFile = { name: asset.name, content };
      dispatch({ type: 'SET_BUILDER_FILES', payload: [...state.builderFiles, newFile] });
    } catch (e) {
      Alert.alert('Error', 'Could not read the file.');
    }
  }

  function removeFile(name: string) {
    dispatch({ type: 'SET_BUILDER_FILES', payload: state.builderFiles.filter((f) => f.name !== name) });
  }

  async function handleGenerate() {
    if (!state.hasApiKey) {
      Alert.alert('No API Key', 'Please add an API key in the AI Settings tab first.');
      return;
    }
    setStreaming(true);
    setOutput('');
    dispatch({ type: 'SET_GEN_LOADING', payload: true });

    const additionalContext = state.builderFiles.map((f) => `--- ${f.name} ---\n${f.content}`).join('\n\n');

    try {
      await generateScript(
        questionType,
        state.profile as unknown as Record<string, unknown>,
        state.jobTitle,
        state.company,
        state.jobDesc,
        state.persona.systemPrompt,
        additionalContext,
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      Alert.alert('Generation Failed', msg);
    } finally {
      setStreaming(false);
      dispatch({ type: 'SET_GEN_LOADING', payload: false });
    }
  }

  async function generate() {
    if (!state.hasApiKey) {
      Alert.alert('No API Key', 'Please add an API key in the AI Settings tab first.');
      return;
    }
    setStreaming(true);
    setOutput('');

    const additionalContext = state.builderFiles.map((f) => `--- ${f.name} ---\n${f.content}`).join('\n\n');

    try {
      const { callAI } = await import('../services/ai');
      const { AI_PERSONAS } = await import('../constants/personas');
      const persona = AI_PERSONAS.find((p) => p.id === state.persona.id) ?? AI_PERSONAS[0];

      const profileParts: string[] = [];
      if (state.profile.name) profileParts.push(`Name: ${state.profile.name}`);
      if (state.profile.title) profileParts.push(`Title: ${state.profile.title}`);
      if (state.profile.summary) profileParts.push(`Summary: ${state.profile.summary}`);
      if (state.profile.strengths) profileParts.push(`Strengths: ${state.profile.strengths}`);
      if (state.profile.background) profileParts.push(`Background: ${state.profile.background}`);

      const prompt = [
        profileParts.length > 0 && `Candidate profile:\n${profileParts.join('\n')}`,
        state.jobTitle && `Role: ${state.jobTitle}`,
        state.company && `Company: ${state.company}`,
        state.jobDesc && `Job description:\n${state.jobDesc}`,
        additionalContext && `Additional context:\n${additionalContext}`,
        `\nGenerate a compelling answer to: "${selectedQuestion.label}"`,
      ].filter(Boolean).join('\n\n');

      await callAI(
        [{ role: 'user', content: prompt }],
        `${persona.systemPrompt}\n\nYou generate interview scripts tailored to the candidate's background. Be specific, authentic, and compelling. Output only the script text.`,
        (chunk) => setOutput((prev) => prev + chunk),
        2048,
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      Alert.alert('Generation Failed', msg);
    } finally {
      setStreaming(false);
    }
  }

  async function exportTxt() {
    if (!output) return;
    try {
      const path = FileSystem.cacheDirectory + `phorya-script-${Date.now()}.txt`;
      await FileSystem.writeAsStringAsync(path, output);
      await Sharing.shareAsync(path, { mimeType: 'text/plain' });
    } catch {
      Alert.alert('Export Failed', 'Could not export the file.');
    }
  }

  async function exportPdf() {
    if (!output) return;
    try {
      const html = `<html><body style="font-family:sans-serif;padding:24px;font-size:16px;line-height:1.6;color:#111">
        <h2 style="color:#5a4ac7">${selectedQuestion.label}</h2>
        <p>${output.replace(/\n/g, '<br/>')}</p>
      </body></html>`;
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
    } catch {
      Alert.alert('Export Failed', 'Could not export PDF.');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.screenTitle}>✦ Script Builder</Text>

        {/* Question Type */}
        <Text style={styles.label}>Question Type</Text>
        <TouchableOpacity style={styles.typePicker} onPress={() => setShowQuestionPicker(true)}>
          <Text style={styles.typePickerText}>{selectedQuestion.label}</Text>
          <Ionicons name="chevron-down" size={16} color="#888" />
        </TouchableOpacity>

        {showQuestionPicker && (
          <View style={styles.typeList}>
            {QUESTION_TYPES.map((qt) => (
              <TouchableOpacity
                key={qt.id}
                style={[styles.typeOption, questionType === qt.id && styles.typeOptionActive]}
                onPress={() => { setQuestionType(qt.id); setShowQuestionPicker(false); }}
              >
                <Text style={[styles.typeOptionText, questionType === qt.id && styles.typeOptionActive]}>{qt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Job context */}
        <Text style={styles.label}>Role</Text>
        <TextInput
          style={styles.input}
          value={state.jobTitle}
          onChangeText={(v) => dispatch({ type: 'SET_JOB_TITLE', payload: v })}
          placeholder="e.g. Senior Product Manager"
          placeholderTextColor="#444"
        />

        <Text style={styles.label}>Company</Text>
        <TextInput
          style={styles.input}
          value={state.company}
          onChangeText={(v) => dispatch({ type: 'SET_COMPANY', payload: v })}
          placeholder="e.g. Google"
          placeholderTextColor="#444"
        />

        <Text style={styles.label}>Job Description</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={state.jobDesc}
          onChangeText={(v) => dispatch({ type: 'SET_JOB_DESC', payload: v })}
          placeholder="Paste the job description here..."
          placeholderTextColor="#444"
          multiline
          textAlignVertical="top"
        />

        {/* Persona */}
        <Text style={styles.label}>Coaching Persona</Text>
        <PersonaPicker
          selected={state.persona}
          onSelect={(p) => dispatch({ type: 'SET_PERSONA', payload: p })}
        />

        {/* File uploads */}
        <Text style={[styles.label, { marginTop: 16 }]}>Uploaded Documents</Text>
        {state.builderFiles.map((f) => (
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
          <Text style={styles.uploadText}>Upload Resume / Job Description</Text>
        </TouchableOpacity>

        {/* Generate */}
        <TouchableOpacity style={styles.generateBtn} onPress={generate} disabled={streaming}>
          {streaming ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.generateText}>✦ Generate Script</Text>
          )}
        </TouchableOpacity>

        {/* Output */}
        {(output || streaming) && (
          <View style={styles.outputCard}>
            <Text style={styles.outputText}>{output}{streaming ? '▋' : ''}</Text>
            {!streaming && output && (
              <View style={styles.exportRow}>
                <TouchableOpacity style={styles.exportBtn} onPress={exportTxt}>
                  <Ionicons name="download-outline" size={16} color="#7c6af7" />
                  <Text style={styles.exportText}>TXT</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.exportBtn} onPress={exportPdf}>
                  <Ionicons name="document-text-outline" size={16} color="#7c6af7" />
                  <Text style={styles.exportText}>PDF</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080814' },
  container: { padding: 20, paddingBottom: 48 },
  screenTitle: { fontSize: 22, color: '#fff', fontWeight: '700', marginBottom: 20 },
  label: { fontSize: 12, color: '#888', fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#111', borderWidth: 1, borderColor: '#222', borderRadius: 10, padding: 12, color: '#fff', fontSize: 14, marginBottom: 16 },
  textarea: { height: 100, textAlignVertical: 'top' },
  typePicker: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderWidth: 1, borderColor: '#333', borderRadius: 10, padding: 12, marginBottom: 16, justifyContent: 'space-between' },
  typePickerText: { color: '#fff', fontSize: 14, flex: 1 },
  typeList: { backgroundColor: '#12122a', borderRadius: 10, borderWidth: 1, borderColor: '#222', marginBottom: 16, overflow: 'hidden' },
  typeOption: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#1a1a2e' },
  typeOptionActive: { backgroundColor: '#1a1840', color: '#c4b8ff' },
  typeOptionText: { color: '#ccc', fontSize: 14 },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#111' },
  fileName: { flex: 1, color: '#aaa', fontSize: 13 },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderWidth: 1, borderColor: '#7c6af7', borderRadius: 10, marginTop: 8, marginBottom: 20, borderStyle: 'dashed' },
  uploadText: { color: '#7c6af7', fontSize: 14 },
  generateBtn: { backgroundColor: '#7c6af7', borderRadius: 12, padding: 15, alignItems: 'center', marginBottom: 20 },
  generateText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  outputCard: { backgroundColor: '#12122a', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#2a2a4a' },
  outputText: { color: '#e0e0ff', fontSize: 15, lineHeight: 24 },
  exportRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  exportBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#7c6af7', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  exportText: { color: '#7c6af7', fontSize: 13, fontWeight: '600' },
});
