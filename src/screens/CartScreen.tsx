import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';
import { getDish } from '../data/menu';
import { isFinalStatus, useOrder } from '../context/OrderContext';
import { useToast } from '../context/ToastContext';
import { EmptyState, InfoBanner, PrimaryButton, RadioRow, SectionHeader, TextButton, VegMark } from '../components/ui';
import { QuantityStepper } from '../components/food';
import { Colors } from '../theme/colors';
import { Radius, Shadow } from '../theme/tokens';
import { rupees } from '../utils/format';

type Nav = StackNavigationProp<RootStackParamList>;

export function CartScreen() {
  const navigation = useNavigation<Nav>();
  const {
    cart,
    changeQty,
    removeFromCart,
    cartSubtotal,
    cartTax,
    cartTotal,
    orderType,
    placeOrder,
    orders,
  } = useOrder();
  const { show } = useToast();
  const [fulfilment, setFulfilment] = useState<'delivery' | 'pickup'>('delivery');

  const hasActiveOrder = orders.some((order) => !isFinalStatus(order));

  const handleAddMore = () => {
    if (hasActiveOrder) {
      show('You already have an order in progress — use "Order More" when it finishes.', 'info');
      return;
    }
    navigation.navigate('Main', { screen: 'Menu' });
  };

  const handlePlaceOrder = () => {
    const order = placeOrder();
    if (!order) return;
    navigation.navigate('OrderPlaced', { orderNumber: order.id });
  };

  if (cart.length === 0) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>My Order</Text>
        </View>
        <EmptyState
          icon="bag-handle-outline"
          title="Your order is empty"
          subtitle="Browse the menu and add something delicious to get started."
          actionLabel="Browse Menu"
          onAction={() => navigation.navigate('Main', { screen: 'Menu' })}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>My Order</Text>
        <Text style={styles.headerMeta}>
          {cart.reduce((sum, item) => sum + item.qty, 0)} items
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {hasActiveOrder && (
          <View style={{ marginBottom: 16 }}>
            <InfoBanner
              icon="time-outline"
              text="You already have an order in progress."
              actionLabel="Track"
              onAction={() => navigation.navigate('Main', { screen: 'Track' })}
            />
          </View>
        )}

        <SectionHeader title="Your Items" />
        {cart.map((item) => (
          <View key={item.key} style={styles.itemCard}>
            <Image source={item.image} style={styles.itemImg} />
            <View style={{ flex: 1 }}>
              <View style={styles.itemTop}>
                <VegMark veg={getDish(item.dishId)?.veg ?? true} />
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Pressable onPress={() => removeFromCart(item.key)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={17} color={Colors.textMuted} />
                </Pressable>
              </View>
              {item.spice || item.instructions ? (
                <Text style={styles.itemMeta} numberOfLines={1}>
                  {[item.spice, item.instructions].filter(Boolean).join(' · ')}
                </Text>
              ) : null}
              <View style={styles.itemFoot}>
                <Text style={styles.itemPrice}>{rupees(item.price * item.qty)}</Text>
                <QuantityStepper
                  small
                  value={item.qty}
                  onChange={(delta) => changeQty(item.key, delta)}
                />
              </View>
            </View>
          </View>
        ))}

        {orderType === 'take-away' && (
          <View style={styles.block}>
            <SectionHeader title="How would you like to get it?" />
            <View style={styles.radioCard}>
              <RadioRow
                label="Delivery to my address"
                subtitle="Reach in ~30 min · ₹29 fee"
                selected={fulfilment === 'delivery'}
                onPress={() => setFulfilment('delivery')}
              />
              <View style={styles.hr} />
              <RadioRow
                label="I'll pick it up myself"
                subtitle="Ready in ~18 min at the counter"
                selected={fulfilment === 'pickup'}
                onPress={() => setFulfilment('pickup')}
              />
            </View>
          </View>
        )}

        <View style={styles.block}>
          <SectionHeader title="Bill Details" />
          <View style={styles.bill}>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Items total</Text>
              <Text style={styles.billValue}>{rupees(cartSubtotal)}</Text>
            </View>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>GST (5%)</Text>
              <Text style={styles.billValue}>{rupees(cartTax)}</Text>
            </View>
            <View style={styles.hr} />
            <View style={styles.billRow}>
              <Text style={styles.billTotalLabel}>To Pay</Text>
              <Text style={styles.billTotalValue}>{rupees(cartTotal)}</Text>
            </View>
          </View>
        </View>

        <TextButton
          label="Add More Items"
          onPress={handleAddMore}
          style={{ alignSelf: 'center', paddingHorizontal: 24 }}
        />
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label={`Place Order · ${rupees(cartTotal)}`}
          icon="arrow-forward"
          onPress={handlePlaceOrder}
        />
      </View>
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
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.4,
  },
  headerMeta: {
    fontSize: 13.5,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  itemCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 10,
    marginBottom: 12,
    ...Shadow.soft,
  },
  itemImg: {
    width: 68,
    height: 68,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
  },
  itemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  itemMeta: {
    fontSize: 12.5,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  itemFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  block: {
    marginTop: 14,
  },
  radioCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 6,
    ...Shadow.soft,
  },
  hr: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 4,
  },
  bill: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    ...Shadow.soft,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
  },
  billLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  billValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  billTotalLabel: {
    fontSize: 15.5,
    fontWeight: '800',
    color: Colors.text,
  },
  billTotalValue: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.primary,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 26,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.divider,
    backgroundColor: Colors.white,
  },
});
