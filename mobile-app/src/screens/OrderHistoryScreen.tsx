import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';
import { isFinalStatus, useOrder, type Order } from '../context/OrderContext';
import { AppHeader, EmptyState, SegmentedControl } from '../components/ui';
import { Colors } from '../theme/colors';
import { Radius, Shadow } from '../theme/tokens';
import { formatOrderDate, rupees } from '../utils/format';

type Nav = StackNavigationProp<RootStackParamList>;

export function OrderHistoryScreen() {
  const navigation = useNavigation<Nav>();
  const { orders, pastOrders, ratedIds } = useOrder();
  const [filter, setFilter] = useState('All Orders');

  const sessionNewestFirst = useMemo(() => [...orders].reverse(), [orders]);
  const list = useMemo(
    () => (filter === 'All Orders' ? [...sessionNewestFirst, ...pastOrders] : sessionNewestFirst),
    [filter, sessionNewestFirst, pastOrders]
  );

  const renderRow = (order: Order) => {
    const finished = isFinalStatus(order);
    const needsRating = finished && !ratedIds.includes(order.id);
    return (
      <Pressable
        key={order.id}
        style={styles.row}
        onPress={() => navigation.navigate('OrderDetails', { orderNumber: order.id })}
      >
        <View style={styles.rowIcon}>
          <Ionicons
            name={order.type === 'dine-in' ? 'restaurant-outline' : 'bag-handle-outline'}
            size={18}
            color={Colors.primary}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle}>
            #{order.id} · {order.type === 'dine-in' ? 'Dine-In' : 'Take-Away'}
          </Text>
          <Text style={styles.rowMeta}>
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
    <View style={styles.root}>
      <AppHeader title="Order History" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: 18 }}>
          <SegmentedControl
            options={['All Orders', 'This Visit']}
            value={filter}
            onChange={setFilter}
          />
        </View>
        {list.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            title="No orders yet"
            subtitle="Orders you place will show up here."
            actionLabel="Browse Menu"
            onAction={() => navigation.navigate('Main', { screen: 'Menu' })}
          />
        ) : (
          list.map(renderRow)
        )}
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
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 13,
    marginBottom: 11,
    ...Shadow.soft,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.text,
  },
  rowMeta: {
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
