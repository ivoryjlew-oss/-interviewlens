import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { getItem, setItem, SK } from '../storage/storage';
import { useApp } from '../context/AppContext';

interface Props {
  mode: 'unlock' | 'set';
  onSuccess?: () => void;
}

export default function PinScreen({ mode, onSuccess }: Props) {
  const { dispatch } = useApp();
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [stage, setStage] = useState<'enter' | 'confirm'>('enter');

  function handlePress(digit: string) {
    if (mode === 'unlock') {
      const next = pin + digit;
      setPin(next);
      if (next.length === 4) verifyPin(next);
    } else {
      if (stage === 'enter') {
        const next = pin + digit;
        setPin(next);
        if (next.length === 4) setStage('confirm');
      } else {
        const next = confirm + digit;
        setConfirm(next);
        if (next.length === 4) savePin(pin, next);
      }
    }
  }

  function handleDelete() {
    if (mode === 'unlock') {
      setPin((p) => p.slice(0, -1));
    } else if (stage === 'enter') {
      setPin((p) => p.slice(0, -1));
    } else {
      setConfirm((c) => c.slice(0, -1));
    }
  }

  async function verifyPin(entered: string) {
    const stored = await getItem<string>(SK.pin);
    if (entered === stored) {
      dispatch({ type: 'SET_PIN_UNLOCKED', payload: true });
      onSuccess?.();
    } else {
      Alert.alert('Incorrect PIN', 'Please try again.');
      setPin('');
    }
  }

  async function savePin(p: string, c: string) {
    if (p !== c) {
      Alert.alert('PINs Do Not Match', 'Please try again.');
      setPin('');
      setConfirm('');
      setStage('enter');
      return;
    }
    await setItem(SK.pin, p);
    dispatch({ type: 'SET_PIN_ENABLED', payload: true });
    onSuccess?.();
  }

  const currentPin = mode === 'unlock' ? pin : stage === 'enter' ? pin : confirm;

  const title =
    mode === 'unlock' ? 'Enter PIN' :
    stage === 'enter' ? 'Set a PIN' : 'Confirm PIN';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.logo}>✦ Phorya</Text>
        <Text style={styles.title}>{title}</Text>

        <View style={styles.dots}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.dot, i < currentPin.length && styles.dotFilled]} />
          ))}
        </View>

        <View style={styles.grid}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((d, i) => (
            d === '' ? (
              <View key={i} style={styles.empty} />
            ) : (
              <TouchableOpacity
                key={i}
                style={styles.key}
                onPress={() => d === '⌫' ? handleDelete() : handlePress(d)}
              >
                <Text style={d === '⌫' ? styles.delete : styles.keyText}>{d}</Text>
              </TouchableOpacity>
            )
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080814' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  logo: { fontSize: 24, color: '#7c6af7', fontWeight: '700', marginBottom: 32 },
  title: { fontSize: 18, color: '#fff', fontWeight: '600', marginBottom: 32 },
  dots: { flexDirection: 'row', gap: 16, marginBottom: 48 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#7c6af7' },
  dotFilled: { backgroundColor: '#7c6af7' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: 240, gap: 12, justifyContent: 'center' },
  key: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#1a1840',
    justifyContent: 'center', alignItems: 'center',
  },
  keyText: { fontSize: 22, color: '#fff', fontWeight: '600' },
  delete: { fontSize: 20, color: '#888' },
  empty: { width: 64, height: 64 },
});
