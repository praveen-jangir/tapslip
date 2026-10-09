import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { RootStackParamList } from './types';
import { Colors } from '../theme/colors';
import { SplashScreen } from '../screens/SplashScreen';
import { ScanScreen } from '../screens/ScanScreen';
import { OrderTypeScreen } from '../screens/OrderTypeScreen';
import { MainTabsNavigator } from './MainTabsNavigator';
import { CategoryScreen } from '../screens/CategoryScreen';
import { FoodDetailScreen } from '../screens/FoodDetailScreen';
import { OrderPlacedScreen } from '../screens/OrderPlacedScreen';
import { OrderHistoryScreen } from '../screens/OrderHistoryScreen';
import { OrderDetailsScreen } from '../screens/OrderDetailsScreen';
import { FeedbackScreen } from '../screens/FeedbackScreen';
import { SavedDishesScreen } from '../screens/SavedDishesScreen';
import { LanguageScreen } from '../screens/LanguageScreen';
import { HelpScreen } from '../screens/HelpScreen';
import { TermsScreen } from '../screens/TermsScreen';
import { StatesDemoScreen } from '../screens/StatesDemoScreen';

const Stack = createStackNavigator<RootStackParamList>();

export function RootStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: Colors.white },
        headerStyle: { backgroundColor: Colors.white, elevation: 0, shadowOpacity: 0 },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Scan" component={ScanScreen} />
      <Stack.Screen
        name="OrderType"
        component={OrderTypeScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen name="Main" component={MainTabsNavigator} options={{ gestureEnabled: false }} />
      <Stack.Screen name="Category" component={CategoryScreen} />
      <Stack.Screen name="FoodDetail" component={FoodDetailScreen} />
      <Stack.Screen
        name="OrderPlaced"
        component={OrderPlacedScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      <Stack.Screen name="Feedback" component={FeedbackScreen} />
      <Stack.Screen name="SavedDishes" component={SavedDishesScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="StatesDemo" component={StatesDemoScreen} />
    </Stack.Navigator>
  );
}
