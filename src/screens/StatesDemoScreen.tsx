import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';
import { useToast } from '../context/ToastContext';
import { AppHeader, EmptyState, InfoBanner, SecondaryButton } from '../components/ui';
import { Colors } from '../theme/colors';
import { Radius, Shadow } from '../theme/tokens';

type Nav = StackNavigationProp<RootStackParamList>;

export function StatesDemoScreen() {
  const navigation = useNavigation<Nav>();
  const { show } = useToast();

  return (
    <View style={styles.root}>
      <AppHeader title="UI States (Demo)" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Reference screens for the error, loading and empty states used across Tapslip.
        </Text>

        <Text style={styles.section}>Error · order refresh failed</Text>
        <InfoBanner
          icon="cloud-offline-outline"
          tone="warning"
          text="We're having trouble updating your order. Pull to refresh."
          actionLabel="Retry"
          onAction={() => show('Retrying…', 'info')}
        />

        <Text style={styles.section}>Error · order not found</Text>
        <View style={styles.sample}>
          <Ionicons name="receipt-outline" size={34} color={Colors.textMuted} />
          <Text style={styles.sampleTitle}>Order not found</Text>
          <Text style={styles.sampleSub}>
            We couldn't find this order. It may have been removed.
          </Text>
          <SecondaryButton
            label="View Order History"
            onPress={() => navigation.navigate('OrderHistory')}
            style={{ alignSelf: 'stretch' }}
          />
        </View>

        <Text style={styles.section}>Loading · menu</Text>
        <View style={styles.sample}>
          {[0, 1, 2].map((index) => (
            <View key={index} style={styles.skeleton} />
          ))}
          <Text style={styles.sampleSub}>Fetching today's dishes…</Text>
        </View>

        <Text style={styles.section}>Empty · cart</Text>
        <View style={styles.sample}>
          <EmptyState
            icon="bag-handle-outline"
            title="Your order is empty"
            subtitle="Browse the menu and add something delicious to get started."
            actionLabel="Browse Menu"
            onAction={() => navigation.navigate('Main', { screen: 'Menu' })}
          />
        </View>

        <Text style={styles.section}>Empty · no active orders</Text>
        <View style={styles.sample}>
          <EmptyState
            icon="time-outline"
            title="No active orders"
            subtitle="When you place an order, you can follow its progress here in real time."
            actionLabel="Browse Menu"
            onAction={() => navigation.navigate('Main', { screen: 'Menu' })}
          />
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
    paddingBottom: 44,
  },
  intro: {
    fontSize: 13.5,
    lineHeight: 20,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  section: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: 22,
    marginBottom: 10,
  },
  sample: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    gap: 8,
    ...Shadow.soft,
  },
  sampleTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: Colors.text,
  },
  sampleSub: {
    fontSize: 13.5,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  skeleton: {
    alignSelf: 'stretch',
    height: 58,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
    marginBottom: 6,
  },
});
