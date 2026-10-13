import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';
import {
  CATEGORIES,
  RESTAURANT_NAME,
  type CategoryFilter,
  type Dish,
} from '../data/menu';
import { useOrder } from '../context/OrderContext';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '../context/ToastContext';
import { Chip, DietFilterSlider, EmptyState, InfoBanner, Logo, SectionHeader, TableChip, type DietFilter } from '../components/ui';
import { FollowUsCard } from '../components/social';
import { FoodRow, GridFoodCard, PopularFoodCard } from '../components/food';
import { Colors } from '../theme/colors';
import { Radius, Shadow } from '../theme/tokens';
import { rupees } from '../utils/format';

type Nav = StackNavigationProp<RootStackParamList>;

export function MenuHomeScreen() {
  const navigation = useNavigation<Nav>();
  const { table, cart, cartCount, cartTotal, addToCart, changeQty } = useOrder();
  const { visibleMenu, getMenuItem, settings } = useAdmin();
  const { show } = useToast();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('All');
  const [diet, setDiet] = useState<DietFilter>('all');

  const matchesDiet = (dish: Dish) =>
    diet === 'all' || (diet === 'veg' ? dish.veg : !dish.veg);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return visibleMenu.filter(
      (d) =>
        (d.name.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q)) &&
        matchesDiet(d)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, diet, visibleMenu]);

  const categoryDishes = useMemo(
    () =>
      visibleMenu.filter(
        (d) => (category === 'All' || d.category === category) && matchesDiet(d)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [category, diet, visibleMenu]
  );
  const popularDishes = useMemo(
    () => visibleMenu.filter((d) => d.popular && matchesDiet(d)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [diet, visibleMenu]
  );
  const recommendedDishes = useMemo(
    () =>
      visibleMenu.filter(
        (d) => (d.id === 'chicken-biryani' || d.id === 'mojito') && matchesDiet(d)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [diet, visibleMenu]
  );
  const searching = query.trim().length > 0;

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
    if (!line) return;
    changeQty(line.key, delta);
  };

  const openDish = (dishId: string) => navigation.navigate('FoodDetail', { dishId });
  const goCart = () => navigation.navigate('Main', { screen: 'MyOrder' });
  const goTrack = () => navigation.navigate('Main', { screen: 'Track' });

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: cartCount > 0 ? 130 : 40 }}
      >
        <View style={styles.headerRow}>
          <Logo size={32} />
          <View style={styles.headerActions}>
            <DietFilterSlider value={diet} onChange={setDiet} />
            <TableChip table={table} />
            <Pressable style={styles.cartBtn} onPress={goCart}>
              <Ionicons name="bag-handle-outline" size={19} color={Colors.primary} />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        <View style={styles.greet}>
          <Text style={styles.greetTitle}>Good to see you 👋</Text>
          <Text style={styles.greetSub}>Explore {RESTAURANT_NAME}'s menu</Text>
        </View>

        {!settings.isOpen && (
          <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
            <InfoBanner
              icon="time-outline"
              tone="warning"
              text="We're closed right now. You can browse but can't place new orders."
            />
          </View>
        )}

        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search e.g. biryani"
            placeholderTextColor={Colors.textMuted}
            style={styles.searchInput}
            returnKeyType="search"
          />
          {searching ? (
            <Pressable onPress={() => setQuery('')} hitSlop={10}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </Pressable>
          ) : null}
        </View>

        {searching ? (
          searchResults.length > 0 ? (
            <View style={styles.section}>
              <SectionHeader title={`Results for "${query.trim()}"`} />
              {searchResults.map((dish) => (
                <FoodRow
                  key={dish.id}
                  dish={dish}
                  qty={qtyOf(dish.id)}
                  onQtyChange={(delta) => handleQty(dish.id, delta)}
                  onOpen={() => openDish(dish.id)}
                  onAdd={() => handleAdd(dish.id)}
                />
              ))}
            </View>
          ) : (
            <EmptyState
              icon="search"
              title="No dishes found"
              subtitle="Try another dish name — e.g. 'biryani' or 'dessert'."
            />
          )
        ) : (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              {CATEGORIES.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  active={category === item}
                  onPress={() => setCategory(item)}
                  style={{ marginRight: 8 }}
                />
              ))}
            </ScrollView>

            <View style={{ marginBottom: 18 }}>
              <InfoBanner
                text="Tip: you can add more items anytime, even after ordering."
                actionLabel="Track"
                onAction={goTrack}
              />
            </View>

            {popularDishes.length > 0 && category === 'All' && (
              <View style={styles.section}>
                <SectionHeader title="Popular Now" />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.popularRow}
                >
                  {popularDishes.map((dish) => (
                    <PopularFoodCard
                      key={dish.id}
                      dish={dish}
                      style={{ width: 190 }}
                      qty={qtyOf(dish.id)}
                      onQtyChange={(delta) => handleQty(dish.id, delta)}
                      onOpen={() => openDish(dish.id)}
                      onAdd={() => handleAdd(dish.id)}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {recommendedDishes.length > 0 && category === 'All' && (
              <View style={styles.section}>
                <SectionHeader title="Recommended for You" />
                {recommendedDishes.map((dish) => (
                  <FoodRow
                    key={`rec-${dish.id}`}
                    dish={dish}
                    qty={qtyOf(dish.id)}
                    onQtyChange={(delta) => handleQty(dish.id, delta)}
                    onOpen={() => openDish(dish.id)}
                    onAdd={() => handleAdd(dish.id)}
                  />
                ))}
              </View>
            )}

            <View style={styles.section}>
              <SectionHeader
                title={category === 'All' ? 'All Dishes' : category}
                actionLabel={category !== 'All' ? 'View all' : undefined}
                onAction={
                  category !== 'All'
                    ? () => navigation.navigate('Category', { category })
                    : undefined
                }
              />
              {categoryDishes.length > 0 ? (
                <View style={styles.grid}>
                  {categoryDishes.map((dish) => (
                    <GridFoodCard
                      key={dish.id}
                      dish={dish}
                      style={{ width: '48%' }}
                      qty={qtyOf(dish.id)}
                      onQtyChange={(delta) => handleQty(dish.id, delta)}
                      onOpen={() => openDish(dish.id)}
                      onAdd={() => handleAdd(dish.id)}
                    />
                  ))}
                </View>
              ) : (
                <EmptyState
                  icon="leaf-outline"
                  title="No dishes in this view"
                  subtitle="Try another category or switch the food filter above."
                />
              )}
            </View>
          </>
        )}

        <View style={styles.section}>
          <FollowUsCard />
        </View>
      </ScrollView>

      {cartCount > 0 && (
        <Pressable style={styles.cartBar} onPress={goCart}>
          <View style={styles.cartBarCount}>
            <Text style={styles.cartBarCountText}>{cartCount}</Text>
          </View>
          <Text style={styles.cartBarText}>View Cart</Text>
          <Text style={styles.cartBarTotal}>{rupees(cartTotal)}</Text>
        </Pressable>
      )}
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
    paddingTop: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cartBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.white,
  },
  greet: {
    paddingHorizontal: 20,
    marginTop: 18,
    gap: 4,
  },
  greetTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  greetSub: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  searchBox: {
    marginTop: 16,
    marginHorizontal: 20,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    paddingVertical: 0,
  },
  chipRow: {
    paddingLeft: 20,
    paddingRight: 8,
    paddingBottom: 4,
    paddingTop: 18,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
    marginTop: 4,
  },
  popularRow: {
    gap: 14,
    paddingRight: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  cartBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 14,
    height: 58,
    borderRadius: Radius.xxl,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    ...Shadow.button,
  },
  cartBarCount: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBarCountText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  cartBarText: {
    flex: 1,
    marginLeft: 13,
    fontSize: 15.5,
    fontWeight: '700',
    color: Colors.white,
  },
  cartBarTotal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.white,
    marginRight: 12,
  },
});
