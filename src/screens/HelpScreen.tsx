import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';
import { RESTAURANT_NAME } from '../data/menu';
import { useToast } from '../context/ToastContext';
import { AppHeader, SectionHeader } from '../components/ui';
import { Colors } from '../theme/colors';
import { Radius, Shadow } from '../theme/tokens';

type Nav = StackNavigationProp<RootStackParamList>;

const FAQS: { q: string; a: string }[] = [
  {
    q: 'How does table ordering work?',
    a: 'Scan the QR code on your table, pick Dine-In or Take-Away, browse the menu and place your order. Your food is prepared fresh and served right to your table.',
  },
  {
    q: 'Can I add more items after ordering?',
    a: 'Yes! Use "Order More" from the Track tab once your current order finishes — new items become an additional order with its own tracking.',
  },
  {
    q: 'Where is my pickup code?',
    a: 'For Take-Away orders, your pickup code appears on the confirmation screen and in the Track tab once the order is ready.',
  },
];

export function HelpScreen() {
  const navigation = useNavigation<Nav>();
  const { show } = useToast();

  const contactRows: { icon: keyof typeof Ionicons.glyphMap; label: string; hint: string }[] = [
    { icon: 'call-outline', label: 'Call us', hint: '+91 98765 43210' },
    { icon: 'logo-whatsapp', label: 'WhatsApp', hint: 'Chat with support' },
    { icon: 'mail-outline', label: 'Email', hint: 'help@tapslip.app' },
  ];

  return (
    <View style={styles.root}>
      <AppHeader title="Help & Support" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionHeader title="Frequently Asked Questions" />
        {FAQS.map((faq) => (
          <View key={faq.q} style={styles.faq}>
            <View style={styles.faqHead}>
              <Ionicons name="help-circle" size={18} color={Colors.primary} />
              <Text style={styles.faqQ}>{faq.q}</Text>
            </View>
            <Text style={styles.faqA}>{faq.a}</Text>
          </View>
        ))}

        <View style={{ marginTop: 12 }}>
          <SectionHeader title="Contact Us" />
          {contactRows.map((row) => (
            <Pressable
              key={row.label}
              onPress={() => show(`${row.label}: ${row.hint}`, 'info')}
              style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
            >
              <View style={styles.rowIcon}>
                <Ionicons name={row.icon} size={18} color={Colors.primary} />
              </View>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Text style={styles.rowHint}>{row.hint}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.hours}>
          <Ionicons name="time-outline" size={16} color={Colors.primary} />
          <Text style={styles.hoursText}>
            {RESTAURANT_NAME} is open daily, 11:00 AM – 11:00 PM
          </Text>
        </View>
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
  faq: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 12,
    ...Shadow.soft,
  },
  faqHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  faqQ: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '800',
    color: Colors.text,
  },
  faqA: {
    fontSize: 13.5,
    lineHeight: 20,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    marginBottom: 10,
    ...Shadow.soft,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  rowHint: {
    fontSize: 12.5,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  hours: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primaryMuted,
    borderRadius: Radius.lg,
    padding: 14,
    marginTop: 14,
  },
  hoursText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.text,
  },
});
