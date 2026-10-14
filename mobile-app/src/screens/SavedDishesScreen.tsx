import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';
import { DISHES, getDish } from '../data/menu';
import { useOrder } from '../context/OrderContext';
import { useToast } from '../context/ToastContext';
import { AppHeader, EmptyState, InfoBanner } from '../components/ui';
import { FoodRow } from '../components/food';
import { Colors } from '../theme/colors';

type Nav = StackNavigationProp<RootStackParamList>;

const FAVOURITE_IDS = ['paneer-tikka', 'chicken-biryani', 'butter-chicken', 'gulab-jamun', 'mojito'];

export function SavedDishesScreen() {
  const navigation = useNavigation<Nav>();
  const { cart, addToCart, changeQty } = useOrder();
  const { show } = useToast();

  const dishes = FAVOURITE_IDS.map((id) => getDish(id)).filter(
    (dish): dish is NonNullable<typeof dish> => Boolean(dish)
  );

  const qtyOf = (dishId: string) =>
    cart.filter((item) => item.dishId === dishId).reduce((sum, item) => sum + item.qty, 0);

  const handleAdd = (dishId: string) => {
    const dish = getDish(dishId);
    if (!dish) return;
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
      <AppHeader title="Saved Dishes" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: 16 }}>
          <InfoBanner text="Your favourite dishes are saved here for quick re-ordering." />
        </View>
        {dishes.length === 0 ? (
          <EmptyState
            icon="heart-outline"
            title="No saved dishes yet"
            subtitle="Tap the heart on a dish to save it for later."
            actionLabel="Browse Menu"
            onAction={() => navigation.navigate('Main', { screen: 'Menu' })}
          />
        ) : (
          dishes.map((dish) => (
            <FoodRow
              key={dish.id}
              dish={dish}
              qty={qtyOf(dish.id)}
              onQtyChange={(delta) => handleQty(dish.id, delta)}
              onOpen={() => navigation.navigate('FoodDetail', { dishId: dish.id })}
              onAdd={() => handleAdd(dish.id)}
            />
          ))
        )}
        <Text style={styles.footerNote}>
          Showing {dishes.length} of {DISHES.length} dishes on the menu.
        </Text>
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
  footerNote: {
    fontSize: 12.5,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
});
