import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';
import { AppHeader } from '../components/ui';
import { Colors } from '../theme/colors';

type Nav = StackNavigationProp<RootStackParamList>;

const SECTIONS: { title: string; body: string }[] = [
  {
    title: '1. About These Terms',
    body: 'By scanning a table QR code and placing an order through Tapslip, you agree to these terms. Tapslip facilitates ordering between you and the restaurant; the restaurant remains responsible for preparing and serving all food.',
  },
  {
    title: '2. Orders & Payments',
    body: 'Prices are displayed inclusive of restaurant pricing and exclude applicable taxes, which are shown in the bill summary before you confirm. An order is confirmed once the restaurant accepts it — you will see the status update in live tracking.',
  },
  {
    title: '3. Cancellations & Refunds',
    body: 'Because food is prepared fresh, cancellations are accepted before the kitchen starts preparing your order. Refunds, where applicable, are processed to the original payment method within 5–7 business days.',
  },
  {
    title: '4. Privacy',
    body: 'Tapslip only processes the information needed to serve your order — table number, order contents and optional feedback. We do not sell your personal data. Session data is kept for your visit and order history.',
  },
  {
    title: '5. Contact',
    body: 'Questions about these terms? Reach us at legal@tapslip.app or call +91 98765 43210.',
  },
];

export function TermsScreen() {
  const navigation = useNavigation<Nav>();
  return (
    <View style={styles.root}>
      <AppHeader title="Terms & Privacy" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.updated}>Last updated: October 2026</Text>
        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.title}>{section.title}</Text>
            <Text style={styles.body}>{section.body}</Text>
          </View>
        ))}
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
    paddingBottom: 44,
  },
  updated: {
    fontSize: 12.5,
    color: Colors.textMuted,
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 7,
  },
  body: {
    fontSize: 14.5,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
});
