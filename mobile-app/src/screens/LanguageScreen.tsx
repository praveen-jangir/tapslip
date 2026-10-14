import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';
import { useToast } from '../context/ToastContext';
import { AppHeader, PrimaryButton } from '../components/ui';
import { Colors } from '../theme/colors';
import { Radius, Shadow } from '../theme/tokens';

type Nav = StackNavigationProp<RootStackParamList>;

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
];

export function LanguageScreen() {
  const navigation = useNavigation<Nav>();
  const { show } = useToast();
  const [selected, setSelected] = useState('en');

  const handleSave = () => {
    const language = LANGUAGES.find((item) => item.code === selected);
    show(`Language set to ${language?.native ?? 'English'}`, 'success');
    navigation.goBack();
  };

  return (
    <View style={styles.root}>
      <AppHeader title="Language" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {LANGUAGES.map((language) => {
          const active = selected === language.code;
          return (
            <Pressable
              key={language.code}
              onPress={() => setSelected(language.code)}
              style={({ pressed }) => [
                styles.row,
                active && styles.rowActive,
                pressed && { opacity: 0.8 },
              ]}
            >
              <View>
                <Text style={styles.rowNative}>{language.native}</Text>
                <Text style={styles.rowLabel}>{language.label}</Text>
              </View>
              <View style={[styles.radio, active && styles.radioActive]}>
                {active ? <View style={styles.radioDot} /> : null}
              </View>
            </Pressable>
          );
        })}
        <PrimaryButton label="Save Preference" onPress={handleSave} style={{ marginTop: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 12,
  },
  rowActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
    ...Shadow.soft,
  },
  rowNative: {
    fontSize: 16.5,
    fontWeight: '800',
    color: Colors.text,
  },
  rowLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: Colors.primary,
  },
  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
});
