import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';
import { Colors } from '../theme/colors';
import { Radius, Shadow } from '../theme/tokens';
import { useOrder } from '../context/OrderContext';
import { Logo, PrimaryButton } from '../components/ui';

type Nav = StackNavigationProp<RootStackParamList>;
type Mode = 'dine-in' | 'take-away';

const OPTIONS: {
  mode: Mode;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  desc: string;
}[] = [
  {
    mode: 'dine-in',
    icon: 'restaurant-outline',
    title: 'Dine-In',
    desc: 'Order for delivery to your table',
  },
  {
    mode: 'take-away',
    icon: 'bag-handle-outline',
    title: 'Take-Away',
    desc: 'Pick up your order at the counter',
  },
];

export function OrderTypeScreen() {
  const navigation = useNavigation<Nav>();
  const { setOrderType } = useOrder();
  const [selected, setSelected] = useState<Mode>('dine-in');
  const canGoBack = navigation.canGoBack();

  const handleContinue = () => {
    setOrderType(selected);
    navigation.navigate('Scan');
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.topBar}>
        {canGoBack ? (
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          >
            <Ionicons name="chevron-back" size={22} color={Colors.text} />
          </Pressable>
        ) : (
          <View style={{ width: 38 }} />
        )}
        <Logo size={30} showText={false} />
        <View style={{ width: 38 }} />
      </View>

      <Text style={styles.title}>How would you like to{'\n'}order?</Text>
      <Text style={styles.subtitle}>
        Choose an option below. You can always add more items later.
      </Text>

      <View style={styles.options}>
        {OPTIONS.map((option) => {
          const active = selected === option.mode;
          return (
            <Pressable
              key={option.mode}
              onPress={() => setSelected(option.mode)}
              style={({ pressed }) => [
                styles.optionCard,
                active && styles.optionCardActive,
                pressed && { transform: [{ scale: 0.985 }] },
              ]}
            >
              <View style={[styles.optionIcon, active && { backgroundColor: Colors.primary }]}>
                <Ionicons
                  name={option.icon}
                  size={24}
                  color={active ? Colors.white : Colors.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDesc}>{option.desc}</Text>
              </View>
              <View style={[styles.radio, active && styles.radioActive]}>
                {active ? <View style={styles.radioDot} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.tableRow}>
        <Ionicons
          name={selected === 'dine-in' ? 'qr-code-outline' : 'bag-handle-outline'}
          size={16}
          color={Colors.primary}
        />
        <Text style={styles.tableText}>
          {selected === 'dine-in'
            ? "Next: scan your table's QR code"
            : 'Next: scan the counter QR code'}
        </Text>
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Continue" icon="arrow-forward" onPress={handleContinue} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 22,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 42,
    fontSize: 30,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
    lineHeight: 37,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 21,
    color: Colors.textSecondary,
  },
  options: {
    marginTop: 34,
    gap: 14,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: Radius.xl,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  optionCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
    ...Shadow.soft,
  },
  optionIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: {
    fontSize: 17.5,
    fontWeight: '800',
    color: Colors.text,
  },
  optionDesc: {
    fontSize: 13.5,
    color: Colors.textSecondary,
    marginTop: 3,
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
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 26,
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight,
    borderRadius: 999,
    paddingHorizontal: 14,
    height: 34,
  },
  tableText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.primary,
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 20,
  },
});
