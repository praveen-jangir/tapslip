import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';
import { RESTAURANT_NAME } from '../data/menu';
import { useOrder } from '../context/OrderContext';
import { useToast } from '../context/ToastContext';
import { Logo, SectionHeader, StatusBadge } from '../components/ui';
import { Colors } from '../theme/colors';
import { Radius, Shadow } from '../theme/tokens';

type Nav = StackNavigationProp<RootStackParamList>;

interface RowDef {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hint?: string | undefined;
  onPress: () => void;
}

export function MoreScreen() {
  const navigation = useNavigation<Nav>();
  const { orders, pastOrders } = useOrder();
  const { show } = useToast();

  const orderRows: RowDef[] = [
    {
      icon: 'receipt-outline',
      label: 'Order History',
      hint: `${orders.length + pastOrders.length} orders`,
      onPress: () => navigation.navigate('OrderHistory'),
    },
    {
      icon: 'heart-outline',
      label: 'Saved Dishes',
      onPress: () => navigation.navigate('SavedDishes'),
    },
    {
      icon: 'language-outline',
      label: 'Language',
      hint: 'English',
      onPress: () => navigation.navigate('Language'),
    },
  ];

  const supportRows: RowDef[] = [
    {
      icon: 'chatbubbles-outline',
      label: 'Help & Support',
      onPress: () => navigation.navigate('Help'),
    },
    {
      icon: 'document-text-outline',
      label: 'Terms & Privacy',
      onPress: () => navigation.navigate('Terms'),
    },
    {
      icon: 'flask-outline',
      label: 'UI States (Demo)',
      hint: 'Developer',
      onPress: () => navigation.navigate('StatesDemo'),
    },
  ];

  const renderRow = (row: RowDef) => (
    <Pressable
      key={row.label}
      onPress={row.onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
    >
      <View style={styles.rowIcon}>
        <Ionicons name={row.icon} size={19} color={Colors.primary} />
      </View>
      <Text style={styles.rowLabel}>{row.label}</Text>
      {row.hint ? <Text style={styles.rowHint}>{row.hint}</Text> : null}
      <Ionicons name="chevron-forward" size={17} color={Colors.textMuted} />
    </Pressable>
  );

  const restartSession = () => {
    navigation.reset({ index: 0, routes: [{ name: 'OrderType' }] });
    show('Session restarted — choose how you would like to order', 'info');
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.head}>
          <Logo size={32} />
          <Text style={styles.headTitle}>More</Text>
        </View>

        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>G</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>Guest User</Text>
            <Text style={styles.sub}>Ordering at {RESTAURANT_NAME}</Text>
          </View>
          <StatusBadge label="QR SESSION" tone="active" dot={false} />
        </View>

        <View style={styles.block}>
          <SectionHeader title="Orders" />
          {orderRows.map(renderRow)}
        </View>

        <View style={styles.block}>
          <SectionHeader title="Support" />
          {supportRows.map(renderRow)}
          {renderRow({
            icon: 'refresh-outline',
            label: 'Restart QR Session',
            hint: 'Reset',
            onPress: restartSession,
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    padding: 20,
    paddingBottom: 50,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  headTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.4,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    ...Shadow.soft,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
  },
  sub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  block: {
    marginTop: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    ...Shadow.soft,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  rowHint: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
  },
});
