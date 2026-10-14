import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';
import { isFinalStatus, statusLabel, useOrder } from '../context/OrderContext';
import { AppHeader, EmptyState, InfoBanner, StatusBadge } from '../components/ui';
import { Timeline, type StepState, type TimelineStep } from '../components/Timeline';
import { ORDER_STEPS } from '../context/OrderContext';
import { Colors } from '../theme/colors';
import { Radius, Shadow } from '../theme/tokens';
import { formatOrderDate, formatTime, rupees } from '../utils/format';

type Nav = StackNavigationProp<RootStackParamList>;

export function OrderDetailsScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'OrderDetails'>>();
  const { getOrder, ratedIds } = useOrder();
  const order = getOrder(route.params.orderNumber);

  if (!order) {
    return (
      <View style={styles.root}>
        <AppHeader title="Order Details" onBack={() => navigation.goBack()} />
        <EmptyState
          icon="search-outline"
          title="Order not found"
          subtitle="We couldn't find this order. It may have been removed."
          actionLabel="View Order History"
          onAction={() => navigation.replace('OrderHistory')}
        />
      </View>
    );
  }

  const steps = ORDER_STEPS[order.type];
  const currentIndex = steps.indexOf(order.status);
  const timelineSteps: TimelineStep[] = steps.map((step, index) => {
    const state: StepState =
      index < currentIndex ? 'done' : index === currentIndex ? 'active' : 'pending';
    const ts = order.statusTimes[step];
    return {
      key: step,
      title: statusLabel(step, order.type),
      state,
      meta: state !== 'pending' && ts ? formatTime(ts) : undefined,
    };
  });

  const rated = ratedIds.includes(order.id);

  return (
    <View style={styles.root}>
      <AppHeader title="Order Details" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <Text style={styles.orderId}>#{order.id}</Text>
            <StatusBadge
              label={statusLabel(order.status, order.type)}
              tone={
                isFinalStatus(order) ? 'success' : order.status === 'ready' ? 'warning' : 'active'
              }
            />
          </View>
          <Text style={styles.meta}>
            {order.type === 'dine-in'
              ? `Dine-In · Table ${order.table}`
              : `Take-Away${order.pickupCode ? ` · Code ${order.pickupCode}` : ''}`}
          </Text>
          <Text style={styles.meta}>{formatOrderDate(order.placedAt)}</Text>
          {rated ? (
            <View style={{ marginTop: 10 }}>
              <StatusBadge label="RATED" tone="success" dot={false} />
            </View>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>Items</Text>
        <View style={styles.card}>
          {order.items.map((item) => (
            <View key={item.key} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>
                  {item.qty} × {item.name}
                </Text>
                {item.spice || item.instructions ? (
                  <Text style={styles.itemMeta}>
                    {[item.spice, item.instructions].filter(Boolean).join(' · ')}
                  </Text>
                ) : null}
              </View>
              <Text style={styles.itemPrice}>{rupees(item.price * item.qty)}</Text>
            </View>
          ))}
          <View style={styles.hr} />
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Items total</Text>
            <Text style={styles.billValue}>{rupees(order.subtotal)}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>GST (5%)</Text>
            <Text style={styles.billValue}>{rupees(order.tax)}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{rupees(order.total)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Status Timeline</Text>
        <View style={styles.card}>
          <Timeline steps={timelineSteps} />
        </View>

        {!isFinalStatus(order) ? (
          <View style={{ marginTop: 4 }}>
            <InfoBanner
              icon="time-outline"
              text="This order is still in progress. Open the Track tab for live updates."
              actionLabel="Track"
              onAction={() => navigation.navigate('Main', { screen: 'Track' })}
            />
          </View>
        ) : null}
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
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    marginBottom: 16,
    ...Shadow.soft,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderId: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  meta: {
    fontSize: 13.5,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  itemName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.text,
  },
  itemMeta: {
    fontSize: 12.5,
    color: Colors.textMuted,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.text,
  },
  hr: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 8,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  billLabel: {
    fontSize: 13.5,
    color: Colors.textSecondary,
  },
  billValue: {
    fontSize: 13.5,
    fontWeight: '600',
    color: Colors.text,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
});
