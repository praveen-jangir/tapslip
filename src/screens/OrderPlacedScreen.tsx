import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';
import { RESTAURANT_NAME } from '../data/menu';
import { useOrder } from '../context/OrderContext';
import { AppHeader, EmptyState, InfoBanner, PrimaryButton, SecondaryButton } from '../components/ui';
import { Colors } from '../theme/colors';
import { Radius, Shadow } from '../theme/tokens';
import { formatOrderDate } from '../utils/format';

type Nav = StackNavigationProp<RootStackParamList>;

export function OrderPlacedScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'OrderPlaced'>>();
  const { getOrder } = useOrder();
  const order = getOrder(route.params.orderNumber);

  if (!order) {
    return (
      <View style={styles.root}>
        <AppHeader title="Order" onBack={() => navigation.navigate('Main', { screen: 'Menu' })} />
        <EmptyState
          icon="receipt-outline"
          title="Failed to load order"
          subtitle="We couldn't find this order. Please check your order history."
          actionLabel="Back to Menu"
          onAction={() => navigation.navigate('Main', { screen: 'Menu' })}
        />
      </View>
    );
  }

  const isAdditional = order.additional;
  const goMenu = () => navigation.navigate('Main', { screen: 'Menu' });
  const goTrack = () => navigation.navigate('Main', { screen: 'Track' });

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.checkCircle}>
            <View style={styles.checkInner}>
              <Ionicons name="checkmark" size={48} color={Colors.white} />
            </View>
          </View>

          <Text style={styles.title}>
            {isAdditional ? 'Additional Order Placed' : 'Order Placed!'}
          </Text>
          <Text style={styles.subtitle}>
            {order.type === 'dine-in'
              ? `Your food will be served at Table ${order.table}.`
              : 'We will start preparing your order right away.'}
          </Text>

          <View style={styles.numberCard}>
            <Text style={styles.numberLabel}>ORDER NUMBER</Text>
            <Text style={styles.number}>{order.id}</Text>
            <Text style={styles.numberMeta}>
              {formatOrderDate(order.placedAt)} · {order.items.length}{' '}
              {order.items.length === 1 ? 'item' : 'items'}
            </Text>
          </View>

          {order.type === 'dine-in' ? (
            <View style={styles.etaCard}>
              <View style={styles.etaIcon}>
                <Ionicons name="time-outline" size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.etaTitle}>Estimated ready time: ~18 minutes</Text>
                <Text style={styles.etaSub}>Follow every step in live tracking.</Text>
              </View>
            </View>
          ) : (
            <View style={styles.pickupCard}>
              <Text style={styles.pickupLabel}>PICKUP CODE</Text>
              <Text style={styles.pickupCode}>{order.pickupCode}</Text>
              <View style={styles.addressRow}>
                <Ionicons name="location-outline" size={15} color={Colors.primary} />
                <Text style={styles.addressText}>
                  {RESTAURANT_NAME}, 12 MG Road, Bengaluru
                </Text>
              </View>
            </View>
          )}

          <InfoBanner
            text="Need something else? Add more items from the Menu — they'll join this order."
            actionLabel="Menu"
            onAction={goMenu}
          />
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton label="View Live Status" icon="navigate-outline" onPress={goTrack} />
          <SecondaryButton
            label="Back to Menu"
            onPress={goMenu}
            style={{ marginTop: 12 }}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  body: {
    padding: 24,
    paddingTop: 34,
    alignItems: 'center',
  },
  checkCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInner: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.success,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  title: {
    marginTop: 26,
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 21,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  numberCard: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: 20,
    alignItems: 'center',
    marginTop: 26,
    ...Shadow.card,
  },
  numberLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1.4,
  },
  number: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.white,
    marginTop: 6,
    letterSpacing: 1.5,
  },
  numberMeta: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 7,
  },
  etaCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginTop: 16,
    ...Shadow.soft,
  },
  etaIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  etaTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  etaSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  pickupCard: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    padding: 22,
    marginTop: 16,
    ...Shadow.card,
  },
  pickupLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 1.6,
  },
  pickupCode: {
    fontSize: 46,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 7,
    marginTop: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addressText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 30,
    backgroundColor: Colors.white,
  },
});
