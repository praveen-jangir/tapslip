import type { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Menu: undefined;
  MyOrder: undefined;
  Track: undefined;
  More: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Scan: undefined;
  OrderType: undefined;
  Main: NavigatorScreenParams<TabParamList> | undefined;
  Category: { category: string };
  FoodDetail: { dishId: string };
  OrderPlaced: { orderNumber: string };
  OrderHistory: undefined;
  OrderDetails: { orderNumber: string };
  Feedback: { orderNumber?: string };
  SavedDishes: undefined;
  Language: undefined;
  Help: undefined;
  Terms: undefined;
  StatesDemo: undefined;
};
