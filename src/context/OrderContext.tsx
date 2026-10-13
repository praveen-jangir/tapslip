import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ImageSourcePropType } from 'react-native';
import type { Dish } from '../data/menu';
import { getDish } from '../data/menu';
import { useToast } from './ToastContext';
import { useBillingConfig } from './AdminContext';
import { adminRepo } from '../services/adminRepo';
import { computeBill, type Bill, type BillConfig } from '../utils/billing';

export type OrderType = 'dine-in' | 'take-away';

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'picked-up'
  /* Set by the owner web admin. */
  | 'cancelled'
  | 'completed';

export interface CartItem {
  key: string;
  dishId: string;
  name: string;
  price: number;
  image: ImageSourcePropType;
  qty: number;
  spice?: string;
  instructions?: string;
}

export interface Order {
  id: string;
  type: OrderType;
  table: number | null;
  items: CartItem[];
  subtotal: number;
  /** Rupees removed by an offer (0 if none). */
  discount: number;
  /** Title of the applied offer, if any. */
  offerTitle?: string | null;
  /** Sum of extra charges (packing/service) applied. */
  charges: number;
  tax: number;
  total: number;
  status: OrderStatus;
  statusTimes: Partial<Record<OrderStatus, number>>;
  placedAt: number;
  additional: boolean;
  pickupCode?: string;
}

export const ORDER_STEPS: Record<OrderType, OrderStatus[]> = {
  'dine-in': ['placed', 'confirmed', 'preparing', 'ready', 'served'],
  'take-away': ['placed', 'confirmed', 'preparing', 'ready', 'picked-up'],
};

export function statusLabel(status: OrderStatus, type: OrderType): string {
  switch (status) {
    case 'placed':
      return 'Order Placed';
    case 'confirmed':
      return 'Order Confirmed';
    case 'preparing':
      return 'Preparing Your Food';
    case 'ready':
      return type === 'dine-in' ? 'Ready to Serve' : 'Ready for Pickup';
    case 'served':
      return 'Served';
    case 'picked-up':
      return 'Picked Up';
    case 'cancelled':
      return 'Cancelled';
    case 'completed':
      return 'Completed';
  }
}

export function isFinalStatus(order: Order): boolean {
  return (
    order.status === 'served' ||
    order.status === 'picked-up' ||
    order.status === 'cancelled' ||
    order.status === 'completed'
  );
}

export function isCompletedOrder(order: Order): boolean {
  return isFinalStatus(order);
}

const NEXT_DELAY_MS: Record<OrderStatus, number> = {
  placed: 4000,
  confirmed: 5000,
  preparing: 10000,
  ready: 12000,
  served: 0,
  'picked-up': 0,
  cancelled: 0,
  completed: 0,
};

function transitionToast(
  order: Order,
  status: OrderStatus
): { message: string; tone: 'success' | 'info' | 'error' } | null {
  switch (status) {
    case 'confirmed':
      return { message: `Order #${order.id} confirmed by the restaurant`, tone: 'success' };
    case 'preparing':
      return { message: `Order #${order.id} is being prepared 🍳`, tone: 'info' };
    case 'ready':
      return order.type === 'dine-in'
        ? { message: 'Your order is ready! It will be served at your table 🎉', tone: 'success' }
        : { message: 'Your order is ready for pickup — show your code at the counter', tone: 'success' };
    case 'served':
      return { message: 'Your order has been served. Enjoy your meal!', tone: 'success' };
    case 'cancelled':
      return { message: `Order #${order.id} was cancelled by the restaurant`, tone: 'error' };
    default:
      return null;
  }
}

function generatePickupCode(): string {
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const digits = Math.floor(10 + Math.random() * 90);
  return `${letter}${digits}`;
}

function cartItemOf(dish: Dish, qty: number, spice?: string, instructions?: string): CartItem {
  return {
    key: `${dish.id}::${spice ?? ''}`,
    dishId: dish.id,
    name: dish.name,
    price: dish.price,
    image: dish.image,
    qty,
    spice,
    instructions,
  };
}

/** Default config used only for the pre-seeded past orders. */
const SEED_BILL_CONFIG: BillConfig = { gstPercent: 5, offers: [], extraCharges: [] };

function total(items: CartItem[], config: BillConfig = SEED_BILL_CONFIG): Bill {
  return computeBill(items, config);
}

function timeAt(dayOffset: number, hour: number, minute: number): number {
  const d = new Date();
  d.setDate(d.getDate() - dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.getTime();
}

function makeSeedOrders(): Order[] {
  const springRolls = getDish('spring-rolls')!;
  const biryani = getDish('chicken-biryani')!;
  const paneer = getDish('paneer-tikka')!;

  const takeawayItems = [
    cartItemOf(springRolls, 1),
    cartItemOf(biryani, 1),
  ];
  const takeawayTotals = total(takeawayItems);
  const takeawayPlaced = timeAt(1, 20, 40);

  const dineInItems = [cartItemOf(paneer, 1)];
  const dineInTotals = total(dineInItems);
  const dineInPlaced = timeAt(3, 13, 15);

  return [
    {
      id: 'TS1228',
      type: 'dine-in',
      table: 5,
      items: dineInItems,
      ...dineInTotals,
      status: 'served',
      statusTimes: {
        placed: dineInPlaced,
        confirmed: dineInPlaced + 60_000,
        preparing: dineInPlaced + 3 * 60_000,
        ready: dineInPlaced + 14 * 60_000,
        served: dineInPlaced + 18 * 60_000,
      },
      placedAt: dineInPlaced,
      additional: false,
    },
    {
      id: 'TS1231',
      type: 'take-away',
      table: null,
      items: takeawayItems,
      ...takeawayTotals,
      status: 'picked-up',
      statusTimes: {
        placed: takeawayPlaced,
        confirmed: takeawayPlaced + 45_000,
        preparing: takeawayPlaced + 3 * 60_000,
        ready: takeawayPlaced + 15 * 60_000,
        'picked-up': takeawayPlaced + 19 * 60_000,
      },
      placedAt: takeawayPlaced,
      additional: false,
      pickupCode: 'B14',
    },
  ];
}

interface OrderContextValue {
  table: number | null;
  orderType: OrderType;
  startSession: (tableNumber: number) => void;
  setOrderType: (type: OrderType) => void;
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  cartDiscount: number;
  cartCharges: number;
  cartOfferTitle: string | null;
  cartTax: number;
  cartTotal: number;
  addToCart: (dish: Dish, qty?: number, spice?: string, instructions?: string) => void;
  changeQty: (key: string, delta: number) => void;
  removeFromCart: (key: string) => void;
  clearCart: () => void;
  orders: Order[];
  pastOrders: Order[];
  latestOrder: Order | null;
  getOrder: (orderNumber: string) => Order | undefined;
  placeOrder: () => Order | null;
  markPickedUp: (orderId: string) => void;
  ratedIds: string[];
  rateOrder: (orderId: string) => void;
}

const OrderContext = createContext<OrderContextValue | null>(null);

export function useOrder(): OrderContextValue {
  const ctx = useContext(OrderContext);
  if (!ctx) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return ctx;
}

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const { show } = useToast();
  const billing = useBillingConfig();
  const [table, setTable] = useState<number | null>(null);
  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pastOrders] = useState<Order[]>(makeSeedOrders);
  const [ratedIds, setRatedIds] = useState<string[]>([]);
  const prevOrdersRef = useRef<Order[]>(orders);
  /* Ids of orders that live in Firestore — the owner web admin controls
     their status, so the demo auto-advance timers must not fight it. */
  const [syncedIds, setSyncedIds] = useState<Set<string>>(new Set());

  const startSession = useCallback((tableNumber: number) => {
    setTable(tableNumber);
  }, []);

  const addToCart = useCallback(
    (dish: Dish, qty: number = 1, spice?: string, instructions?: string) => {
      setCart((prev) => {
        const key = `${dish.id}::${spice ?? ''}`;
        const existing = prev.find((item) => item.key === key);
        if (existing) {
          return prev.map((item) =>
            item.key === key
              ? { ...item, qty: item.qty + qty, instructions: instructions ?? item.instructions }
              : item
          );
        }
        return [...prev, cartItemOf(dish, qty, spice, instructions)];
      });
    },
    []
  );

  const changeQty = useCallback((key: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.key === key ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
  }, []);

  const removeFromCart = useCallback((key: string) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);
  const cartTotals = useMemo(() => computeBill(cart, billing), [cart, billing]);

  const placeOrder = useCallback((): Order | null => {
    if (cart.length === 0) return null;
    const now = Date.now();
    const bill = computeBill(cart, billing);
    const order: Order = {
      id: `TS${1234 + orders.length}`,
      type: orderType,
      table: orderType === 'dine-in' ? table : null,
      items: cart.map((item) => ({ ...item })),
      subtotal: bill.subtotal,
      discount: bill.discount,
      offerTitle: bill.offerTitle,
      charges: bill.charges,
      tax: bill.tax,
      total: bill.total,
      status: 'placed',
      statusTimes: { placed: now },
      placedAt: now,
      additional: orders.length > 0,
      pickupCode: orderType === 'take-away' ? generatePickupCode() : undefined,
    };
    setOrders((prev) => [...prev, order]);
    setCart([]);
    adminRepo.addOrder(order).catch(() => {
      // Offline or Firestore write failure: order stays valid locally.
    });
    return order;
  }, [cart, orders.length, orderType, table, billing]);

  const markPickedUp = useCallback(
    (orderId: string) => {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId && order.status === 'ready'
            ? {
                ...order,
                status: 'picked-up',
                statusTimes: { ...order.statusTimes, 'picked-up': Date.now() },
              }
            : order
        )
      );
      // Let the owner panel know the customer collected the order.
      adminRepo.updateOrderStatus(orderId, 'picked-up').catch(() => {
        /* offline — local state already updated */
      });
      show('Order collected. Enjoy your meal!', 'success');
    },
    [show]
  );

  const rateOrder = useCallback((orderId: string) => {
    setRatedIds((prev) => (prev.includes(orderId) ? prev : [...prev, orderId]));
  }, []);

  /* Live order status from the owner web admin: when the restaurant changes
     status (via the web admin), it lands here and wins over local state. */
  useEffect(() => {
    return adminRepo.subscribeOrders((remote) => {
      setSyncedIds(new Set(remote.map((o) => o.id).filter(Boolean) as string[]));
      setOrders((prev) => {
        let changed = false;
        const next = prev.map((order) => {
          const doc = remote.find((o) => o.id === order.id);
          if (!doc || !doc.status || doc.status === order.status) return order;
          changed = true;
          return {
            ...order,
            status: doc.status,
            statusTimes: { ...order.statusTimes, ...(doc.statusTimes || {}) },
          };
        });
        return changed ? next : prev;
      });
    });
  }, []);

  const getOrder = useCallback(
    (orderNumber: string) => [...orders, ...pastOrders].find((order) => order.id === orderNumber),
    [orders, pastOrders]
  );

  // Demo fallback: auto-progress status for orders that never reached
  // Firestore (offline demo mode). Once an order is synced, the owner web
  // admin drives its status — timers must not fight the restaurant.
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    orders.forEach((order) => {
      if (syncedIds.has(order.id)) return;
      const steps = ORDER_STEPS[order.type];
      const idx = steps.indexOf(order.status);
      if (idx < 0 || idx >= steps.length - 1) return;
      if (order.status === 'ready' && order.type === 'take-away') return;
      const delay = NEXT_DELAY_MS[order.status];
      if (delay <= 0) return;
      const next = steps[idx + 1];
      timers.push(
        setTimeout(() => {
          setOrders((prev) =>
            prev.map((item) =>
              item.id === order.id
                ? {
                    ...item,
                    status: next,
                    statusTimes: { ...item.statusTimes, [next]: Date.now() },
                  }
                : item
            )
          );
        }, delay)
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [orders]);

  // Toast on status transitions.
  useEffect(() => {
    orders.forEach((order) => {
      const prev = prevOrdersRef.current.find((item) => item.id === order.id);
      if (prev && prev.status !== order.status) {
        const toast = transitionToast(order, order.status);
        if (toast) show(toast.message, toast.tone);
      }
    });
    prevOrdersRef.current = orders;
  }, [orders, show]);

  const latestOrder = orders.length > 0 ? orders[orders.length - 1] : null;

  const value = useMemo<OrderContextValue>(
    () => ({
      table,
      orderType,
      startSession,
      setOrderType,
      cart,
      cartCount,
      cartSubtotal: cartTotals.subtotal,
      cartDiscount: cartTotals.discount,
      cartCharges: cartTotals.charges,
      cartOfferTitle: cartTotals.offerTitle,
      cartTax: cartTotals.tax,
      cartTotal: cartTotals.total,
      addToCart,
      changeQty,
      removeFromCart,
      clearCart,
      orders,
      pastOrders,
      latestOrder,
      getOrder,
      placeOrder,
      markPickedUp,
      ratedIds,
      rateOrder,
    }),
    [
      table,
      orderType,
      startSession,
      cart,
      cartCount,
      cartTotals,
      addToCart,
      changeQty,
      removeFromCart,
      clearCart,
      orders,
      pastOrders,
      latestOrder,
      getOrder,
      placeOrder,
      markPickedUp,
      ratedIds,
      rateOrder,
    ]
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}
