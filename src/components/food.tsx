import React from 'react';
import { Image, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Dish } from '../data/menu';
import { Colors } from '../theme/colors';
import { Radius, Shadow } from '../theme/tokens';
import { rupees } from '../utils/format';
import { VegMark } from './ui';

export function AddButton({ onPress, size = 34 }: { onPress: () => void; size?: number }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel="Add to order"
      style={({ pressed }) => [
        styles.addBtn,
        { width: size, height: size, borderRadius: size / 2 },
        pressed && { transform: [{ scale: 0.86 }] },
      ]}
    >
      <Ionicons name="add" size={size * 0.6} color={Colors.white} />
    </Pressable>
  );
}

export function QuantityStepper({
  value,
  onChange,
  small = false,
}: {
  value: number;
  onChange: (delta: number) => void;
  small?: boolean;
}) {
  const box = small ? 26 : 32;
  const iconSize = small ? 16 : 19;
  return (
    <View style={[styles.stepper, small && { paddingVertical: 3, paddingHorizontal: 4 }]}>
      <Pressable
        onPress={() => onChange(-1)}
        accessibilityLabel="Decrease quantity"
        style={({ pressed }) => [
          styles.stepBtn,
          { width: box, height: box, borderRadius: box / 2 },
          pressed && { opacity: 0.6 },
        ]}
      >
        <Ionicons name="remove" size={iconSize} color={Colors.primary} />
      </Pressable>
      <Text style={[styles.stepValue, small && { fontSize: 14 }]}>{value}</Text>
      <Pressable
        onPress={() => onChange(1)}
        accessibilityLabel="Increase quantity"
        style={({ pressed }) => [
          styles.stepBtn,
          { width: box, height: box, borderRadius: box / 2 },
          pressed && { opacity: 0.6 },
        ]}
      >
        <Ionicons name="add" size={iconSize} color={Colors.primary} />
      </Pressable>
    </View>
  );
}

export function PopularFoodCard({
  dish,
  onOpen,
  onAdd,
  qty,
  onQtyChange,
  style,
}: {
  dish: Dish;
  onOpen: () => void;
  onAdd: () => void;
  qty?: number | undefined;
  onQtyChange?: ((delta: number) => void) | undefined;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onOpen}
      style={({ pressed }) => [styles.popular, pressed && { transform: [{ scale: 0.985 }] }, style]}
    >
      <Image source={dish.image} style={styles.popularImg} />
      <View style={styles.popularBody}>
        <View style={styles.nameRow}>
          <VegMark veg={dish.veg} />
          <Text style={styles.popularName} numberOfLines={1}>
            {dish.name}
          </Text>
        </View>
        <Text style={styles.popularDesc} numberOfLines={1}>
          {dish.description}
        </Text>
        <View style={styles.cardFoot}>
          <Text style={styles.price}>{rupees(dish.price)}</Text>
          {qty && qty > 0 && onQtyChange ? (
            <QuantityStepper value={qty} onChange={onQtyChange} small />
          ) : (
            <AddButton onPress={onAdd} />
          )}
        </View>
      </View>
    </Pressable>
  );
}

export function GridFoodCard({
  dish,
  onOpen,
  onAdd,
  qty,
  onQtyChange,
  style,
}: {
  dish: Dish;
  onOpen: () => void;
  onAdd: () => void;
  qty?: number | undefined;
  onQtyChange?: ((delta: number) => void) | undefined;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onOpen}
      style={({ pressed }) => [
        styles.popular,
        { width: '100%' },
        pressed && { transform: [{ scale: 0.985 }] },
        style,
      ]}
    >
      <Image source={dish.image} style={[styles.popularImg, { height: 112 }]} />
      <View style={styles.popularBody}>
        <View style={styles.nameRow}>
          <VegMark veg={dish.veg} />
          <Text style={styles.popularName} numberOfLines={1}>
            {dish.name}
          </Text>
        </View>
        <Text style={styles.popularDesc} numberOfLines={2}>
          {dish.description}
        </Text>
        <View style={styles.cardFoot}>
          <Text style={styles.price}>{rupees(dish.price)}</Text>
          {qty && qty > 0 && onQtyChange ? (
            <QuantityStepper value={qty} onChange={onQtyChange} small />
          ) : (
            <AddButton onPress={onAdd} />
          )}
        </View>
      </View>
    </Pressable>
  );
}

export function FoodRow({
  dish,
  onOpen,
  onAdd,
  qty,
  onQtyChange,
}: {
  dish: Dish;
  onOpen: () => void;
  onAdd: () => void;
  qty?: number | undefined;
  onQtyChange?: ((delta: number) => void) | undefined;
}) {
  return (
    <Pressable onPress={onOpen} style={({ pressed }) => [styles.row, pressed && { opacity: 0.72 }]}>
      <Image source={dish.image} style={styles.rowImg} />
      <View style={styles.rowBody}>
        <View style={styles.nameRow}>
          <VegMark veg={dish.veg} />
          <Text style={styles.rowName} numberOfLines={1}>
            {dish.name}
          </Text>
        </View>
        <Text style={styles.rowDesc} numberOfLines={2}>
          {dish.description}
        </Text>
        <View style={styles.cardFoot}>
          <Text style={styles.price}>{rupees(dish.price)}</Text>
          {qty && qty > 0 && onQtyChange ? (
            <QuantityStepper value={qty} onChange={onQtyChange} small />
          ) : (
            <AddButton onPress={onAdd} />
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 5,
    gap: 2,
  },
  stepBtn: {
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: {
    minWidth: 26,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  popular: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.soft,
  },
  popularImg: {
    width: '100%',
    height: 118,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    backgroundColor: Colors.surfaceAlt,
  },
  popularBody: {
    padding: 12,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  popularName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  popularDesc: {
    fontSize: 12.5,
    color: Colors.textSecondary,
  },
  cardFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  price: {
    fontSize: 15.5,
    fontWeight: '800',
    color: Colors.text,
  },
  row: {
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
  rowImg: {
    width: 84,
    height: 84,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
  },
  rowBody: {
    flex: 1,
    justifyContent: 'center',
    gap: 3,
  },
  rowName: {
    flex: 1,
    fontSize: 15.5,
    fontWeight: '700',
    color: Colors.text,
  },
  rowDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
