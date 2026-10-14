import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';
import { RESTAURANT_NAME } from '../data/menu';
import {
  isFinalStatus,
  ORDER_STEPS,
  statusLabel,
  useOrder,
  type Order,
} from '../context/OrderContext';
import { useToast } from '../context/ToastContext';
import {
  EmptyState,
  InfoBanner,
  PrimaryButton,
  SectionHeader,
  SegmentedControl,
  SecondaryButton,
  StatusBadge,
} from '../components/ui';
import { LiveBadge, Timeline, type StepState, type TimelineStep } from '../components/Timeline';
import { Colors } from '../theme/colors';
import { Radius, Shadow } from '../theme/tokens';
import { formatOrderDate, formatTime, rupees } from '../utils/format';

type Nav = StackNavigationProp<RootStackParamList>;

function buildSteps(order: Order): TimelineStep[] {
  const steps = ORDER_STEPS[order.type];
  const currentIndex = steps.indexOf(order.status);
  return steps.map((step, index) => {
    const state: StepState = index < currentIndex ? 'done' : index === currentIndex ? 'active' : 'pending';
    const ts = order.statusTimes[step];
    return {
      key: step,
      title: statusLabel(step, order.type),
      state,
      meta: state !== 'pending' && ts ? formatTime(ts) : undefined,
    };
  });
}

function statusTone(order: Order): 'active' | 'success' | 'warning' | 'neutral' {
  if (isFinalStatus(order)) return 'success';
  if (order.status === 'ready') return 'warning';
  return 'active';
}

export function TrackScreen() {
  const navigation = useNavigation<Nav>();
  const { orders, pastOrders, ratedIds, markPickedUp, table } = useOrder();
  const { show } = useToast();
  const [tab, setTab] = useState<'current' | 'history'>('current');
  const [refreshing, setRefreshing] = useState(false);

  const sessionNewestFirst = useMemo(() => [...orders].reverse(), [orders]);
  const activeOrder = useMemo(
    () => sessionNewestFirst.find((order) => !isFinalStatus(order)) ?? null,
    [sessionNewestFirst]
  );
  const current = activeOrder ?? sessionNewestFirst[0] ?? null;
  const historyList = useMemo(
    () => [...sessionNewestFirst, ...pastOrders],
    [sessionNewestFirst, pastOrders]
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      show('Order status updated', 'info');
    }, 900);
  }, [show]);

  const handleOrderMore = () => {
    if (activeOrder) {
      show('Your order is still being prepared — use "Order More" when it finishes.', 'info');
      return;
    }
    navigation.navigate('Main', { screen: 'Menu' });
  };

  const renderOrderRow = (order: Order) => {
    const finished = isFinalStatus(order);
    const needsRating = finished && !ratedIds.includes(order.id);
    return (
      <Pressable
        key={order.id}
        style={styles.histRow}
        onPress={() => navigation.navigate('OrderDetails', { orderNumber: order.id })}
      >
        <View style={styles.histIcon}>
          <Ionicons
            name={order.type === 'dine-in' ? 'restaurant-outline' : 'bag-handle-outline'}
            size={18}
            color={Colors.primary}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.histTitle}>
            #{order.id} · {order.type === 'dine-in' ? 'Dine-In' : 'Take-Away'}
          </Text>
          <Text style={styles.histMeta}>
            {formatOrderDate(order.placedAt)} ·{' '}
            {order.items.reduce((sum, item) => sum + item.qty, 0)} items ·{' '}
            {rupees(order.total)}
          </Text>
        </View>
        {needsRating ? (
          <Pressable
            style={styles.rateBtn}
            onPress={() => navigation.navigate('Feedback', { orderNumber: order.id })}
          >
            <Text style={styles.rateBtnText}>Rate</Text>
          </Pressable>
        ) : (
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Track Order</Text>
        {current && !isFinalStatus(current) ? <LiveBadge /> : null}
      </View>

      <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
        <SegmentedControl
          options={['Current', 'History']}
          value={tab === 'current' ? 'Current' : 'History'}
          onChange={(option) => setTab(option === 'Current' ? 'current' : 'history')}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {tab === 'current' ? (
          current ? (
            <>
              <View style={styles.orderCard}>
                <View style={styles.orderCardTop}>
                  <Text style={styles.orderId}>#{current.id}</Text>
                  <StatusBadge
                    label={statusLabel(current.status, current.type)}
                    tone={statusTone(current)}
                  />
                </View>
                <Text style={styles.orderMeta}>
                  {current.type === 'dine-in'
                    ? `Dine-In · Table ${current.table ?? table}`
                    : 'Take-Away'}
                  {' · '}
                  {formatOrderDate(current.placedAt)} · {rupees(current.total)}
                </Text>
                {current.additional ? (
                  <View style={{ marginTop: 10 }}>
                    <StatusBadge label="ADDITIONAL ORDER" tone="neutral" dot={false} />
                  </View>
                ) : null}
              </View>

              <View style={styles.timelineCard}>
                <View style={styles.timelineHead}>
                  <Text style={styles.timelineTitle}>Order Status</Text>
                  {isFinalStatus(current) ? (
                    <StatusBadge label="COMPLETED" tone="success" />
                  ) : (
                    <LiveBadge />
                  )}
                </View>
                <Timeline steps={buildSteps(current)} />
                {current.type === 'take-away' && current.status === 'ready' && (
                  <View style={styles.codeBox}>
                    <Text style={styles.codeLabel}>SHOW THIS CODE AT THE COUNTER</Text>
                    <Text style={styles.code}>{current.pickupCode}</Text>
                  </View>
                )}
              </View>

              {!isFinalStatus(current) && current.status !== 'ready' ? (
                <InfoBanner
                  icon="sparkles-outline"
                  text="You're all set — we'll update this page automatically as your order progresses."
                />
              ) : null}

              {current.type === 'dine-in' && current.status === 'ready' ? (
                <InfoBanner
                  icon="restaurant-outline"
                  text="Sit tight! Your order is on its way to your table."
                />
              ) : null}
              {current.type === 'take-away' && current.status === 'ready' ? (
                <PrimaryButton
                  label="I've Picked Up My Order"
                  icon="checkmark-circle-outline"
                  onPress={() => markPickedUp(current.id)}
                  style={{ marginTop: 14 }}
                />
              ) : null}

              {isFinalStatus(current) ? (
                ratedIds.includes(current.id) ? (
                  <View style={{ marginTop: 14 }}>
                    <InfoBanner
                      icon="checkmark-circle-outline"
                      text="Thanks for rating your order — cheers!"
                    />
                  </View>
                ) : (
                  <PrimaryButton
                    label="Rate Your Order"
                    icon="star-outline"
                    onPress={() =>
                      navigation.navigate('Feedback', { orderNumber: current.id })
                    }
                    style={{ marginTop: 14 }}
                  />
                )
              ) : null}

              {isFinalStatus(current) ? (
                <SecondaryButton
                  label="Order More"
                  icon="add-circle-outline"
                  onPress={handleOrderMore}
                  style={{ marginTop: 12 }}
                />
              ) : null}
            </>
          ) : (
            <EmptyState
              icon="time-outline"
              title="No active orders"
              subtitle="When you place an order, you can follow its progress here in real time."
              actionLabel="Browse Menu"
              onAction={() => navigation.navigate('Main', { screen: 'Menu' })}
            />
          )
        ) : (
          <>
            <SectionHeader title="All Orders" />
            {historyList.map(renderOrderRow)}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.4,
  },
  content: {
    padding: 20,
    paddingBottom: 50,
  },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    marginBottom: 14,
    ...Shadow.soft,
  },
  orderCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderId: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  orderMeta: {
    fontSize: 13.5,
    color: Colors.textSecondary,
    marginTop: 7,
  },
  timelineCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    marginBottom: 14,
    ...Shadow.soft,
  },
  timelineHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  timelineTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: Colors.text,
  },
  codeBox: {
    marginTop: 16,
    alignItems: 'center',
    backgroundColor: Colors.primaryMuted,
    borderRadius: Radius.lg,
    paddingVertical: 16,
  },
  codeLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 1.4,
  },
  code: {
    fontSize: 44,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 8,
    marginTop: 4,
  },
  histRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 13,
    marginBottom: 11,
    ...Shadow.soft,
  },
  histIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  histTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.text,
  },
  histMeta: {
    fontSize: 12.5,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  rateBtn: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rateBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.white,
  },
});
