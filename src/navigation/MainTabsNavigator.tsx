import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import type { TabParamList } from './types';
import { Colors } from '../theme/colors';
import { MenuHomeScreen } from '../screens/MenuHomeScreen';
import { CartScreen } from '../screens/CartScreen';
import { TrackScreen } from '../screens/TrackScreen';
import { MoreScreen } from '../screens/MoreScreen';
import { useOrder } from '../context/OrderContext';

const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<
  keyof TabParamList,
  { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }
> = {
  Menu: { active: 'restaurant', inactive: 'restaurant-outline' },
  MyOrder: { active: 'bag-handle', inactive: 'bag-handle-outline' },
  Track: { active: 'location', inactive: 'location-outline' },
  More: { active: 'ellipsis-horizontal', inactive: 'ellipsis-horizontal' },
};

export function MainTabsNavigator() {
  const { cartCount } = useOrder();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.tabIconSelected,
        tabBarInactiveTintColor: Colors.tabIcon,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.divider,
          borderTopWidth: 1,
          height: 64,
          paddingTop: 7,
          paddingBottom: 9,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarIcon: ({ color, focused, size }) => {
          const icons = TAB_ICONS[route.name as keyof TabParamList];
          return <Ionicons name={focused ? icons.active : icons.inactive} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Menu" component={MenuHomeScreen} />
      <Tab.Screen
        name="MyOrder"
        component={CartScreen}
        options={{
          title: 'My Order',
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
        }}
      />
      <Tab.Screen name="Track" component={TrackScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}
