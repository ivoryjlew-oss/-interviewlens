import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { useApp } from '../context/AppContext';
import { Session } from '../context/AppContext';
import MoodTimeline from '../components/MoodTimeline';
import { MOOD_CFG, MoodType } from '../constants/moods';

export default function SessionsScreen() {
  const { state, saveSessions } = useApp();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const companies = Object.keys(state.sessions);

  async function deleteSession(company: string, sessionId: string) {
    Alert.alert('Delete Session', 'Delete this session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          const updated = { ...state.sessions };
          updated[company] = updated[company].filter((s) => s.id !== sessionId);
          if (updated[company].length === 0) delete updated[company];
          await saveSessions(updated);
        },
      },
    ]);
  }

  async function deleteCompany(company: string) {
    Alert.alert('Delete All Sessions', `Delete all sessions for "${company}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete All', style: 'destructive', onPress: async () => {
          const updated = { ...state.sessions };
          delete updated[company];
          await saveSessions(updated);
          if (expanded === company) setExpanded(null);
        },
      },
    ]);
  }

  async function exportSessionTxt(session: Session) {
    const lines = session.qa.map((item) => `Q: ${item.q}\n\nA: ${item.a}`).join('\n\n---\n\n');
    const header = `Phorya Session\nCompany: ${session.company} | Role: ${session.role}\nDate: ${new Date(session.date).toLocaleString()}\n\n`;
    try {
      const path = FileSystem.cacheDirectory + `phorya-session-${session.id}.txt`;
      await FileSystem.writeAsStringAsync(path, header + lines);
      await Sharing.shareAsync(path, { mimeType: 'text/plain' });
    } catch {
      Alert.alert('Export Failed');
    }
  }

  async function exportSessionPdf(session: Session) {
    const qaHtml = session.qa.map((item) => `
      <div style="margin-bottom:24px">
        <p style="color:#5a4ac7;font-weight:bold">Q: ${item.q}</p>
        <p>${item.a.replace(/\n/g, '<br/>')}</p>
      </div>
    `).join('<hr/>');
    const html = `<html><body style="font-family:sans-serif;padding:24px;font-size:14px;line-height:1.6">
      <h2>Phorya Session</h2>
      <p><b>Company:</b> ${session.company} | <b>Role:</b> ${session.role}</p>
      <p><b>Date:</b> ${new Date(session.date).toLocaleString()}</p>
      ${qaHtml}
    </body></html>`;
    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
    } catch {
      Alert.alert('Export Failed');
    }
  }

  if (companies.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📁</Text>
          <Text style={styles.emptyTitle}>No Sessions Yet</Text>
          <Text style={styles.emptySub}>
            Complete a Live Q&A session and it will be automatically saved here, organized by company.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.screenTitle}>📁 Sessions</Text>
      <ScrollView contentContainerStyle={styles.container}>
        {companies.map((company) => {
          const sessions = state.sessions[company];
          const isOpen = expanded === company;

          return (
            <View key={company} style={styles.companyCard}>
              <TouchableOpacity
                style={styles.companyHeader}
                onPress={() => setExpanded(isOpen ? null : company)}
              >
                <View style={styles.companyInfo}>
                  <Text style={styles.companyName}>{company}</Text>
                  <Text style={styles.sessionCount}>{sessions.length} session{sessions.length !== 1 ? 's' : ''}</Text>
                </View>
                <TouchableOpacity onPress={() => deleteCompany(company)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="trash-outline" size={18} color="#444" />
                </TouchableOpacity>
                <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#555" style={{ marginLeft: 8 }} />
              </TouchableOpacity>

              {isOpen && (
                <View style={styles.sessionList}>
                  {sessions.map((session) => {
                    const isSessionOpen = expandedSession === session.id;
                    const mood = session.overallMood as MoodType;
                    const moodCfg = MOOD_CFG[mood] ?? MOOD_CFG.neutral;

                    return (
                      <View key={session.id} style={styles.sessionCard}>
                        <TouchableOpacity
                          style={styles.sessionHeader}
                          onPress={() => setExpandedSession(isSessionOpen ? null : session.id)}
                        >
                          <View style={styles.sessionInfo}>
                            <Text style={styles.sessionRole}>{session.role}</Text>
                            <Text style={styles.sessionDate}>{new Date(session.date).toLocaleDateString()}</Text>
                          </View>
                          <View style={[styles.moodBadge, { backgroundColor: moodCfg.color + '22', borderColor: moodCfg.color }]}>
                            <Text style={styles.moodIcon}>{moodCfg.icon}</Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => deleteSession(company, session.id)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            style={{ marginLeft: 8 }}
                          >
                            <Ionicons name="close-circle-outline" size={18} color="#444" />
                          </TouchableOpacity>
                        </TouchableOpacity>

                        {isSessionOpen && (
                          <View style={styles.sessionDetail}>
                            <MoodTimeline moodHistory={session.moodHistory} />

                            <View style={styles.exportRow}>
                              <TouchableOpacity style={styles.exportBtn} onPress={() => exportSessionTxt(session)}>
                                <Ionicons name="download-outline" size={14} color="#7c6af7" />
                                <Text style={styles.exportText}>TXT</Text>
                              </TouchableOpacity>
                              <TouchableOpacity style={styles.exportBtn} onPress={() => exportSessionPdf(session)}>
                                <Ionicons name="document-text-outline" size={14} color="#7c6af7" />
                                <Text style={styles.exportText}>PDF</Text>
                              </TouchableOpacity>
                            </View>

                            <Text style={styles.qaCount}>{session.qa.length} Q&A pairs</Text>
                            {session.qa.slice(0, 3).map((item, i) => (
                              <View key={i} style={styles.qaPreview}>
                                <Text style={styles.qPreview} numberOfLines={1}>Q: {item.q}</Text>
                                <Text style={styles.aPreview} numberOfLines={2}>{item.a}</Text>
                              </View>
                            ))}
                            {session.qa.length > 3 && (
                              <Text style={styles.moreText}>+{session.qa.length - 3} more questions</Text>
                            )}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080814' },
  screenTitle: { fontSize: 22, color: '#fff', fontWeight: '700', padding: 20, paddingBottom: 8 },
  container: { padding: 16, paddingTop: 0, paddingBottom: 48 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { fontSize: 52, marginBottom: 20 },
  emptyTitle: { fontSize: 20, color: '#fff', fontWeight: '700', marginBottom: 10 },
  emptySub: { fontSize: 14, color: '#555', textAlign: 'center', lineHeight: 20, maxWidth: 280 },
  companyCard: { backgroundColor: '#111', borderRadius: 14, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#1a1a2e' },
  companyHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 8 },
  companyInfo: { flex: 1 },
  companyName: { fontSize: 16, color: '#fff', fontWeight: '700' },
  sessionCount: { fontSize: 12, color: '#555', marginTop: 2 },
  sessionList: { borderTopWidth: 1, borderTopColor: '#1a1a2e' },
  sessionCard: { borderBottomWidth: 1, borderBottomColor: '#1a1a2e' },
  sessionHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 8 },
  sessionInfo: { flex: 1 },
  sessionRole: { fontSize: 14, color: '#ddd', fontWeight: '600' },
  sessionDate: { fontSize: 12, color: '#555', marginTop: 2 },
  moodBadge: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  moodIcon: { fontSize: 16 },
  sessionDetail: { padding: 14, paddingTop: 0, backgroundColor: '#0d0d1a' },
  exportRow: { flexDirection: 'row', gap: 8, marginVertical: 10 },
  exportBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#7c6af7', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5 },
  exportText: { color: '#7c6af7', fontSize: 12, fontWeight: '600' },
  qaCount: { fontSize: 12, color: '#555', marginBottom: 8 },
  qaPreview: { marginBottom: 10 },
  qPreview: { fontSize: 13, color: '#7c6af7', fontStyle: 'italic', marginBottom: 2 },
  aPreview: { fontSize: 13, color: '#888', lineHeight: 18 },
  moreText: { fontSize: 12, color: '#555', fontStyle: 'italic' },
});
