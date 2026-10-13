import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';
import { CATEGORIES, type CategoryName } from '../data/menu';
import { useOrder } from '../context/OrderContext';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '../context/ToastContext';
import { AppHeader, InfoBanner } from '../components/ui';
import { FoodRow } from '../components/food';
import { Colors } from '../theme/colors';

type Nav = StackNavigationProp<RootStackParamList>;

const VALID_CATEGORIES: string[] = CATEGORIES.filter((c) => c !== 'All');

export function CategoryScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'Category'>>();
  const { cart, addToCart, changeQty } = useOrder();
  const { visibleMenu, getMenuItem } = useAdmin();
  const { show } = useToast();

  const category = route.params.category;
  const valid = VALID_CATEGORIES.includes(category);
  const dishes = useMemo(
    () => (valid ? visibleMenu.filter((d) => d.category === (category as CategoryName)) : visibleMenu),
    [category, valid, visibleMenu]
  );

  const qtyOf = (dishId: string) =>
    cart.filter((item) => item.dishId === dishId).reduce((sum, item) => sum + item.qty, 0);

  const handleAdd = (dishId: string) => {
    const dish = getMenuItem(dishId);
    if (!dish || !dish.available) return;
    const spice = dish.spiceOption ? 'Medium' : undefined;
    const existing = cart.find(
      (item) => item.dishId === dishId && (item.spice ?? '') === (spice ?? '')
    );
    if (existing) changeQty(existing.key, 1);
    else addToCart(dish, 1, spice);
    show(`${dish.name} added to your order`);
  };

  const handleQty = (dishId: string, delta: number) => {
    const line = cart.find((item) => item.dishId === dishId);
    if (line) changeQty(line.key, delta);
  };

  return (
    <View style={styles.root}>
      <AppHeader title={category} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!valid && (
          <View style={{ marginBottom: 16 }}>
            <InfoBanner
              icon="warning-outline"
              tone="warning"
              text="We couldn't load this category. Here's everything we have on the menu."
            />
          </View>
        )}
        <Text style={styles.count}>
          {dishes.length} {dishes.length === 1 ? 'dish' : 'dishes'}
        </Text>
        {dishes.map((dish) => (
          <FoodRow
            key={dish.id}
            dish={dish}
            qty={qtyOf(dish.id)}
            onQtyChange={(delta) => handleQty(dish.id, delta)}
            onOpen={() => navigation.navigate('FoodDetail', { dishId: dish.id })}
            onAdd={() => handleAdd(dish.id)}
          />
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
    paddingBottom: 40,
  },
  count: {
    fontSize: 13.5,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 14,
  },
});
