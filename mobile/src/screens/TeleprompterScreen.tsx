import React, { useRef, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
  TextInput, Alert, Modal, Animated, Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Script } from '../context/AppContext';
import { FONT_PRESETS, SIZE_PRESETS } from '../constants/fonts';

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export default function TeleprompterScreen() {
  const { state, dispatch, saveScripts } = useApp();
  const [scrolling, setScrolling] = useState(false);
  const [mirror, setMirror] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [editText, setEditText] = useState('');
  const [editName, setEditName] = useState('');
  const [newScriptName, setNewScriptName] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollYRef = useRef(0);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeScript = state.scripts.find((s) => s.id === state.activeScriptId);
  const font = state.fontPreset;
  const size = state.sizePreset;

  function startScroll() {
    setScrolling(true);
    const pxPerMs = (state.speed * 30) / 1000;
    animRef.current = setInterval(() => {
      scrollYRef.current += pxPerMs * 16;
      scrollViewRef.current?.scrollTo({ y: scrollYRef.current, animated: false });
    }, 16);
  }

  function stopScroll() {
    setScrolling(false);
    if (animRef.current) {
      clearInterval(animRef.current);
      animRef.current = null;
    }
  }

  function toggleScroll() {
    scrolling ? stopScroll() : startScroll();
  }

  function resetScroll() {
    stopScroll();
    scrollYRef.current = 0;
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }

  function openEditor() {
    setEditText(activeScript?.text ?? '');
    setEditName(activeScript?.name ?? 'My Script');
    setShowEditor(true);
  }

  async function saveEditor() {
    if (!activeScript) {
      // Create new script
      const id = uid();
      const newScript: Script = {
        id,
        name: editName || 'My Script',
        text: editText,
        fontId: font.id,
        sizeId: size.id,
        speed: state.speed,
        savedAt: new Date().toISOString(),
      };
      const updated = [...state.scripts, newScript];
      await saveScripts(updated);
      dispatch({ type: 'SET_ACTIVE_SCRIPT', payload: id });
    } else {
      const updated = state.scripts.map((s) =>
        s.id === activeScript.id ? { ...s, name: editName, text: editText, savedAt: new Date().toISOString() } : s
      );
      await saveScripts(updated);
    }
    setShowEditor(false);
  }

  async function createNewScript() {
    const name = newScriptName.trim() || 'New Script';
    const id = uid();
    const newScript: Script = {
      id,
      name,
      text: '',
      fontId: font.id,
      sizeId: size.id,
      speed: state.speed,
      savedAt: new Date().toISOString(),
    };
    const updated = [...state.scripts, newScript];
    await saveScripts(updated);
    dispatch({ type: 'SET_ACTIVE_SCRIPT', payload: id });
    setNewScriptName('');
    setShowLibrary(false);
    setEditText('');
    setEditName(name);
    setShowEditor(true);
  }

  async function deleteScript(id: string) {
    Alert.alert('Delete Script', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          const updated = state.scripts.filter((s) => s.id !== id);
          await saveScripts(updated);
          if (state.activeScriptId === id) {
            dispatch({ type: 'SET_ACTIVE_SCRIPT', payload: updated[0]?.id ?? '' });
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowLibrary(true)} style={styles.headerBtn}>
          <Ionicons name="folder-open-outline" size={20} color="#aaa" />
          <Text style={styles.headerBtnText} numberOfLines={1}>
            {activeScript?.name ?? 'No Script'}
          </Text>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => setMirror((m) => !m)} style={styles.iconBtn}>
            <Ionicons name="swap-horizontal-outline" size={18} color={mirror ? '#7c6af7' : '#555'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={openEditor} style={styles.iconBtn}>
            <Ionicons name="create-outline" size={18} color="#aaa" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Font/Size presets */}
      <View style={styles.presetsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
          {FONT_PRESETS.map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[styles.pill, state.fontPreset.id === f.id && styles.pillActive]}
              onPress={() => dispatch({ type: 'SET_FONT', payload: f })}
            >
              <Text style={[styles.pillText, state.fontPreset.id === f.id && styles.pillTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.pillDivider} />
          {SIZE_PRESETS.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[styles.pill, state.sizePreset.id === s.id && styles.pillActive]}
              onPress={() => dispatch({ type: 'SET_SIZE', payload: s })}
            >
              <Text style={[styles.pillText, state.sizePreset.id === s.id && styles.pillTextActive]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Teleprompter content */}
      <ScrollView
        ref={scrollViewRef}
        style={[styles.scroll, mirror && styles.mirror]}
        contentContainerStyle={styles.scrollContent}
        onScroll={(e) => { scrollYRef.current = e.nativeEvent.contentOffset.y; }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {activeScript?.text ? (
          <Text style={[styles.tpText, { fontSize: size.size }]}>
            {activeScript.text}
          </Text>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📄</Text>
            <Text style={styles.emptyTitle}>No script loaded</Text>
            <Text style={styles.emptySub}>Tap the folder icon to open a script, or the edit icon to write one.</Text>
          </View>
        )}
      </ScrollView>

      {/* Speed + controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={() => dispatch({ type: 'SET_SPEED', payload: Math.max(0.3, state.speed - 0.2) })}
          style={styles.ctrlBtn}
        >
          <Text style={styles.ctrlText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.speedLabel}>{state.speed.toFixed(1)}×</Text>
        <TouchableOpacity
          onPress={() => dispatch({ type: 'SET_SPEED', payload: Math.min(6, state.speed + 0.2) })}
          style={styles.ctrlBtn}
        >
          <Text style={styles.ctrlText}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={resetScroll} style={styles.resetBtn}>
          <Ionicons name="refresh-outline" size={20} color="#aaa" />
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleScroll} style={[styles.playBtn, scrolling && styles.playBtnActive]}>
          <Ionicons name={scrolling ? 'pause' : 'play'} size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Script Library Modal */}
      <Modal visible={showLibrary} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Script Library</Text>
            <TouchableOpacity onPress={() => setShowLibrary(false)}>
              <Ionicons name="close" size={24} color="#aaa" />
            </TouchableOpacity>
          </View>

          <View style={styles.newScriptRow}>
            <TextInput
              style={styles.newScriptInput}
              placeholder="New script name..."
              placeholderTextColor="#444"
              value={newScriptName}
              onChangeText={setNewScriptName}
            />
            <TouchableOpacity style={styles.newScriptBtn} onPress={createNewScript}>
              <Text style={styles.newScriptBtnText}>+ New</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.libraryList}>
            {state.scripts.length === 0 && (
              <Text style={styles.emptyLib}>No scripts yet. Create one above.</Text>
            )}
            {state.scripts.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[styles.libItem, state.activeScriptId === s.id && styles.libItemActive]}
                onPress={() => {
                  dispatch({ type: 'SET_ACTIVE_SCRIPT', payload: s.id });
                  setShowLibrary(false);
                }}
              >
                <Text style={[styles.libItemName, state.activeScriptId === s.id && styles.libItemNameActive]} numberOfLines={1}>{s.name}</Text>
                <TouchableOpacity onPress={() => deleteScript(s.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="trash-outline" size={16} color="#555" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Editor Modal */}
      <Modal visible={showEditor} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <TextInput
              style={styles.editorNameInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Script name"
              placeholderTextColor="#444"
            />
            <View style={styles.editorHeaderBtns}>
              <TouchableOpacity onPress={() => setShowEditor(false)} style={{ marginRight: 12 }}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveEditor} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TextInput
            style={styles.editorInput}
            value={editText}
            onChangeText={setEditText}
            multiline
            placeholder="Write or paste your script here..."
            placeholderTextColor="#333"
            textAlignVertical="top"
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080814' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  headerBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerBtnText: { color: '#aaa', fontSize: 14, flex: 1 },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 6 },
  presetsRow: { borderBottomWidth: 1, borderBottomColor: '#111' },
  presetScroll: { paddingHorizontal: 16, paddingVertical: 8 },
  pill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: '#222', marginRight: 6, backgroundColor: '#111' },
  pillActive: { borderColor: '#7c6af7', backgroundColor: '#1a1840' },
  pillText: { fontSize: 12, color: '#666' },
  pillTextActive: { color: '#c4b8ff' },
  pillDivider: { width: 1, backgroundColor: '#222', marginHorizontal: 6, alignSelf: 'stretch' },
  scroll: { flex: 1 },
  mirror: { transform: [{ scaleX: -1 }] },
  scrollContent: { padding: 24, paddingBottom: 80 },
  tpText: { color: '#fff', lineHeight: 1.5 * 28, letterSpacing: 0.3 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, color: '#fff', fontWeight: '600', marginBottom: 8 },
  emptySub: { fontSize: 13, color: '#555', textAlign: 'center', lineHeight: 18 },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#111',
    backgroundColor: '#080814',
  },
  ctrlBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center' },
  ctrlText: { color: '#aaa', fontSize: 20, fontWeight: '300' },
  speedLabel: { fontSize: 14, color: '#fff', minWidth: 36, textAlign: 'center' },
  resetBtn: { marginLeft: 'auto', padding: 6 },
  playBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#7c6af7', justifyContent: 'center', alignItems: 'center' },
  playBtnActive: { backgroundColor: '#5a4ac7' },
  modalSafe: { flex: 1, backgroundColor: '#080814' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#111' },
  modalTitle: { fontSize: 17, color: '#fff', fontWeight: '700', flex: 1 },
  newScriptRow: { flexDirection: 'row', padding: 16, gap: 10 },
  newScriptInput: { flex: 1, backgroundColor: '#111', borderWidth: 1, borderColor: '#222', borderRadius: 10, padding: 10, color: '#fff', fontSize: 14 },
  newScriptBtn: { backgroundColor: '#7c6af7', borderRadius: 10, paddingHorizontal: 14, justifyContent: 'center' },
  newScriptBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  libraryList: { flex: 1, paddingHorizontal: 16 },
  emptyLib: { color: '#444', fontSize: 13, textAlign: 'center', marginTop: 32 },
  libItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#111' },
  libItemActive: { },
  libItemName: { flex: 1, fontSize: 15, color: '#ccc' },
  libItemNameActive: { color: '#c4b8ff', fontWeight: '600' },
  editorNameInput: { flex: 1, fontSize: 17, color: '#fff', fontWeight: '600' },
  editorHeaderBtns: { flexDirection: 'row', alignItems: 'center' },
  cancelText: { color: '#888', fontSize: 15 },
  saveBtn: { backgroundColor: '#7c6af7', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  editorInput: { flex: 1, padding: 20, color: '#fff', fontSize: 16, lineHeight: 26 },
});
