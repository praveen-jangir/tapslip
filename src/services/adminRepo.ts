/**
 * adminRepo.ts — real-time Firestore source of truth for the TapSlip customer app.
 *
 * Collections (scoped to one restaurant, RESTAURANT_ID = 'tapslip'):
 *   settings/{rid}/config                name, gstPercent, isOpen, address, currency
 *   menu/{rid}/items/{dishId}            every field except `image`; stores `imageKey`
 *   offers/{rid}/items/{offerId}
 *   charges/{rid}/items/{chargeId}
 *   employees/{rid}/items/{empId}
 *   orders/{rid}/items/{orderId}
 *
 * Data flow:
 *   - Owner edits happen in the standalone Owner Web Admin (web-admin/). Those
 *     writes land in Firestore and are pushed live to the app via onSnapshot.
 *   - The customer app reads only. Placing an order writes to
 *     `orders/{rid}/{orderId}` so the owner's web admin can view + print payslips.
 *
 * Firestore-safety notes:
 *   - `image` is a native `require()` (ImageSourcePropType) and CANNOT be stored in
 *     Firestore. Store `imageKey` (a dish id that matches DISH_IMAGE_PRESETS) and map
 *     it back to `require()` on the app side.
 *   - If a collection is empty (fresh project without a sync), bundled seeds are used
 *     so the app keeps rendering before/without a live sync.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { ImageSourcePropType } from 'react-native';
import type { CategoryName, Dish } from '../data/menu';
import { DISHES, DISH_IMAGE_PRESETS } from '../data/menu';
import type { QueryDocumentSnapshot } from 'firebase/firestore';

/* ── App-facing types (canonical; also used by AdminContext) ─────────────── */

export interface RestaurantSettings {
  name: string;
  gstPercent: number;
  isOpen: boolean;
  address: string;
  currency: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  longDescription: string;
  category: CategoryName;
  veg: boolean;
  spiceOption: boolean;
  popular?: boolean;
  available: boolean;
  /** Key into DISH_IMAGE_PRESETS — stored in Firestore. */
  imageKey: string;
  /** Custom uploaded photo (base64 data URL); empty => fall back to `imageKey`. */
  imageData?: string | null;
  /** Resolved on the app side via imageFor() (or used directly if uploaded). */
  image: ImageSourcePropType;
}

export interface Offer {
  id: string;
  title: string;
  kind: 'percent' | 'flat';
  value: number;
  minOrder: number;
  active: boolean;
}

export interface ExtraCharge {
  id: string;
  label: string;
  kind: 'percent' | 'flat';
  value: number;
  active: boolean;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  phone: string;
  salary: number;
  active: boolean;
}

export interface AdminData {
  settings: RestaurantSettings;
  menu: MenuItem[];
  offers: Offer[];
  extraCharges: ExtraCharge[];
  employees: Employee[];
}

/* ── Firestore document shapes (serialization-safe) ────────────────────── */

export interface FirestoreSettings {
  name: string;
  gstPercent: number;
  isOpen: boolean;
  address: string;
  currency: string;
}

export interface FirestoreMenuItem {
  name: string;
  price: number;
  description: string;
  longDescription: string;
  category: CategoryName;
  veg: boolean;
  spiceOption: boolean;
  popular?: boolean;
  available: boolean;
  imageKey: string;
}

/** Shared restaurant id used for every collection (must match the web admin). */
export const RESTAURANT_ID = 'tapslip';

const SETTINGS_REF = collection(db, 'settings', RESTAURANT_ID, 'config');
const MENU_COLL = collection(doc(db, 'menu', RESTAURANT_ID), 'items');
const OFFERS_COLL = collection(doc(db, 'offers', RESTAURANT_ID), 'items');
const CHARGES_COLL = collection(doc(db, 'charges', RESTAURANT_ID), 'items');
const EMPLOYEES_COLL = collection(doc(db, 'employees', RESTAURANT_ID), 'items');
const ORDERS_COLL = collection(doc(db, 'orders', RESTAURANT_ID), 'items');

const MENU_SORT = query(MENU_COLL, orderBy('name', 'asc'));
const ORDER_SORT = query(ORDERS_COLL, orderBy('placedAt', 'desc'));

function imageFor(key: string): ImageSourcePropType {
  // Bundled dish ids match the image preset keys, so dish.id is a valid imageKey.
  const preset = DISH_IMAGE_PRESETS.find((p) => p.key === key);
  return preset?.source ?? (DISHES.find((dish) => dish.id === key)?.image ?? require('../assets/food/soft-drink.jpg'));
}

function seedSettings(): RestaurantSettings {
  return {
    name: 'Saffron Table',
    gstPercent: 5,
    isOpen: true,
    address: '12 Residency Road, Bengaluru 560025',
    currency: '₹',
  };
}

function idPrefix(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function toAppItem(dish: Dish): MenuItem {
  return {
    id: dish.id,
    name: dish.name,
    price: dish.price,
    description: dish.description,
    longDescription: dish.longDescription,
    category: dish.category,
    veg: dish.veg,
    spiceOption: dish.spiceOption,
    popular: dish.popular,
    available: true,
    imageKey: dish.id,
    image: dish.image,
  };
}


export interface FirestoreOffer {
  title: string;
  kind: 'percent' | 'flat';
  value: number;
  minOrder: number;
  active: boolean;
}

export interface FirestoreExtraCharge {
  label: string;
  kind: 'percent' | 'flat';
  value: number;
  active: boolean;
}

export interface FirestoreEmployee {
  name: string;
  role: string;
  phone: string;
  salary: number;
  active: boolean;
}

export type OrderType = 'dine-in' | 'take-away';
export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'picked-up'
  | 'cancelled'
  | 'completed';

export interface OrderItemInput {
  name: string;
  price: number;
  qty: number;
  spice?: string;
  instructions?: string;
}

export interface FirestoreOrder {
  /** Doc id, duplicated inside the document by both writers. */
  id?: string;
  type: OrderType;
  table: number | null;
  items: OrderItemInput[];
  subtotal: number;
  discount: number;
  offerTitle: string | null;
  charges: number;
  tax: number;
  total: number;
  status: OrderStatus;
  statusTimes: Record<OrderStatus, number>;
  placedAt: number;
  additional: boolean;
  pickupCode: string | null;
  createdAt: Timestamp;
}

/* ── CRUD: menu items ───────────────────────────────────────────────────── */

export async function addMenuItem(dish: Dish): Promise<void> {
  await setDoc(doc(MENU_COLL, dish.id), toFirestoreMenuItem(dish), { merge: true });
}

export async function updateMenuItem(id: string, patch: Partial<FirestoreMenuItem>): Promise<void> {
  if (Object.keys(patch).length === 0) return;
  await updateDoc(doc(MENU_COLL, id), patch);
}

export async function deleteMenuItem(id: string): Promise<void> {
  await deleteDoc(doc(MENU_COLL, id));
}

/* ── CRUD: offers ───────────────────────────────────────────────────────── */

export async function addOffer(offer: Omit<Offer, 'id'>): Promise<void> {
  await setDoc(doc(OFFERS_COLL, idPrefix('offer')), offer, { merge: true });
}

export async function updateOffer(id: string, patch: Partial<Offer>): Promise<void> {
  if (Object.keys(patch).length === 0) return;
  await updateDoc(doc(OFFERS_COLL, id), patch);
}

export async function deleteOffer(id: string): Promise<void> {
  await deleteDoc(doc(OFFERS_COLL, id));
}

/* ── CRUD: extra charges ────────────────────────────────────────────────── */

export async function addCharge(charge: Omit<ExtraCharge, 'id'>): Promise<void> {
  await setDoc(doc(CHARGES_COLL, idPrefix('charge')), charge, { merge: true });
}

export async function updateCharge(id: string, patch: Partial<ExtraCharge>): Promise<void> {
  if (Object.keys(patch).length === 0) return;
  await updateDoc(doc(CHARGES_COLL, id), patch);
}

export async function deleteCharge(id: string): Promise<void> {
  await deleteDoc(doc(CHARGES_COLL, id));
}

/* ── CRUD: employees ────────────────────────────────────────────────────── */

export async function addEmployee(employee: Omit<Employee, 'id'>): Promise<void> {
  await setDoc(doc(EMPLOYEES_COLL, idPrefix('emp')), employee, { merge: true });
}

export async function updateEmployee(id: string, patch: Partial<Employee>): Promise<void> {
  if (Object.keys(patch).length === 0) return;
  await updateDoc(doc(EMPLOYEES_COLL, id), patch);
}

export async function deleteEmployee(id: string): Promise<void> {
  await deleteDoc(doc(EMPLOYEES_COLL, id));
}

function toFirestoreMenuItem(dish: Dish): FirestoreMenuItem {
  return {
    name: dish.name,
    price: dish.price,
    description: dish.description,
    longDescription: dish.longDescription,
    category: dish.category,
    veg: dish.veg,
    spiceOption: dish.spiceOption,
    popular: dish.popular,
    // Bundled Dish has no `available` flag; new items start available.
    available: true,
    imageKey: dish.id,
    imageData: dish.imageData ?? null,
  };
}

/* ── Settings (name/address/currency/GST) — admin driven ────────────────── */

export interface SettingsPatch {
  name?: string;
  gstPercent?: number;
  isOpen?: boolean;
  address?: string;
  currency?: string;
}

export async function getSettings(): Promise<RestaurantSettings> {
  try {
    const snap = await getDocs(SETTINGS_REF);
    if (snap.empty) return seedSettings();
    return snap.docs[0].data() as RestaurantSettings;
  } catch {
    return seedSettings();
  }
}

export async function saveSettings(settings: RestaurantSettings): Promise<void> {
  await setDoc(doc(SETTINGS_REF, 'main'), settings, { merge: true });
}

/* ── Order writes (owned by the owner, visible to the admin) ─────────────── */

export interface OrderInput {
  type: OrderType;
  table: number | null;
  items: OrderItemInput[];
  subtotal: number;
  discount: number;
  offerTitle?: string | null;
  charges: number;
  tax: number;
  total: number;
  status: OrderStatus;
  statusTimes?: Partial<Record<OrderStatus, number>>;
  placedAt: number;
  additional: boolean;
  pickupCode?: string | null;
  id?: string;
}


let _listeners: (() => void)[] = [];
let _data: AdminData | null = null;

/** Single real-time source-of-truth instance. */
export class AdminRepo {
  private initialized = false;

  /** Resolve the initial data and start live listeners. Call once on provider mount. */
  async init(): Promise<AdminData> {
    if (this.initialized) return _data ?? this._seedData();
    this.initialized = true;
    const data = await this._refresh();
    _data = data;
    this._attachListeners();
    this._notify();
    return data;
  }

  /** Synchronous refresh; used as the initial seed before live listeners attach. */
  async refresh(): Promise<AdminData> {
    return this._refresh();
  }

  /** Live listener; returns an unsubscribe function. */
  subscribe(listener: () => void): () => void {
    _listeners.push(listener);
    return () => {
      const i = _listeners.indexOf(listener);
      if (i >= 0) _listeners.splice(i, 1);
    };
  }

  private _notify(): void {
    for (const fn of _listeners) fn();
  }

  private _attachListeners(): void {
    const refresh = () => {
      for (const fn of _listeners) fn();
    };
    const onErr = (err: unknown) => {
      // Offline or rules reject: keep last known data; snapshots may recover.
      console.warn('[adminRepo] listener error', err);
    };

    onSnapshot(SETTINGS_REF, () => refresh(), onErr);
    onSnapshot(MENU_SORT, () => refresh(), onErr);
    onSnapshot(OFFERS_COLL, () => refresh(), onErr);
    onSnapshot(CHARGES_COLL, () => refresh(), onErr);
    onSnapshot(EMPLOYEES_COLL, () => refresh(), onErr);
  }

  private static _now(): number {
    return Date.now();
  }

  private async _refresh(): Promise<AdminData> {
    try {
      const [settingsSnap, menuQuery, offersQuery, chargesQuery, employeesQuery] = await Promise.all([
        getDocs(SETTINGS_REF),
        getDocs(MENU_SORT),
        getDocs(OFFERS_COLL),
        getDocs(CHARGES_COLL),
        getDocs(EMPLOYEES_COLL),
      ]);
      const settings = settingsSnap.docs.length > 0
        ? (settingsSnap.docs[0].data() as FirestoreSettings)
        : seedSettings();
      const menuItems = menuQuery.docs.map((d) => this._toAppMenuItem(d));
      const offerDocs = offersQuery.docs.map((d) => ({ id: d.id, ...d.data() })) as Offer[];
      const chargeDocs = chargesQuery.docs.map((d) => ({ id: d.id, ...d.data() })) as ExtraCharge[];
      const employeeDocs = employeesQuery.docs.map((d) => ({ id: d.id, ...d.data() })) as Employee[];
      const data: AdminData = { settings, menu: menuItems, offers: offerDocs, extraCharges: chargeDocs, employees: employeeDocs };
      _data = data;
      this._notify();
      return data;
    } catch {
      // Firestore not configured/reachable: fall back to bundled seeds.
      return this._seedData();
    }
  }

  private _seedData(): AdminData {
    return {
      settings: seedSettings(),
      menu: DISHES.map(toAppItem),
      offers: [
        { id: 'offer-1', title: 'Flat ₹50 off over ₹499', kind: 'flat', value: 50, minOrder: 499, active: true },
        { id: 'offer-2', title: '10% off over ₹999', kind: 'percent', value: 10, minOrder: 999, active: false },
      ],
      extraCharges: [
        { id: 'charge-1', label: 'Packing charge', kind: 'flat', value: 20, active: false },
        { id: 'charge-2', label: 'Service charge', kind: 'percent', value: 5, active: false },
      ],
      employees: [
        { id: 'emp-1', name: 'Ravi Kumar', role: 'Chef', phone: '9876543210', salary: 28000, active: true },
        { id: 'emp-2', name: 'Anita Sharma', role: 'Cashier', phone: '9876501234', salary: 18000, active: true },
        { id: 'emp-3', name: 'Imran Ali', role: 'Waiter', phone: '9812345678', salary: 15000, active: true },
        { id: 'emp-4', name: 'Priya Nair', role: 'Manager', phone: '9900112233', salary: 35000, active: false },
      ],
    };
  }

  private _toAppMenuItem(snapshot: QueryDocumentSnapshot): MenuItem {
    const data = snapshot.data() as FirestoreMenuItem;
    return {
      id: snapshot.id,
      name: data.name,
      price: data.price,
      description: data.description,
      longDescription: data.longDescription,
      category: data.category,
      veg: data.veg,
      spiceOption: data.spiceOption,
      popular: data.popular,
      available: data.available,
      imageKey: data.imageKey,
      image: data.imageData != null ? data.imageData : imageFor(data.imageKey),
    };
  }

  async addOrder(order: OrderInput): Promise<void> {
    // The owner's admin panel identifies orders by the app's `TS…` id.
    const docId = order.id ?? idPrefix('order');
    const now = Timestamp.now();
    // Firestore-safe item shape: strip native image sources and cart-only fields.
    const items = (order.items || []).map((it) => ({
      name: it.name,
      price: it.price,
      qty: it.qty,
      spice: it.spice ?? null,
      instructions: it.instructions ?? null,
    }));
    await setDoc(doc(ORDERS_COLL, docId), {
      id: docId,
      type: order.type,
      table: order.table ?? null,
      items,
      subtotal: order.subtotal,
      discount: order.discount,
      offerTitle: order.offerTitle ?? null,
      charges: order.charges,
      tax: order.tax,
      total: order.total,
      status: 'placed',
      statusTimes: { placed: now.toMillis() },
      placedAt: now.toMillis(),
      additional: order.additional ?? (order.id ? false : true),
      pickupCode: order.pickupCode ?? null,
      createdAt: now,
    });
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    const ref = doc(ORDERS_COLL, orderId);
    await updateDoc(ref, { status, [`statusTimes.${status}`]: Timestamp.now().toMillis() });
  }

  /**
   * Live order-status stream. The owner web admin advances/cancels orders;
   * this pushes those changes to the customer app's tracking screen.
   * Returns an unsubscribe function.
   */
  subscribeOrders(handler: (orders: FirestoreOrder[]) => void): () => void {
    return onSnapshot(
      ORDER_SORT,
      (snap) => handler(snap.docs.map((d) => d.data() as FirestoreOrder)),
      (err) => console.warn('[adminRepo] orders listener error', err)
    );
  }

  async getOrders(): Promise<FirestoreOrder[]> {
    try {
      const snap = await getDocs(ORDER_SORT);
      return snap.docs.map((d) => d.data() as FirestoreOrder);
    } catch {
      return [];
    }
  }

  ordersCollection(): typeof ORDERS_COLL {
    return ORDERS_COLL;
  }

  /** Live value; kept in sync via subscribers whenever Firestore changes. */
  get currentData(): AdminData {
    return _data ?? this._seedData();
  }
}


/* Shared singleton — the app and the owner web admin read/write the same live data. */
export const adminRepo = new AdminRepo();

