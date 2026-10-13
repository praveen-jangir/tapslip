import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';
import { RESTAURANT_NAME } from '../data/menu';
import { useOrder } from '../context/OrderContext';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '../context/ToastContext';
import { AppHeader, EmptyState, PrimaryButton, RadioRow, VegMark } from '../components/ui';
import { QuantityStepper } from '../components/food';
import { Colors } from '../theme/colors';
import { Radius, Shadow } from '../theme/tokens';
import { rupees } from '../utils/format';

type Nav = StackNavigationProp<RootStackParamList>;

const SPICE_LEVELS = ['Mild', 'Medium', 'Spicy'];

export function FoodDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'FoodDetail'>>();
  const { addToCart } = useOrder();
  const { getMenuItem } = useAdmin();
  const { show } = useToast();
  const dish = getMenuItem(route.params.dishId);
  const [qty, setQty] = useState(1);
  const [spice, setSpice] = useState('Medium');
  const [notes, setNotes] = useState('');

  if (!dish) {
    return (
      <View style={styles.root}>
        <AppHeader title="Dish" onBack={() => navigation.goBack()} />
        <EmptyState
          icon="alert-circle-outline"
          title="Dish unavailable"
          subtitle="This dish could not be found or is currently not on the menu."
          actionLabel="Back to Menu"
          onAction={() => navigation.goBack()}
        />
      </View>
    );
  }

  const handleAdd = () => {
    if (!dish.available) {
      show(`${dish.name} is currently unavailable`, 'error');
      return;
    }
    addToCart(dish, qty, dish.spiceOption ? spice : undefined, notes.trim() || undefined);
    show(`${dish.name} × ${qty} added to your order`);
    navigation.goBack();
  };

  return (
    <View style={styles.root}>
      <View style={styles.heroWrap}>
        <Image source={dish.image} style={styles.hero} />
        <SafeAreaView edges={['top']} style={styles.heroBar}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.heroBtn, pressed && { opacity: 0.6 }]}
          >
            <Ionicons name="chevron-back" size={22} color={Colors.text} />
          </Pressable>
        </SafeAreaView>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleRow}>
          <VegMark veg={dish.veg} />
          <Text style={styles.name}>{dish.name}</Text>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Ionicons name="pricetag-outline" size={13} color={Colors.primary} />
            <Text style={styles.metaChipText}>{dish.category}</Text>
          </View>
          <View style={styles.metaChip}>
            <Ionicons name="star" size={13} color={Colors.warning} />
            <Text style={styles.metaChipText}>4.5 (240+)</Text>
          </View>
        </View>

        <Text style={styles.price}>{rupees(dish.price)}</Text>
        <Text style={styles.desc}>{dish.longDescription}</Text>

        <View style={styles.factsRow}>
          <View style={styles.fact}>
            <Ionicons name="people-outline" size={17} color={Colors.primary} />
            <Text style={styles.factText}>Serves 1</Text>
          </View>
          <View style={styles.fact}>
            <Ionicons name="time-outline" size={17} color={Colors.primary} />
            <Text style={styles.factText}>15 min prep</Text>
          </View>
          <View style={styles.fact}>
            <Ionicons name="restaurant-outline" size={17} color={Colors.primary} />
            <Text style={styles.factText}>{RESTAURANT_NAME}</Text>
          </View>
        </View>

        {dish.spiceOption && (
          <View style={styles.block}>
            <Text style={styles.blockTitle}>Choose Spice Level</Text>
            {SPICE_LEVELS.map((level) => (
              <RadioRow
                key={level}
                label={level}
                selected={spice === level}
                onPress={() => setSpice(level)}
              />
            ))}
          </View>
        )}

        <View style={styles.block}>
          <Text style={styles.blockTitle}>Special Instructions</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g. less oil, no coriander"
            placeholderTextColor={Colors.textMuted}
            style={styles.notes}
            multiline
            maxLength={140}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <QuantityStepper value={qty} onChange={(delta) => setQty(Math.max(1, qty + delta))} />
        <PrimaryButton
          label={
            !dish.available
              ? 'Currently Unavailable'
              : `Add to Order · ${rupees(dish.price * qty)}`
          }
          onPress={handleAdd}
          disabled={!dish.available}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  heroWrap: {
    height: 300,
    backgroundColor: Colors.surfaceAlt,
  },
  hero: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: Radius.xxl,
    borderBottomRightRadius: Radius.xxl,
  },
  heroBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  heroBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...Shadow.soft,
  },
  body: {
    padding: 20,
    paddingBottom: 30,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    flex: 1,
    fontSize: 25,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.4,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 27,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: Colors.surfaceAlt,
  },
  metaChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  price: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 14,
  },
  desc: {
    fontSize: 15,
    lineHeight: 23,
    color: Colors.textSecondary,
    marginTop: 10,
  },
  factsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.primaryMuted,
    borderRadius: Radius.lg,
    padding: 14,
    marginTop: 18,
  },
  fact: {
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  factText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  block: {
    marginTop: 24,
  },
  blockTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  notes: {
    marginTop: 8,
    minHeight: 76,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceAlt,
    padding: 14,
    fontSize: 14.5,
    color: Colors.text,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 26,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.divider,
    backgroundColor: Colors.white,
  },
});
