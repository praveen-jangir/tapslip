/* =========================================================================
   TapSlip · Owner Web Admin  (dependency-free, works by opening index.html)
   Data is persisted to localStorage under the "tapslip.admin" key.
   ========================================================================= */
'use strict';

/* ------------------------- Storage + state ------------------------- */
/* ---------------------------------------------------------------------------
 * Firebase + live Firestore sync (replaces the old localStorage store).
 * The Firebase compat SDK (firebase-app-compat + firebase-firestore-compat) is
 * loaded in index.html before this script, so `firebase` is a global here.
 * --------------------------------------------------------------------------- */
const OWNER_PIN = '1234';

/* Public web config — Firestore Rules (not this key) are the security boundary.
   This matches the mobile app's RESTAURANT_ID = 'tapslip'. */
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyAS3Bx5SmVOrFKiwMff7420zjv_04Y3xjA',
  authDomain: 'tapslip-40bd4.firebaseapp.com',
  projectId: 'tapslip-40bd4',
  storageBucket: 'tapslip-40bd4.firebasestorage.app',
  messagingSenderId: '781979882943',
  appId: '1:781979882943:web:7a70db618919fd140f3d0a',
  measurementId: 'G-GMK2N9S953',
};

/* Firebase is optional: if the SDK failed to load (offline / blocked CDN),
   the admin still runs on the built-in demo data below. */
let firestore = null;
if (typeof firebase !== 'undefined') {
  try {
    firestore = firebase.initializeApp(FIREBASE_CONFIG).firestore();
  } catch (err) {
    console.warn('Firebase init failed — running with local demo data.', err);
  }
}

/* Owned collections — same paths the customer app reads from. */
const SETTINGS_REF = firestore ? firestore.collection('settings').doc('tapslip').collection('config') : null;
const MENU_REF = firestore ? firestore.collection('menu/tapslip/items') : null;
const OFFERS_REF = firestore ? firestore.collection('offers/tapslip/items') : null;
const CHARGES_REF = firestore ? firestore.collection('charges/tapslip/items') : null;
const EMPLOYEES_REF = firestore ? firestore.collection('employees/tapslip/items') : null;
const ORDERS_REF = firestore ? firestore.collection('orders/tapslip/items') : null;
const TABLES_REF = firestore ? firestore.collection('tables/tapslip/items') : null;
const CUSTOMERS_REF = firestore ? firestore.collection('customers/tapslip/items') : null;
const INVENTORY_REF = firestore ? firestore.collection('inventory/tapslip/items') : null;

/* Per-collection refs, keyed by the state key they hold. */
const COLLECTION_REFS = {
  menu: MENU_REF,
  offers: OFFERS_REF,
  charges: CHARGES_REF,
  employees: EMPLOYEES_REF,
  orders: ORDERS_REF,
  tables: TABLES_REF,
  customers: CUSTOMERS_REF,
  inventory: INVENTORY_REF,
};


/* Seed data shown until a live Firestore snapshot arrives. Renderers read
   only from `state`, so this is the UI's starting point (and demo fallback). */
const defaultState = () => {
  const now = Date.now();
  return {
    restaurant: {
      name: 'Spice Symphony',
      isOpen: true,
      address: '12 Residency Road, Bengaluru 560025',
      currency: '₹',
      gstin: '29AABCT1332L1Z5',
      pan: 'AABCT1332L',
      legalName: 'Spice Symphony Hospitality LLP',
      stateCode: '29 - Karnataka',
    },
    billing: { gstPercent: 5 },
    ca: {
      name: 'CA Rajesh Sharma & Associates',
      email: 'tax.sharma@gmail.com',
      phone: '9845012345',
      gstin: '29AABCT1332L1Z5',
      notes: 'Monthly GSTR-1 & 3B return audit',
    },
    socials: {
      instagram: { handle: '@spicesymphony.blr', url: 'https://instagram.com/spicesymphony.blr', followers: '4.8K', active: true, showOnSlip: true },
      google: { place: 'Spice Symphony, Residency Road', url: 'https://maps.google.com/?q=Spice+Symphony+Bengaluru', reviewUrl: 'https://g.page/r/spicesymphony/review', rating: 4.8, reviews: 348, active: true, showOnSlip: true },
      facebook: { page: 'Spice Symphony Bengaluru', url: 'https://facebook.com/spicesymphony', followers: '3.2K', active: true, showOnSlip: false },
      youtube: { channel: 'Spice Symphony Kitchen', url: 'https://youtube.com/@spicesymphony', subscribers: '1.2K', active: false, showOnSlip: false },
      whatsapp: { phone: '+91 98000 11111', url: 'https://wa.me/919800011111', message: 'Hello Spice Symphony! I would like to reserve a table / ask about catering.', active: true, showOnSlip: true },
      twitter: { handle: '@spicesymphony', url: 'https://twitter.com/spicesymphony', active: false, showOnSlip: false },
    },
    menu: [
      { id: 'paneer-tikka', name: 'Paneer Tikka', category: 'Starters', price: 280, veg: true, available: true, spiceOption: true, popular: true, imageKey: 'paneer-tikka', description: 'Grilled cottage cheese marinated with spices', longDescription: 'Grilled cottage cheese marinated in yogurt, Indian spices and herbs, served sizzling with mint chutney and onion rings.' },
      { id: 'spring-rolls', name: 'Veg Spring Rolls', category: 'Starters', price: 220, veg: true, available: true, spiceOption: false, popular: true, imageKey: 'spring-rolls', description: 'Crispy rolls filled with fresh vegetables', longDescription: 'Golden crispy rolls stuffed with finely shredded vegetables and noodles, served with a sweet chilli dipping sauce.' },
      { id: 'chicken-wings', name: 'Chicken Wings', category: 'Starters', price: 280, veg: false, available: true, spiceOption: true, popular: false, imageKey: 'chicken-wings', description: 'Spicy & crispy chicken wings', longDescription: 'Juicy chicken wings tossed in our signature spicy glaze, fried to a crisp and finished with a sprinkle of herbs.' },
      { id: 'butter-chicken', name: 'Butter Chicken', category: 'Main Course', price: 340, veg: false, available: true, spiceOption: true, popular: true, imageKey: 'butter-chicken', description: 'Rich & creamy tomato curry with chicken', longDescription: 'Tender tandoori chicken simmered in a silky tomato-butter gravy with cream and kasuri methi. A timeless classic.' },
      { id: 'dal-makhani', name: 'Dal Makhani', category: 'Main Course', price: 220, veg: true, available: true, spiceOption: false, popular: false, imageKey: 'dal-makhani', description: 'Slow-cooked black lentils in creamy gravy', longDescription: 'Whole black lentils slow-cooked overnight with butter, cream and tomatoes for a deep, comforting flavour.' },
      { id: 'masala-dosa', name: 'Masala Dosa', category: 'Main Course', price: 180, veg: true, available: true, spiceOption: false, popular: true, imageKey: 'masala-dosa', description: 'Crispy dosa stuffed with spiced potato', longDescription: 'Fermented rice crepe filled with buttery spiced potato, served with coconut chutney and sambar.' },
      { id: 'chicken-biryani', name: 'Chicken Biryani', category: 'Rice', price: 320, veg: false, available: true, spiceOption: true, popular: true, imageKey: 'chicken-biryani', description: 'Fragrant basmati rice with tender chicken', longDescription: 'Dum-cooked long-grain basmati rice layered with marinated chicken, fried onions and aromatic spices, served with raita.' },
      { id: 'butter-naan', name: 'Butter Naan', category: 'Breads', price: 60, veg: true, available: true, spiceOption: false, popular: false, imageKey: 'butter-naan', description: 'Soft tandoor bread brushed with butter', longDescription: 'Pillowy naan straight from the tandoor, generously brushed with melted butter and a touch of garlic.' },
      { id: 'tandoori-roti', name: 'Tandoori Roti', category: 'Breads', price: 40, veg: true, available: true, spiceOption: false, popular: false, imageKey: 'tandoori-roti', description: 'Whole wheat bread from the tandoor', longDescription: 'Rustic whole wheat roti baked in the clay tandoor until lightly charred and puffed.' },
      { id: 'gulab-jamun', name: 'Gulab Jamun', category: 'Desserts', price: 120, veg: true, available: true, spiceOption: false, popular: true, imageKey: 'gulab-jamun', description: 'Warm milk dumplings in sugar syrup', longDescription: 'Soft khoya dumplings soaked in rose-cardamom sugar syrup, served warm.' },
      { id: 'mojito', name: 'Mojito', category: 'Beverages', price: 180, veg: true, available: true, spiceOption: false, popular: true, imageKey: 'mojito', description: 'Refreshing mint & lime cooler', longDescription: 'Muddled mint and lime with sparkling soda over crushed ice — a perfectly refreshing cooler.' },
      { id: 'soft-drink', name: 'Soft Drink', category: 'Beverages', price: 90, veg: true, available: true, spiceOption: false, popular: false, imageKey: 'soft-drink', description: 'Chilled soft drink of your choice', longDescription: 'Ice-cold chilled soft drink of your choice, served in a glass with ice.' },
    ],
    categories: ['All', 'Starters', 'Main Course', 'Rice', 'Breads', 'Desserts', 'Beverages'],
    offers: [
      { id: 'o1', title: 'Flat ₹50 off', kind: 'flat', value: 50, minOrder: 200, active: true },
      { id: 'o2', title: '10% off above ₹500', kind: 'percent', value: 10, minOrder: 500, active: true },
    ],
    charges: [
      { id: 'c1', label: 'Packing charge', kind: 'flat', value: 20, active: true },
      { id: 'c2', label: 'Service charge', kind: 'percent', value: 5, active: false },
    ],
    employees: [
      { id: 'e1', name: 'Ravi Kumar', role: 'Chef', phone: '98000 11111', shift: 'Morning', active: true },
      { id: 'e2', name: 'Anita Sharma', role: 'Cashier', phone: '98000 22222', shift: 'Evening', active: true },
      { id: 'e3', name: 'Imran Ali', role: 'Delivery', phone: '98000 33333', shift: 'Morning', active: false },
    ],
    /* Demo data — replaced by the live Firestore collections once they have docs. */
    orders: seedOrders(),
    tables: seedTables(now),
    customers: seedCustomers(now),
    inventory: seedInventory(),
  };
};

/* Build a demo order. `daysAgo` 0 uses `ago` (minutes before now) so today's
   list always reads plausibly; older days use hour/min of that day. */
function mkOrder(id, items, status, daysAgo, opts = {}) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = Math.round(subtotal * 0.05);
  let placedAt;
  if (daysAgo === 0) {
    placedAt = Date.now() - (opts.ago == null ? 5 : opts.ago) * 60000;
  } else {
    const base = new Date();
    base.setHours(opts.hour == null ? 12 : opts.hour, opts.min == null ? 0 : opts.min, 0, 0);
    placedAt = base.getTime() - daysAgo * 86400000;
  }
  return {
    id,
    items,
    subtotal,
    discount: 0,
    charges: 0,
    tax,
    total: subtotal + tax,
    status,
    placedAt,
    type: opts.type || 'dine-in',
    table: opts.table == null ? null : opts.table,
  };
}

/* Demo orders spread over the last 7 days so every chart has data.
   Statuses use the mobile app's vocabulary: placed/confirmed/preparing/
   ready/served/picked-up (+ cancelled). */
function seedOrders() {
  return [
    mkOrder('TS1008', [{ name: 'Chicken Biryani', price: 320, qty: 1 }, { name: 'Coke', price: 40, qty: 1 }], 'preparing', 0, { type: 'dine-in', table: 2, ago: 6 }),
    mkOrder('TS1007', [{ name: 'Paneer Butter Masala', price: 260, qty: 1 }, { name: 'Tandoori Roti', price: 40, qty: 2 }], 'confirmed', 0, { type: 'dine-in', table: 4, ago: 12 }),
    mkOrder('TS1006', [{ name: 'Masala Dosa', price: 140, qty: 1 }], 'served', 0, { type: 'dine-in', table: 1, ago: 19 }),
    mkOrder('TS1005', [{ name: 'Chicken Tikka', price: 280, qty: 1 }], 'placed', 0, { type: 'take-away', ago: 27 }),
    mkOrder('TS1004', [{ name: 'Veg Fried Rice', price: 190, qty: 1 }, { name: 'Coke', price: 40, qty: 2 }], 'served', 0, { type: 'dine-in', table: 7, ago: 41 }),
    mkOrder('TS1003', [{ name: 'Chicken Biryani', price: 320, qty: 2 }, { name: 'Gulab Jamun', price: 90, qty: 2 }], 'served', 0, { type: 'online', ago: 63 }),
    mkOrder('TS1002', [{ name: 'Masala Dosa', price: 140, qty: 2 }, { name: 'Tandoori Roti', price: 40, qty: 4 }], 'served', 0, { type: 'dine-in', table: 3, ago: 88 }),
    mkOrder('TS1001', [{ name: 'Paneer Butter Masala', price: 260, qty: 1 }, { name: 'Coke', price: 40, qty: 2 }], 'picked-up', 0, { type: 'take-away', ago: 124 }),
    mkOrder('TS0904', [{ name: 'Chicken Biryani', price: 320, qty: 1 }, { name: 'Gulab Jamun', price: 90, qty: 1 }], 'served', 1, { type: 'dine-in', table: 5, hour: 21, min: 30 }),
    mkOrder('TS0903', [{ name: 'Veg Fried Rice', price: 190, qty: 1 }, { name: 'Paneer Butter Masala', price: 260, qty: 1 }], 'served', 1, { type: 'online', hour: 20, min: 15 }),
    mkOrder('TS0902', [{ name: 'Chicken Tikka', price: 280, qty: 1 }, { name: 'Coke', price: 40, qty: 1 }], 'picked-up', 1, { type: 'take-away', hour: 19, min: 40 }),
    mkOrder('TS0905', [{ name: 'Masala Dosa', price: 140, qty: 2 }, { name: 'Tandoori Roti', price: 40, qty: 4 }], 'served', 1, { type: 'dine-in', table: 2, hour: 12, min: 35 }),
    mkOrder('TS0901', [{ name: 'Masala Dosa', price: 140, qty: 1 }], 'cancelled', 1, { type: 'dine-in', table: 6, hour: 13, min: 20 }),
    mkOrder('TS0802', [{ name: 'Chicken Biryani', price: 320, qty: 2 }, { name: 'Tandoori Roti', price: 40, qty: 4 }], 'served', 2, { type: 'dine-in', table: 2, hour: 21, min: 10 }),
    mkOrder('TS0801', [{ name: 'Paneer Butter Masala', price: 260, qty: 2 }, { name: 'Gulab Jamun', price: 90, qty: 2 }], 'served', 2, { type: 'online', hour: 13, min: 5 }),
    mkOrder('TS0702', [{ name: 'Masala Dosa', price: 140, qty: 3 }, { name: 'Tandoori Roti', price: 40, qty: 4 }], 'served', 3, { type: 'dine-in', table: 4, hour: 20, min: 50 }),
    mkOrder('TS0701', [{ name: 'Chicken Tikka', price: 280, qty: 2 }], 'picked-up', 3, { type: 'take-away', hour: 12, min: 40 }),
    mkOrder('TS0602', [{ name: 'Chicken Biryani', price: 320, qty: 1 }, { name: 'Paneer Butter Masala', price: 260, qty: 1 }], 'served', 4, { type: 'dine-in', table: 1, hour: 21, min: 25 }),
    mkOrder('TS0601', [{ name: 'Veg Fried Rice', price: 190, qty: 1 }], 'cancelled', 4, { type: 'online', hour: 14, min: 10 }),
    mkOrder('TS0502', [{ name: 'Masala Dosa', price: 140, qty: 2 }, { name: 'Gulab Jamun', price: 90, qty: 2 }], 'served', 5, { type: 'dine-in', table: 8, hour: 20, min: 35 }),
    mkOrder('TS0501', [{ name: 'Chicken Tikka', price: 280, qty: 1 }, { name: 'Coke', price: 40, qty: 2 }], 'served', 5, { type: 'online', hour: 13, min: 30 }),
    mkOrder('TS0402', [{ name: 'Chicken Biryani', price: 320, qty: 2 }], 'served', 6, { type: 'dine-in', table: 3, hour: 21, min: 5 }),
    mkOrder('TS0401', [{ name: 'Paneer Butter Masala', price: 260, qty: 1 }, { name: 'Tandoori Roti', price: 40, qty: 2 }], 'picked-up', 6, { type: 'take-away', hour: 12, min: 15 }),
  ];
}

/* Floor plan shown on the dashboard and the Tables page. */
function seedTables(now) {
  return [
    { id: 't1', label: 'T1', seats: 4, status: 'occupied', guests: 2, seatedAt: now - 45 * 60000 },
    { id: 't2', label: 'T2', seats: 4, status: 'occupied', guests: 4, seatedAt: now - 30 * 60000 },
    { id: 't3', label: 'T3', seats: 4, status: 'free', guests: 0, seatedAt: null },
    { id: 't4', label: 'T4', seats: 4, status: 'occupied', guests: 3, seatedAt: now - 70 * 60000 },
    { id: 't5', label: 'T5', seats: 2, status: 'free', guests: 0, seatedAt: null },
    { id: 't6', label: 'T6', seats: 6, status: 'free', guests: 0, seatedAt: null },
    { id: 't7', label: 'T7', seats: 4, status: 'occupied', guests: 2, seatedAt: now - 25 * 60000 },
    { id: 't8', label: 'T8', seats: 4, status: 'free', guests: 0, seatedAt: null },
  ];
}

function seedCustomers(now) {
  return [
    { id: 'cu1', name: 'Aarav Patel', phone: '98200 12345', visits: 12, spent: 8420, lastVisit: now - 3 * 3600000, joinedAt: now - 95 * 86400000 },
    { id: 'cu2', name: 'Diya Sharma', phone: '98200 23456', visits: 5, spent: 3120, lastVisit: now - 86400000, joinedAt: now - 60 * 86400000 },
    { id: 'cu3', name: 'Rohan Verma', phone: '98200 34567', visits: 8, spent: 6100, lastVisit: now - 2 * 86400000, joinedAt: now - 40 * 86400000 },
    { id: 'cu4', name: 'Sneha Iyer', phone: '98200 45678', visits: 1, spent: 320, lastVisit: now - 5 * 3600000, joinedAt: now - 5 * 3600000 },
    { id: 'cu5', name: 'Arjun Nair', phone: '98200 56789', visits: 1, spent: 560, lastVisit: now - 2 * 3600000, joinedAt: now - 2 * 3600000 },
    { id: 'cu6', name: 'Meera Joshi', phone: '98200 67890', visits: 21, spent: 15230, lastVisit: now - 4 * 86400000, joinedAt: now - 200 * 86400000 },
    { id: 'cu7', name: 'Vikram Singh', phone: '98200 78901', visits: 6, spent: 4480, lastVisit: now - 6 * 86400000, joinedAt: now - 80 * 86400000 },
  ];
}

function seedInventory() {
  return [
    { id: 'in1', name: 'Basmati Rice', category: 'Grains', qty: 40, unit: 'kg', min: 15 },
    { id: 'in2', name: 'Paneer', category: 'Dairy', qty: 6, unit: 'kg', min: 8 },
    { id: 'in3', name: 'Chicken', category: 'Meat', qty: 22, unit: 'kg', min: 10 },
    { id: 'in4', name: 'Cooking Oil', category: 'Supplies', qty: 15, unit: 'L', min: 10 },
    { id: 'in5', name: 'Tomatoes', category: 'Veggies', qty: 3, unit: 'kg', min: 5 },
    { id: 'in6', name: 'Coca-Cola Cans', category: 'Beverages', qty: 48, unit: 'pcs', min: 24 },
    { id: 'in7', name: 'Butter', category: 'Dairy', qty: 0, unit: 'kg', min: 4 },
    { id: 'in8', name: 'Naan Bread', category: 'Breads', qty: 30, unit: 'pcs', min: 20 },
  ];
}




/* Live state exposed to every renderer/action in the file. */
const state = { ...defaultState() };

/* Convenience: map a Firestore query snapshot into `state[key]`.
   Keeps the built-in demo data until real documents exist (or until the owner
   has written locally), so a brand-new install still renders something. */
const SYNCED = {};      // key -> a server snapshot has been accepted
const DIRTY = {};       // key -> local edits have been pushed for this key
const SYNCED_IDS = {};  // key -> ids present in the last server snapshot
let settingsDocId = null;

function snapshotToState(snap, key) {
  if (snap.empty && !DIRTY[key] && !SYNCED[key] && state[key] && state[key].length) {
    SYNCED[key] = true;
    SYNCED_IDS[key] = [];
    return; // demo fallback — nothing on the server yet
  }
  SYNCED[key] = true;
  SYNCED_IDS[key] = snap.docs.map((d) => d.id);
  state[key] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/* Pull the restaurant config doc into `state.restaurant` + `state.billing`. */
function applySettings(snap) {
  if (!snap.empty) {
    const doc = snap.docs[0];
    settingsDocId = doc.id;
    const d = doc.data();
    state.restaurant = {
      name: d.name ?? 'Spice Symphony',
      isOpen: d.isOpen ?? true,
      address: d.address ?? state.restaurant.address ?? '',
      currency: d.currency ?? state.restaurant.currency ?? '₹',
    };
    state.billing = { gstPercent: d.gstPercent ?? 5 };
  } else {
    /* Fresh project — remember a stable doc id so the first save can create it. */
    settingsDocId = settingsDocId || 'main';
    state.restaurant = { ...state.restaurant, name: state.restaurant.name || 'Spice Symphony', isOpen: state.restaurant.isOpen !== false };
    state.billing = { gstPercent: state.billing.gstPercent ?? 5 };
  }
  render();
}

/* Subscribe to live reads for every owned collection. Called once on mount. */
function startLiveSync() {
  if (!firestore || listening) return;
  listening = true;

  Object.keys(COLLECTION_REFS).forEach((key) => {
    const ref = COLLECTION_REFS[key];
    if (!ref) return;
    ref.onSnapshot((snap) => {
      snapshotToState(snap, key);
      render();
    });
  });
  if (SETTINGS_REF) SETTINGS_REF.onSnapshot(applySettings);
}

let listening = false;

/* ------------------------- Save + re-render ------------------------- */
const LOCAL_KEY = 'tapslip.admin';
const PERSIST_KEYS = [
  'restaurant', 'billing', 'menu', 'offers', 'charges',
  'employees', 'orders', 'tables', 'customers', 'inventory',
  'ca', 'socials',
];

/* Re-render whatever page is active (called by Firestore snapshots). */
function render() {
  if (!isAuthed()) return;
  route(currentPage);
}

/* Firestore rejects `undefined` values — strip them before writing. */
function toDoc(obj) {
  const out = {};
  Object.keys(obj).forEach((k) => {
    if (obj[k] === undefined) return;
    out[k] = obj[k];
  });
  return out;
}

/* save(key) — always persists locally; pushes to Firestore only for the
   collection that actually changed, and only once that collection has been
   read from the server (so demo seeds never clobber real data). */
function save(key) {
  try {
    const snapshot = {};
    PERSIST_KEYS.forEach((k) => { snapshot[k] = state[k]; });
    localStorage.setItem(LOCAL_KEY, JSON.stringify(snapshot));
  } catch (_) { /* private mode / quota — ignore */ }

  if (key === 'settings') { pushSettings(); return; }
  if (!key) return;
  const ref = COLLECTION_REFS[key];
  if (!ref) return;

  DIRTY[key] = true;
  const items = state[key] || [];
  const live = new Set(items.map((i) => String(i.id)));
  items.forEach((item) => {
    if (item && item.id != null) ref.doc(String(item.id)).set(toDoc(item)).catch(() => {});
  });
  (SYNCED_IDS[key] || []).forEach((id) => {
    if (!live.has(String(id))) ref.doc(String(id)).delete().catch(() => {});
  });
  SYNCED_IDS[key] = items.map((i) => String(i.id));
}

function pushSettings() {
  if (!SETTINGS_REF) return;
  const docId = settingsDocId || 'main';
  settingsDocId = docId;
  SETTINGS_REF.doc(docId).set(
    {
      name: state.restaurant.name,
      isOpen: state.restaurant.isOpen,
      address: state.restaurant.address || '',
      currency: state.restaurant.currency || '₹',
      gstPercent: state.billing.gstPercent,
    },
    { merge: true },
  ).catch(() => {});
}

/* Restore a previous local session's edits (used when offline / no Firestore). */
function hydrateLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    PERSIST_KEYS.forEach((k) => { if (saved[k] != null) state[k] = saved[k]; });
  } catch (_) { /* corrupt JSON — keep defaults */ }
}


/* ------------------------- Helpers ------------------------- */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const money = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const uid = (p) => p + Math.random().toString(36).slice(2, 8);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function downloadBlob(blob, filename = 'download') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ------------------------- Auth ------------------------- */
function isAuthed() {
  return sessionStorage.getItem('tapslip.authed') === '1';
}

$('#loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const val = $('#pinInput').value.trim();
  if (val === OWNER_PIN) {
    sessionStorage.setItem('tapslip.authed', '1');
    $('#loginError').textContent = '';
    $('#pinField').classList.remove('error');
    enterApp();
  } else {
    $('#loginError').textContent = 'Incorrect PIN. Please try again.';
    $('#pinField').classList.add('error');
    $('#pinInput').value = '';
  }
});

$('#logoutBtn').addEventListener('click', () => {
  sessionStorage.removeItem('tapslip.authed');
  $('#appView').classList.remove('authed');
  $('#loginView').style.display = 'flex';
  $('#pinInput').value = '';
});

function enterApp() {
  $('#loginView').style.display = 'none';
  $('#appView').classList.add('authed');
  route('dashboard');
}

/* ------------------------- Router ------------------------- */
const PAGES = {
  dashboard: { title: 'Welcome Back!', sub: () => state.restaurant.name },
  orders: { title: 'Orders & Payslips', sub: 'Review orders, update status and print bills' },
  menu: { title: 'Menu Management', sub: 'Add, edit prices & mark items sold out' },
  tables: { title: 'Tables', sub: 'Live floor status and table layout' },
  customers: { title: 'Customers', sub: 'Your regulars and their visit history' },
  inventory: { title: 'Inventory', sub: 'Stock levels and low-stock alerts' },
  reports: { title: 'Reports & Analytics', sub: 'Sales, orders and customer insights' },
  employees: { title: 'Staff', sub: 'Manage your team, roles and shifts' },
  settings: { title: 'Settings', sub: 'GST, offers, extra charges & store status' },
  finance: { title: 'GST & Finance', sub: 'Download reports in official formats, share with your CA' },
  socials: { title: 'Social Media', sub: 'Manage your online presence across all platforms' },
};

let currentPage = 'dashboard';

const RENDERERS = {
  dashboard: renderDashboard,
  orders: renderOrders,
  menu: renderMenu,
  tables: renderTables,
  customers: renderCustomers,
  inventory: renderInventory,
  reports: renderReports,
  employees: renderEmployees,
  settings: renderSettings,
  finance: renderFinance,
  socials: renderSocials,
};

function route(page) {
  if (!PAGES[page] || !RENDERERS[page]) page = 'dashboard';
  currentPage = page;
  $$('.nav-item').forEach((b) => b.classList.toggle('active', b.dataset.page === page));
  const meta = PAGES[page];
  $('#pageTitle').textContent = meta.title;
  $('#pageSub').textContent = typeof meta.sub === 'function' ? meta.sub() : meta.sub;
  $('#topbarActions').innerHTML = '';
  renderTopbarChrome();
  RENDERERS[page]();
}

$$('.nav-item').forEach((b) => b.addEventListener('click', () => route(b.dataset.page)));
/* In-page navigation: "View All" links, quick actions, sidebar promo. */
document.addEventListener('click', (e) => {
  const go = e.target.closest && e.target.closest('[data-goto]');
  if (go) route(go.dataset.goto);
});


/* ------------------------- Analytics ------------------------- */
function revenue() {
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
  const out = { today: 0, thisMonth: 0, lastMonth: 0, total: 0, todayOrders: 0, totalOrders: 0 };
  state.orders.forEach((o) => {
    if (bucketOf(o.status) !== 'completed') return;
    out.total += o.total;
    out.totalOrders += 1;
    if (o.placedAt >= dayStart) { out.today += o.total; out.todayOrders += 1; }
    if (o.placedAt >= monthStart && o.placedAt < nextMonth) out.thisMonth += o.total;
    else if (o.placedAt >= lastMonthStart && o.placedAt < monthStart) out.lastMonth += o.total;
  });
  return out;
}

/* ------------------------- Dashboard helpers ------------------------- */
const STATUS_BUCKETS = [
  { key: 'completed', label: 'Completed', color: '#22a06b' },
  { key: 'preparing', label: 'Preparing', color: '#f5a524' },
  { key: 'pending', label: 'Pending', color: '#2f6bff' },
  { key: 'cancelled', label: 'Cancelled', color: '#a8adb8' },
];

/* Map every order status the mobile app can produce onto the four buckets. */
function bucketOf(status) {
  const s = String(status || '').toLowerCase();
  if (['completed', 'paid', 'served', 'picked-up'].includes(s)) return 'completed';
  if (['confirmed', 'preparing', 'ready', 'in-progress', 'cooking'].includes(s)) return 'preparing';
  if (['cancelled', 'canceled', 'refunded'].includes(s)) return 'cancelled';
  return 'pending';
}

function startOfDay(offsetDays) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - offsetDays);
  return d.getTime();
}

function lastNDays(n) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const start = startOfDay(i);
    out.push({
      start,
      end: start + 86400000,
      label: new Date(start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    });
  }
  return out;
}

/* Stacked completed revenue per day, split by order channel. */
function revenueSeries(days) {
  return lastNDays(days).map((day) => {
    const parts = { dine: 0, take: 0, online: 0 };
    state.orders.forEach((o) => {
      if (bucketOf(o.status) !== 'completed') return;
      if (o.placedAt < day.start || o.placedAt >= day.end) return;
      const key = o.type === 'take-away' ? 'take' : o.type === 'online' ? 'online' : 'dine';
      parts[key] += o.total;
    });
    return { ...day, ...parts, total: parts.dine + parts.take + parts.online };
  });
}

function statusCounts() {
  const out = { completed: 0, preparing: 0, pending: 0, cancelled: 0 };
  state.orders.forEach((o) => { out[bucketOf(o.status)] += 1; });
  return out;
}

function ordersOn(dayOffset) {
  const start = startOfDay(dayOffset);
  const end = start + 86400000;
  return state.orders.filter((o) => o.placedAt >= start && o.placedAt < end);
}

function revenueOn(dayOffset) {
  return ordersOn(dayOffset)
    .filter((o) => bucketOf(o.status) === 'completed')
    .reduce((s, o) => s + o.total, 0);
}

function trendPct(todayVal, yesterdayVal) {
  if (!yesterdayVal) return null;
  return Math.round(((todayVal - yesterdayVal) / yesterdayVal) * 100);
}

function trendHtml(pct, word) {
  const vs = `<span class="vs">${word || 'vs yesterday'}</span>`;
  if (pct == null) return `<div class="kpi-trend flat">— ${vs}</div>`;
  if (pct === 0) return `<div class="kpi-trend flat">No change ${vs}</div>`;
  const up = pct > 0;
  return `<div class="kpi-trend${up ? '' : ' down'}">${up ? '↑' : '↓'} ${Math.abs(pct)}% ${vs}</div>`;
}

function popularItems(limit) {
  const counts = new Map();
  state.orders.forEach((o) => {
    if (bucketOf(o.status) === 'cancelled') return;
    (o.items || []).forEach((it) => {
      const row = counts.get(it.name) || { name: it.name, orders: 0, qty: 0 };
      row.orders += 1;
      row.qty += it.qty || 1;
      counts.set(it.name, row);
    });
  });
  return [...counts.values()]
    .sort((a, b) => b.orders - a.orders || b.qty - a.qty)
    .slice(0, limit || 5);
}

function emojiFor(name) {
  const s = String(name).toLowerCase();
  if (s.includes('biryani') || s.includes('pulao')) return '🍛';
  if (s.includes('dosa') || s.includes('idli')) return '🥞';
  if (s.includes('roti') || s.includes('naan') || s.includes('bread')) return '🫓';
  if (s.includes('chicken') || s.includes('tikka') || s.includes('kebab')) return '🍗';
  if (s.includes('paneer') || s.includes('masala') || s.includes('curry')) return '🍲';
  if (s.includes('rice') || s.includes('noodle') || s.includes('fried')) return '🍜';
  if (s.includes('gulab') || s.includes('jamun') || s.includes('sweet') || s.includes('dessert')) return '🍮';
  if (s.includes('coke') || s.includes('cola') || s.includes('juice') || s.includes('tea')) return '🥤';
  return '🍽️';
}

function thumbFor(name) {
  const m = state.menu.find((x) => x.name === name);
  if (m && m.image) return `<img class="pop-thumb" src="${esc(m.image)}" alt="" />`;
  return `<span class="pop-thumb">${emojiFor(name)}</span>`;
}

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function fmtElapsed(ms) {
  const mins = Math.max(0, Math.floor(ms / 60000));
  return String(Math.floor(mins / 60)).padStart(2, '0') + ':' + String(mins % 60).padStart(2, '0');
}

function fmtK(v) {
  if (v >= 1000) return Math.round(v / 100) / 10 + 'K';
  return String(Math.round(v));
}

function niceCeil(v) {
  if (v <= 0) return 1000;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  const step = [1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 7.5, 10].find((s) => s * mag >= v) || 10;
  return step * mag;
}

/* Stacked bars: dine-in (orange) bottom, online (green), takeaway (blue) top. */
function stackedBarChart(series) {
  const W = 700, H = 250, padL = 46, padR = 8, padT = 10, padB = 26;
  const max = niceCeil(Math.max(...series.map((d) => d.total), 1));
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const slot = innerW / series.length;
  const barW = Math.min(40, slot * 0.55);
  const y = (v) => padT + innerH - (v / max) * innerH;

  let grid = '';
  for (let i = 0; i <= 4; i++) {
    const yy = y((max / 4) * i);
    grid += `<line class="grid" x1="${padL}" y1="${yy}" x2="${W - padR}" y2="${yy}" />`;
    grid += `<text x="${padL - 8}" y="${yy + 4}" text-anchor="end">${fmtK((max / 4) * i)}</text>`;
  }

  const colors = { dine: '#f5a524', online: '#22a06b', take: '#3b82f6' };
  let bars = '';
  series.forEach((d, i) => {
    const x = padL + slot * i + (slot - barW) / 2;
    let acc = 0;
    ['dine', 'online', 'take'].forEach((k) => {
      if (d[k] <= 0) return;
      const y1 = y(acc);
      const y0 = y(acc + d[k]);
      bars += `<rect x="${x}" y="${y0}" width="${barW}" height="${Math.max(2, y1 - y0)}" fill="${colors[k]}" rx="3" />`;
      acc += d[k];
    });
    bars += `<text x="${x + barW / 2}" y="${H - 6}" text-anchor="middle">${d.label}</text>`;
  });

  return `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Revenue over the last ${series.length} days">${grid}${bars}</svg>`;
}

function donutSvg(counts) {
  const size = 168, r = 61, sw = 22, c = 2 * Math.PI * r;
  const total = STATUS_BUCKETS.reduce((s, b) => s + (counts[b.key] || 0), 0);
  if (!total) return '<div class="chart-empty">No orders yet</div>';
  let off = 0;
  const segs = STATUS_BUCKETS.map((b) => {
    const frac = (counts[b.key] || 0) / total;
    if (frac <= 0) return '';
    const gap = frac > 0.04 ? 3 : 0;
    const len = Math.max(1, frac * c - gap);
    const seg = `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${b.color}" stroke-width="${sw}" stroke-dasharray="${len} ${c - len}" stroke-dashoffset="${-off}" />`;
    off += frac * c;
    return seg;
  }).join('');
  return `<svg viewBox="0 0 ${size} ${size}"><g transform="rotate(-90 ${size / 2} ${size / 2})">${segs}</g></svg>`;
}


/* ------------------------- Dashboard ------------------------- */

function renderDashboard() {
  const body = $('#pageBody');
  body.innerHTML = `
    <div class="dash">
      ${kpiRow()}
      <div class="dash-row row-charts">
        ${revenuePanel()}
        ${orderStatusPanel()}
        ${popularPanel()}
      </div>
      <div class="dash-row row-floor">
        ${tableStatusPanel()}
        ${recentOrdersPanel()}
      </div>
      ${quickActions()}
    </div>
  `;
  bindTableTiles();
}

/* Recent Orders — the latest activity across dine-in / takeaway / online. */
function recentOrdersPanel() {
  const list = [...state.orders].sort((a, b) => b.placedAt - a.placedAt).slice(0, 6);
  return `
    <section class="panel">
      <div class="panel-head">
        <h2>Recent Orders</h2>
        <button class="link-btn" data-goto="orders">View All</button>
      </div>
      ${list.length ? `
      <div class="table-wrap">
        <table class="data recent-table">
          <tbody>
            ${list.map((o) => {
              const bucket = bucketOf(o.status);
              const label = (STATUS_BUCKETS.find((b) => b.key === bucket) || {}).label || 'Pending';
              const isTable = o.table != null && o.table !== '';
              const src = isTable ? `Table T${esc(o.table)}` : o.type === 'take-away' ? 'Takeaway' : 'Online';
              const names = (o.items || []).map((i) => i.name).join(', ');
              return `
                <tr>
                  <td class="oid">#${esc(o.id)}</td>
                  <td class="${isTable ? 'src table-src' : 'src'}">${src}</td>
                  <td class="items" title="${esc(names)}">${esc(names)}</td>
                  <td class="amount">${money(o.total)}</td>
                  <td><span class="st ${bucket}">${label}</span></td>
                  <td class="when">${fmtTime(o.placedAt)}</td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>` : '<div class="empty"><div class="ico">🧾</div><div class="t">No orders yet</div><div class="s">New orders will appear here in real time.</div></div>'}
    </section>`;
}

/* Bottom quick-action cards. */
function quickActions() {
  return `
    <div class="quick-grid">
      <section class="quick menu">
        <div class="quick-head">
          <div class="quick-ico">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v7a3 3 0 0 0 3 3h1a3 3 0 0 0 3-3V2"/><path d="M7.5 2v20"/><path d="M20 15V2a4 4 0 0 0-4 4v6a3 3 0 0 0 3 3h1zm0 0v7"/></svg>
          </div>
          <div class="quick-title">Manage Menu</div>
        </div>
        <p class="quick-text">Add, edit or update your food items, prices and categories.</p>
        <button class="quick-btn" data-goto="menu">Manage Menu <span aria-hidden="true">→</span></button>
      </section>

      <section class="quick qr">
        <div class="quick-head">
          <div class="quick-ico">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M14 14h3v3h-3zM20 14h1M14 20h3M20 17v4"/></svg>
          </div>
          <div class="quick-title">Generate QR Code</div>
        </div>
        <p class="quick-text">Let customers scan and order from their table.</p>
        <button class="quick-btn" data-goto="tables">View QR Code <span aria-hidden="true">→</span></button>
      </section>

      <section class="quick reports">
        <div class="quick-head">
          <div class="quick-ico">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
          </div>
          <div class="quick-title">Reports &amp; Analytics</div>
        </div>
        <p class="quick-text">Detailed reports on sales, orders and customer insights.</p>
        <button class="quick-btn" data-goto="reports">View Reports <span aria-hidden="true">→</span></button>
      </section>
    </div>`;
}

/* Click a floor tile: free an occupied table, or seat guests at a free one. */
function bindTableTiles() {
  $$('#pageBody [data-table-id]').forEach((tile) => {
    tile.addEventListener('click', () => {
      const t = state.tables.find((x) => String(x.id) === tile.dataset.tableId);
      if (!t) return;
      if (t.status === 'occupied') {
        if (!confirm(`Free ${t.label}?`)) return;
        t.status = 'free';
        t.guests = 0;
        t.seatedAt = null;
        toast(`${t.label} is now available`);
      } else {
        const raw = prompt(`How many guests at ${t.label}?`, '2');
        if (raw == null) return;
        const guests = Math.max(1, parseInt(raw, 10) || 1);
        t.status = 'occupied';
        t.guests = guests;
        t.seatedAt = Date.now();
        toast(`${t.label} seated — ${guests} guest${guests > 1 ? 's' : ''}`);
      }
      save('tables');
      route(currentPage);
    });
  });
}


/* Popular Items — top sellers across non-cancelled orders. */
function popularPanel() {
  const items = popularItems(5);
  return `
    <section class="panel">
      <div class="panel-head">
        <h2>Popular Items</h2>
        <button class="link-btn" data-goto="menu">View All</button>
      </div>
      <div class="pop-list">
        ${items.length ? items.map((it) => `
          <div class="pop-row">
            ${thumbFor(it.name)}
            <div style="min-width:0">
              <div class="pop-name">${esc(it.name)}</div>
              <div class="pop-sub">${it.orders} orders</div>
            </div>
          </div>`).join('')
          : '<div class="empty"><div class="ico">🍽️</div><div class="t">No orders yet</div><div class="s">Popular dishes will show up here.</div></div>'}
      </div>
    </section>`;
}

/* Table Status — floor tiles (click a tile to seat / free the table). */
function tableStatusPanel() {
  return `
    <section class="panel">
      <div class="panel-head">
        <h2>Table Status</h2>
        <button class="link-btn" data-goto="tables">View Layout</button>
      </div>
      <div class="tbl-grid">
        ${state.tables.map((t) => tableTile(t)).join('')}
      </div>
    </section>`;
}

function tableTile(t) {
  if (t.status === 'occupied') {
    return `
      <div class="tbl-tile busy" data-table-id="${esc(t.id)}" title="Click to free ${esc(t.label)}">
        <div class="t-id">${esc(t.label)}</div>
        <div class="t-state">Occupied</div>
        <div class="t-meta">${t.guests || 1} Guest${(t.guests || 1) > 1 ? 's' : ''}</div>
        <div class="t-meta" data-since="${t.seatedAt || Date.now()}">${fmtElapsed(Date.now() - (t.seatedAt || Date.now()))}</div>
      </div>`;
  }
  return `
    <div class="tbl-tile free" data-table-id="${esc(t.id)}" title="Click to seat guests at ${esc(t.label)}">
      <div class="t-id">${esc(t.label)}</div>
      <div class="t-state">Available</div>
    </div>`;
}


/* Revenue Overview — stacked bars for the last 7 days. */
function revenuePanel() {
  const series = revenueSeries(7);
  const hasData = series.some((d) => d.total > 0);
  return `
    <section class="panel">
      <div class="panel-head">
        <h2>Revenue Overview</h2>
        <div class="legend">
          <span><i style="background:#f5a524"></i>Dine-in</span>
          <span><i style="background:#3b82f6"></i>Takeaway</span>
          <span><i style="background:#22a06b"></i>Online</span>
        </div>
      </div>
      ${hasData ? stackedBarChart(series) : '<div class="chart-empty">No completed orders yet</div>'}
    </section>`;
}

/* Order Status — donut with the four buckets. */
function orderStatusPanel() {
  const counts = statusCounts();
  const total = counts.completed + counts.preparing + counts.pending + counts.cancelled;
  return `
    <section class="panel">
      <div class="panel-head"><h2>Order Status</h2></div>
      <div class="donut-wrap">
        <div class="donut">
          ${donutSvg(counts)}
          <div class="donut-center"><b>${total}</b><span>Orders</span></div>
        </div>
        <div class="donut-legend">
          ${STATUS_BUCKETS.map((b) => `
            <div class="dl-row">
              <i style="background:${b.color}"></i>
              <span class="name">${b.label}</span>
              <span class="val">${counts[b.key]}</span>
            </div>`).join('')}
        </div>
      </div>
    </section>`;
}


function kpiRow() {
  const todayOrders = ordersOn(0).length;
  const yestOrders = ordersOn(1).length;
  const todayRev = revenueOn(0);
  const yestRev = revenueOn(1);
  const dayStart = startOfDay(0);
  const dayEnd = dayStart + 86400000;
  const yStart = startOfDay(1);
  const newToday = state.customers.filter((c) => c.joinedAt >= dayStart && c.joinedAt < dayEnd).length;
  const newYesterday = state.customers.filter((c) => c.joinedAt >= yStart && c.joinedAt < dayStart).length;
  const occupied = state.tables.filter((t) => t.status === 'occupied').length;
  const free = state.tables.length - occupied;

  return `
    <div class="kpi-grid">
      <div class="kpi">
        <div class="kpi-ico orange">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3h14v18l-2.5-1.7L14 21l-2-1.5L10 21l-2.5-1.7L5 21V3z"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4"/></svg>
        </div>
        <div class="kpi-body">
          <div class="kpi-label">Total Orders</div>
          <div class="kpi-value">${todayOrders}</div>
          ${trendHtml(trendPct(todayOrders, yestOrders))}
        </div>
      </div>
      <div class="kpi">
        <div class="kpi-ico green"><span style="font-size:21px;font-weight:800;line-height:1">₹</span></div>
        <div class="kpi-body">
          <div class="kpi-label">Today's Revenue</div>
          <div class="kpi-value">${money(todayRev)}</div>
          ${trendHtml(trendPct(todayRev, yestRev))}
        </div>
      </div>
      <div class="kpi">
        <div class="kpi-ico blue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <div class="kpi-body">
          <div class="kpi-label">Total Customers</div>
          <div class="kpi-value">${state.customers.length}</div>
          ${trendHtml(trendPct(newToday, newYesterday), 'new vs yesterday')}
        </div>
      </div>
      <div class="kpi">
        <div class="kpi-ico purple">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="4" rx="1.5"/><path d="M5.5 9v10M18.5 9v10M12 9v4"/></svg>
        </div>
        <div class="kpi-body">
          <div class="kpi-label">Active Tables</div>
          <div class="kpi-value">${occupied} / ${state.tables.length}</div>
          <div class="kpi-trend flat">${free} available</div>
        </div>
      </div>
    </div>`;
}


/* ------------------------- Menu ------------------------- */
function renderMenu() {
  $('#topbarActions').innerHTML = `<button class="btn btn-primary" id="addMenuBtn">＋ Add Item</button>`;
  const body = $('#pageBody');
  body.innerHTML = `
    <div class="card">
      <div class="card-head"><h2>Menu Items</h2><span class="hint">${state.menu.length} items · ${state.menu.filter((m) => !m.available).length} sold out</span></div>
      <div id="menuForm" style="display:none"></div>
      <div class="table-wrap" id="menuTable"></div>
    </div>
  `;
  $('#addMenuBtn').addEventListener('click', () => showMenuForm(null));
  drawMenuTable();
}

function drawMenuTable() {
  const wrap = $('#menuTable');
  if (state.menu.length === 0) {
    wrap.innerHTML = `<div class="empty"><div class="ico">🍽️</div><div class="t">No menu items</div><div class="s">Add your first dish to get started.</div></div>`;
    return;
  }
  wrap.innerHTML = `
    <table class="data">
      <thead><tr><th>Item</th><th>Category</th><th class="num">Price</th><th>Type</th><th>Status</th><th></th></tr></thead>
      <tbody>
        ${state.menu.map((m) => `
          <tr>
            <td><img class="dish-thumb" src="${menuImageSrc(m)}" alt="${esc(m.name)}" /></td>
            <td><div class="row-between"><span style="font-weight:700">${esc(m.name)}</span></div></td>
            <td><span class="pill-cat">${esc(m.category)}</span></td>
            <td class="num money">${money(m.price)}</td>
            <td>${m.veg ? '<span class="badge success">Veg</span>' : '<span class="badge danger">Non-veg</span>'}</td>
            <td>${m.available ? '<span class="badge success">Available</span>' : '<span class="badge muted">Sold out</span>'}</td>
            <td>
              <div class="row-actions">
                <button class="icon-btn" data-edit="${m.id}" title="Edit">✏️</button>
                <button class="icon-btn" data-toggle="${m.id}" title="${m.available ? 'Mark sold out' : 'Mark available'}">${m.available ? '🚫' : '✅'}</button>
                <button class="icon-btn danger" data-del="${m.id}" title="Delete">🗑️</button>
              </div>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;
  wrap.querySelectorAll('[data-edit]').forEach((b) => b.addEventListener('click', () => showMenuForm(state.menu.find((m) => m.id === b.dataset.edit))));
  wrap.querySelectorAll('[data-toggle]').forEach((b) => b.addEventListener('click', () => {
    const m = state.menu.find((x) => x.id === b.dataset.toggle);
    m.available = !m.available;
    save('menu');
    toast(`${m.name} marked ${m.available ? 'available' : 'sold out'}`);
    drawMenuTable();
  }));
  wrap.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => {
    const m = state.menu.find((x) => x.id === b.dataset.del);
    if (confirm(`Delete "${m.name}"?`)) {
      state.menu = state.menu.filter((x) => x.id !== b.dataset.del);
      save('menu');
      toast('Item deleted');
      drawMenuTable();
    }
  }));
}

/* Image presets shared with the app (src/data/menu.ts → DISH_IMAGE_PRESETS).
   The app can only display bundled photos, so the owner picks a preset key. */
const IMAGE_PRESETS = [
  ['paneer-tikka', 'Paneer Tikka'],
  ['spring-rolls', 'Spring Rolls'],
  ['chicken-wings', 'Chicken Wings'],
  ['french-fries', 'French Fries'],
  ['garlic-bread', 'Garlic Bread'],
  ['butter-chicken', 'Butter Chicken'],
  ['dal-makhani', 'Dal Makhani'],
  ['masala-dosa', 'Masala Dosa'],
  ['chicken-biryani', 'Biryani'],
  ['butter-naan', 'Butter Naan'],
  ['tandoori-roti', 'Tandoori Roti'],
  ['gulab-jamun', 'Gulab Jamun'],
  ['mojito', 'Mojito'],
  ['soft-drink', 'Soft Drink'],
];

/* Resolve the URL for an item's photo. A custom upload (imageData) wins;
   otherwise the bundled preset asset is referenced. */
function menuImageSrc(item) {
  if (item.imageData) return item.imageData;
  if (item.imageKey) return `assets/food/${item.imageKey}.jpg`;
  return `assets/food/soft-drink.jpg`;
}

function showMenuForm(item) {
  const form = $('#menuForm');
  const editing = !!item;
  const d = item || { name: '', category: state.categories[1] || '', price: '', veg: true, available: true, spiceOption: false, popular: false, imageKey: IMAGE_PRESETS[0][0], description: '', longDescription: '' };
  let imageData = d.imageData ?? '';
  form.style.display = 'block';
  form.innerHTML = `
    <div class="card" style="box-shadow:none">
      <div class="card-head"><h2>${editing ? 'Edit Item' : 'New Item'}</h2></div>
      <div class="form-grid">
        <div class="field"><label>Name</label><input id="fName" value="${esc(d.name)}" placeholder="Dish name" /></div>
        <div class="field"><label>Category</label>
          <select id="fCat">${state.categories.filter((c) => c !== 'All').map((c) => `<option ${c === d.category ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select>
        </div>
        <div class="field"><label>Price (₹)</label><input id="fPrice" type="number" min="0" value="${d.price}" placeholder="0" /></div>
        <div class="field">
          <label>Photo (shown in the app)</label>
          <div class="img-control">
            <img id="fImagePreview" class="dish-thumb" alt="Selected dish photo" />
            <div class="img-control-actions">
              <label class="btn btn-soft btn-sm">
                Upload photo
                <input id="fImageFile" type="file" accept="image/*" />
              </label>
              <button id="fRemoveImage" class="icon-btn ghost" title="Remove uploaded photo">✕</button>
              <select id="fImageKey">${IMAGE_PRESETS.map(([key, label]) => `<option value="${key}" ${key === (d.imageKey || 'paneer-tikka') ? 'selected' : ''}>${esc(label)}</option>`).join('')}</select>
            </div>
          </div>
        </div>
        <div class="field" style="grid-column:1/-1"><label>Short description</label><input id="fDesc" value="${esc(d.description || '')}" placeholder="One-line description shown on cards" /></div>
        <div class="field" style="grid-column:1/-1"><label>Full description</label><textarea id="fLongDesc" rows="2" placeholder="Longer description for the dish detail page">${esc(d.longDescription || '')}</textarea></div>
      </div>
      <div class="row-between mt-16">
        <div class="row-between" style="gap:18px">
          <label class="toggle-row"><span class="tr-body"><span class="tr-title">Vegetarian</span></span><span class="switch"><input type="checkbox" id="fVeg" ${d.veg ? 'checked' : ''}><span class="track"></span></span></label>
          <label class="toggle-row"><span class="tr-body"><span class="tr-title">Spice choice</span></span><span class="switch"><input type="checkbox" id="fSpice" ${d.spiceOption ? 'checked' : ''}><span class="track"></span></span></label>
          <label class="toggle-row"><span class="tr-body"><span class="tr-title">Popular</span></span><span class="switch"><input type="checkbox" id="fPopular" ${d.popular ? 'checked' : ''}><span class="track"></span></span></label>
          <label class="toggle-row"><span class="tr-body"><span class="tr-title">Available</span></span><span class="switch"><input type="checkbox" id="fAvail" ${d.available !== false ? 'checked' : ''}><span class="track"></span></span></label>
        </div>
        <div class="form-actions">
          <button class="btn btn-soft" id="fCancel">Cancel</button>
          <button class="btn btn-primary" id="fSave">${editing ? 'Save Changes' : 'Add Item'}</button>
        </div>
      </div>
    </div>`;
  $('#fCancel').addEventListener('click', () => { form.style.display = 'none'; });
  $('#fSave').addEventListener('click', () => {
    const name = $('#fName').value.trim();
    const price = parseInt($('#fPrice').value, 10) || 0;
    if (!name) { toast('Please enter a name'); return; }
    const description = $('#fDesc').value.trim();
    const payload = {
      name,
      category: $('#fCat').value,
      price,
      veg: $('#fVeg').checked,
      spiceOption: $('#fSpice').checked,
      popular: $('#fPopular').checked,
      available: $('#fAvail').checked,
      imageKey: $('#fImageKey').value,
      imageData: imageData || null,
      description,
      longDescription: $('#fLongDesc').value.trim() || description,
    };
    if (editing) Object.assign(state.menu.find((m) => m.id === item.id), payload);
    else state.menu.push({ id: uid('m'), ...payload });
    save('menu');
    form.style.display = 'none';
    toast(editing ? 'Item updated — live in the app now' : 'Item added — live in the app now');
    drawMenuTable();
  });

  /* ── Photo upload / removal (custom image stored as base64 data URL) ──── */
  function updatePreview() {
    $('#fImagePreview').src = imageData || menuImageSrc(d);
  }

  const fileInput = $('#fImageFile');
  if (fileInput) {
    fileInput.addEventListener('change', () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      resizeImageFile(file).then((dataUrl) => {
        imageData = dataUrl;
        updatePreview();
        fileInput.value = '';
      });
    });
  }
  $('#fRemoveImage').addEventListener('click', () => {
    imageData = '';
    updatePreview();
  });
  $('#fImageKey').addEventListener('change', () => {
    imageData = '';
    updatePreview();
  });
  updatePreview();

  /* Downscale an uploaded photo (canvas) so Firestore docs stay small. */
  function resizeImageFile(file) {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const MAX = 900;
        let width = img.width;
        let height = img.height;
        if (width > MAX || height > MAX) {
          const scale = Math.min(MAX / width, MAX / height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve('');
      };
      img.src = url;
    });
  }
}




/* ------------------------- Pricing: GST + Offers + Charges ------------------------- */
function renderSettings() {
  const body = $('#pageBody');
  body.innerHTML = `
    <div class="card">
      <div class="card-head"><h2>Restaurant</h2><span class="hint">Shown to customers in the app</span></div>
      <div class="form-grid">
        <div class="field"><label>Restaurant name</label><input id="restName" value="${esc(state.restaurant.name)}" placeholder="Restaurant name" /></div>
        <div class="field"><label>Address</label><input id="restAddress" value="${esc(state.restaurant.address || '')}" placeholder="Street, city, pincode" /></div>
      </div>
      <div class="form-actions"><button class="btn btn-primary" id="saveRest">Save Profile</button></div>
    </div>

    <div class="card">
      <div class="card-head"><h2>GST</h2><span class="hint">Applied to every customer bill</span></div>
      <div class="row-between">
        <div><div style="font-weight:700">GST percentage</div><div class="text-muted" style="font-size:13px">Charged on the post-discount subtotal</div></div>
        <div class="field" style="margin:0;min-width:120px">
          <div class="affix"><input id="gstInput" type="number" min="0" max="28" value="${state.billing.gstPercent}"><span class="unit">%</span></div>
        </div>
      </div>
      <div class="form-actions"><button class="btn btn-primary" id="saveGst">Save GST</button></div>
    </div>

    <div class="card">
      <div class="card-head"><h2>Offers &amp; Discounts</h2>
        <button class="btn btn-primary btn-sm" id="addOfferBtn">＋ Add Offer</button>
      </div>
      <div id="offerForm" style="display:none" class="mb-16"></div>
      <div class="table-wrap" id="offersTable"></div>
    </div>

    <div class="card">
      <div class="card-head"><h2>Extra Charges</h2>
        <button class="btn btn-primary btn-sm" id="addChargeBtn">＋ Add Charge</button>
      </div>
      <div id="chargeForm" style="display:none" class="mb-16"></div>
      <div class="table-wrap" id="chargesTable"></div>
    </div>
  `;

  $('#saveRest').addEventListener('click', () => {
    const name = $('#restName').value.trim();
    if (!name) { toast('Please enter a restaurant name'); return; }
    state.restaurant.name = name;
    state.restaurant.address = $('#restAddress').value.trim();
    save('settings');
    toast('Restaurant profile updated — live in the app');
    $('#pageSub').textContent = name;
  });

  $('#saveGst').addEventListener('click', () => {
    const v = Math.max(0, Math.min(28, parseInt($('#gstInput').value, 10) || 0));
    state.billing.gstPercent = v;
    save('settings');
    toast(`GST set to ${v}%`);
  });

  $('#addOfferBtn').addEventListener('click', () => showOfferForm(null));
  $('#addChargeBtn').addEventListener('click', () => showChargeForm(null));
  drawOffers();
  drawCharges();
}

function offerRule(o) {
  return o.kind === 'percent' ? `${o.value}% off` : `₹${o.value} off`;
}

function drawOffers() {
  const wrap = $('#offersTable');
  if (!state.offers.length) {
    wrap.innerHTML = `<div class="empty"><div class="ico">🏷️</div><div class="t">No offers yet</div><div class="s">Add an offer to reward bigger orders.</div></div>`;
    return;
  }
  wrap.innerHTML = `
    <table class="data">
      <thead><tr><th>Title</th><th>Type</th><th>Value</th><th>Min order</th><th>Status</th><th></th></tr></thead>
      <tbody>
        ${state.offers.map((o) => `
          <tr>
            <td style="font-weight:700">${esc(o.title)}</td>
            <td><span class="pill-cat">${o.kind === 'percent' ? 'Percent' : 'Flat'}</span></td>
            <td class="num">${offerRule(o)}</td>
            <td class="num">${o.minOrder ? money(o.minOrder) : '—'}</td>
            <td>${o.active ? '<span class="badge success">Live</span>' : '<span class="badge muted">Off</span>'}</td>
            <td>
              <div class="row-actions">
                <button class="icon-btn" data-o-toggle="${o.id}" title="Toggle">${o.active ? '🚫' : '✅'}</button>
                <button class="icon-btn" data-o-edit="${o.id}" title="Edit">✏️</button>
                <button class="icon-btn danger" data-o-del="${o.id}" title="Delete">🗑️</button>
              </div>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;
  wrap.querySelectorAll('[data-o-toggle]').forEach((b) => b.addEventListener('click', () => {
    const o = state.offers.find((x) => x.id === b.dataset.oToggle);
    o.active = !o.active; save('offers'); toast(`Offer ${o.active ? 'enabled' : 'disabled'}`); drawOffers();
  }));
  wrap.querySelectorAll('[data-o-edit]').forEach((b) => b.addEventListener('click', () => showOfferForm(state.offers.find((x) => x.id === b.dataset.oEdit))));
  wrap.querySelectorAll('[data-o-del]').forEach((b) => b.addEventListener('click', () => {
    if (confirm('Delete this offer?')) { state.offers = state.offers.filter((x) => x.id !== b.dataset.oDel); save('offers'); toast('Offer deleted'); drawOffers(); }
  }));
}

function drawCharges() {
  const wrap = $('#chargesTable');
  if (!state.charges.length) {
    wrap.innerHTML = `<div class="empty"><div class="ico">💰</div><div class="t">No extra charges</div><div class="s">Add charges like packing or service fee.</div></div>`;
    return;
  }
  wrap.innerHTML = `
    <table class="data">
      <thead><tr><th>Label</th><th>Type</th><th>Value</th><th>Status</th><th></th></tr></thead>
      <tbody>
        ${state.charges.map((c) => `
          <tr>
            <td style="font-weight:700">${esc(c.label)}</td>
            <td><span class="pill-cat">${c.kind === 'percent' ? 'Percent' : 'Flat'}</span></td>
            <td class="num">${c.kind === 'percent' ? c.value + '%' : money(c.value)}</td>
            <td>${c.active ? '<span class="badge success">Active</span>' : '<span class="badge muted">Off</span>'}</td>
            <td>
              <div class="row-actions">
                <button class="icon-btn" data-c-toggle="${c.id}" title="Toggle">${c.active ? '🚫' : '✅'}</button>
                <button class="icon-btn" data-c-edit="${c.id}" title="Edit">✏️</button>
                <button class="icon-btn danger" data-c-del="${c.id}" title="Delete">🗑️</button>
              </div>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;
  wrap.querySelectorAll('[data-c-toggle]').forEach((b) => b.addEventListener('click', () => {
    const c = state.charges.find((x) => x.id === b.dataset.cToggle);
    c.active = !c.active; save('charges'); toast(`Charge ${c.active ? 'enabled' : 'disabled'}`); drawCharges();
  }));
  wrap.querySelectorAll('[data-c-edit]').forEach((b) => b.addEventListener('click', () => showChargeForm(state.charges.find((x) => x.id === b.dataset.cEdit))));
  wrap.querySelectorAll('[data-c-del]').forEach((b) => b.addEventListener('click', () => {
    if (confirm('Delete this charge?')) { state.charges = state.charges.filter((x) => x.id !== b.dataset.cDel); save('charges'); toast('Charge deleted'); drawCharges(); }
  }));
}

function showOfferForm(offer) {
  const form = $('#offerForm');
  const editing = !!offer;
  const d = offer || { title: '', kind: 'flat', value: '', minOrder: '', active: true };
  form.style.display = 'block';
  form.innerHTML = `
    <div class="card" style="box-shadow:none">
      <div class="card-head"><h2>${editing ? 'Edit Offer' : 'New Offer'}</h2></div>
      <div class="form-grid">
        <div class="field"><label>Title</label><input id="oTitle" value="${esc(d.title)}" placeholder="e.g. Flat ₹50 off" /></div>
        <div class="field"><label>Type</label>
          <select id="oKind">
            <option value="flat" ${d.kind === 'flat' ? 'selected' : ''}>Flat ₹</option>
            <option value="percent" ${d.kind === 'percent' ? 'selected' : ''}>Percent %</option>
          </select>
        </div>
        <div class="field"><label>Value</label><div class="affix"><input id="oValue" type="number" min="0" value="${d.value}" placeholder="0"><span class="unit" id="oUnit">${d.kind === 'percent' ? '%' : '₹'}</span></div></div>
        <div class="field"><label>Minimum order (₹)</label><input id="oMin" type="number" min="0" value="${d.minOrder || ''}" placeholder="0" /></div>
      </div>
      <div class="row-between mt-16">
        <label class="toggle-row"><span class="tr-body"><span class="tr-title">Active</span></span><span class="switch"><input type="checkbox" id="oActive" ${d.active ? 'checked' : ''}><span class="track"></span></span></label>
        <div class="form-actions">
          <button class="btn btn-soft" id="oCancel">Cancel</button>
          <button class="btn btn-primary" id="oSave">${editing ? 'Save Changes' : 'Add Offer'}</button>
        </div>
      </div>
    </div>`;
  $('#oKind').addEventListener('change', (e) => { $('#oUnit').textContent = e.target.value === 'percent' ? '%' : '₹'; });
  $('#oCancel').addEventListener('click', () => { form.style.display = 'none'; });
  $('#oSave').addEventListener('click', () => {
    const title = $('#oTitle').value.trim();
    const value = parseInt($('#oValue').value, 10) || 0;
    if (!title || value <= 0) { toast('Enter a title and a value'); return; }
    const payload = { title, kind: $('#oKind').value, value, minOrder: parseInt($('#oMin').value, 10) || 0, active: $('#oActive').checked };
    if (editing) Object.assign(state.offers.find((o) => o.id === offer.id), payload);
    else state.offers.push({ id: uid('o'), ...payload });
    save('offers'); form.style.display = 'none'; toast(editing ? 'Offer updated' : 'Offer added'); drawOffers();
  });
}

function showChargeForm(charge) {
  const form = $('#chargeForm');
  const editing = !!charge;
  const d = charge || { label: '', kind: 'flat', value: '', active: true };
  form.style.display = 'block';
  form.innerHTML = `
    <div class="card" style="box-shadow:none">
      <div class="card-head"><h2>${editing ? 'Edit Charge' : 'New Charge'}</h2></div>
      <div class="form-grid">
        <div class="field"><label>Label</label><input id="cLabel" value="${esc(d.label)}" placeholder="e.g. Packing charge" /></div>
        <div class="field"><label>Type</label>
          <select id="cKind">
            <option value="flat" ${d.kind === 'flat' ? 'selected' : ''}>Flat ₹</option>
            <option value="percent" ${d.kind === 'percent' ? 'selected' : ''}>Percent %</option>
          </select>
        </div>
        <div class="field"><label>Value</label><div class="affix"><input id="cValue" type="number" min="0" value="${d.value}" placeholder="0"><span class="unit" id="cUnit">${d.kind === 'percent' ? '%' : '₹'}</span></div></div>
      </div>
      <div class="row-between mt-16">
        <label class="toggle-row"><span class="tr-body"><span class="tr-title">Active</span></span><span class="switch"><input type="checkbox" id="cActive" ${d.active ? 'checked' : ''}><span class="track"></span></span></label>
        <div class="form-actions">
          <button class="btn btn-soft" id="cCancel">Cancel</button>
          <button class="btn btn-primary" id="cSave">${editing ? 'Save Changes' : 'Add Charge'}</button>
        </div>
      </div>
    </div>`;
  $('#cKind').addEventListener('change', (e) => { $('#cUnit').textContent = e.target.value === 'percent' ? '%' : '₹'; });
  $('#cCancel').addEventListener('click', () => { form.style.display = 'none'; });
  $('#cSave').addEventListener('click', () => {
    const label = $('#cLabel').value.trim();
    const value = parseInt($('#cValue').value, 10) || 0;
    if (!label || value <= 0) { toast('Enter a label and a value'); return; }
    const payload = { label, kind: $('#cKind').value, value, active: $('#cActive').checked };
    if (editing) Object.assign(state.charges.find((c) => c.id === charge.id), payload);
    else state.charges.push({ id: uid('c'), ...payload });
    save('charges'); form.style.display = 'none'; toast(editing ? 'Charge updated' : 'Charge added'); drawCharges();
  });
}


/* ------------------------- Employees ------------------------- */
const SHIFTS = ['Morning', 'Evening', 'Night'];

function renderEmployees() {
  $('#topbarActions').innerHTML = `<button class="btn btn-primary" id="addEmpBtn">＋ Add Employee</button>`;
  const body = $('#pageBody');
  const active = state.employees.filter((e) => e.active).length;
  body.innerHTML = `
    <div class="card">
      <div class="card-head"><h2>Employees</h2><span class="hint">${state.employees.length} staff · ${active} active</span></div>
      <div id="empForm" style="display:none"></div>
      <div class="table-wrap" id="empTable"></div>
    </div>
  `;
  $('#addEmpBtn').addEventListener('click', () => showEmployeeForm(null));
  drawEmployeeTable();
}

function drawEmployeeTable() {
  const wrap = $('#empTable');
  if (state.employees.length === 0) {
    wrap.innerHTML = `<div class="empty"><div class="ico">👥</div><div class="t">No employees yet</div><div class="s">Add your first team member to get started.</div></div>`;
    return;
  }
  wrap.innerHTML = `
    <table class="data">
      <thead><tr><th>Name</th><th>Role</th><th>Phone</th><th>Shift</th><th>Status</th><th></th></tr></thead>
      <tbody>
        ${state.employees.map((e) => `
          <tr>
            <td><span style="font-weight:700">${esc(e.name)}</span></td>
            <td><span class="pill-cat">${esc(e.role)}</span></td>
            <td class="money">${esc(e.phone || '—')}</td>
            <td>${esc(e.shift)}</td>
            <td>${e.active ? '<span class="badge success">Active</span>' : '<span class="badge muted">Off duty</span>'}</td>
            <td>
              <div class="row-actions">
                <button class="icon-btn" data-e-edit="${e.id}" title="Edit">✏️</button>
                <button class="icon-btn" data-e-toggle="${e.id}" title="${e.active ? 'Mark off duty' : 'Mark active'}">${e.active ? '⏸️' : '▶️'}</button>
                <button class="icon-btn danger" data-e-del="${e.id}" title="Delete">🗑️</button>
              </div>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;
  wrap.querySelectorAll('[data-e-edit]').forEach((b) => b.addEventListener('click', () => showEmployeeForm(state.employees.find((x) => x.id === b.dataset.eEdit))));
  wrap.querySelectorAll('[data-e-toggle]').forEach((b) => b.addEventListener('click', () => {
    const e = state.employees.find((x) => x.id === b.dataset.eToggle);
    e.active = !e.active;
    save('employees');
    toast(`${e.name} marked ${e.active ? 'active' : 'off duty'}`);
    drawEmployeeTable();
  }));
  wrap.querySelectorAll('[data-e-del]').forEach((b) => b.addEventListener('click', () => {
    const e = state.employees.find((x) => x.id === b.dataset.eDel);
    if (confirm(`Remove ${e.name}?`)) {
      state.employees = state.employees.filter((x) => x.id !== b.dataset.eDel);
      save('employees');
      toast('Employee removed');
      drawEmployeeTable();
    }
  }));
}

function showEmployeeForm(emp) {
  const form = $('#empForm');
  const editing = !!emp;
  const d = emp || { name: '', role: '', phone: '', shift: SHIFTS[0], active: true };
  form.style.display = 'block';
  form.innerHTML = `
    <div class="card" style="box-shadow:none">
      <div class="card-head"><h2>${editing ? 'Edit Employee' : 'New Employee'}</h2></div>
      <div class="form-grid">
        <div class="field"><label>Full name</label><input id="eName" value="${esc(d.name)}" placeholder="e.g. Ravi Kumar" /></div>
        <div class="field"><label>Role</label><input id="eRole" value="${esc(d.role)}" placeholder="e.g. Chef / Cashier" /></div>
        <div class="field"><label>Phone</label><input id="ePhone" value="${esc(d.phone || '')}" placeholder="e.g. 98000 11111" /></div>
        <div class="field"><label>Shift</label>
          <select id="eShift">${SHIFTS.map((s) => `<option ${s === d.shift ? 'selected' : ''}>${s}</option>`).join('')}</select>
        </div>
      </div>
      <div class="row-between mt-16">
        <label class="toggle-row"><span class="tr-body"><span class="tr-title">Active / On duty</span></span><span class="switch"><input type="checkbox" id="eActive" ${d.active ? 'checked' : ''}><span class="track"></span></span></label>
        <div class="form-actions">
          <button class="btn btn-soft" id="eCancel">Cancel</button>
          <button class="btn btn-primary" id="eSave">${editing ? 'Save Changes' : 'Add Employee'}</button>
        </div>
      </div>
    </div>`;
  $('#eCancel').addEventListener('click', () => { form.style.display = 'none'; });
  $('#eSave').addEventListener('click', () => {
    const name = $('#eName').value.trim();
    if (!name) { toast('Please enter a name'); return; }
    const payload = {
      name,
      role: $('#eRole').value.trim() || 'Staff',
      phone: $('#ePhone').value.trim(),
      shift: $('#eShift').value,
      active: $('#eActive').checked,
    };
    if (editing) Object.assign(state.employees.find((e) => e.id === emp.id), payload);
    else state.employees.push({ id: uid('e'), ...payload });
    save('employees');
    form.style.display = 'none';
    toast(editing ? 'Employee updated' : 'Employee added');
    drawEmployeeTable();
  });
}

/* ------------------------- Orders & Payslips ------------------------- */
function fmtWhen(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ', ' +
    d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function renderOrders() {
  const body = $('#pageBody');
  const counts = statusCounts();
  body.innerHTML = `
    <div class="card mb-16">
      <div class="card-head"><h2>Revenue (completed orders)</h2><span class="hint">${counts.completed} of ${state.orders.length} completed</span></div>
      <div class="stat-grid" id="orderStats"></div>
    </div>
    <div class="card">
      <div class="card-head"><h2>All Orders</h2><span class="hint">Print a bill once an order is completed</span></div>
      <div class="table-wrap" id="ordersTable"></div>
    </div>
  `;
  const r = revenue();
  $('#orderStats').innerHTML = `
    <div class="stat success"><div class="stat-label">📅 Today</div><div class="stat-value">${money(r.today)}</div><div class="cap">${r.todayOrders} orders</div></div>
    <div class="stat"><div class="stat-label">🗓️ This Month</div><div class="stat-value">${money(r.thisMonth)}</div><div class="cap">Calendar month to date</div></div>
    <div class="stat warning"><div class="stat-label">📉 Last Month</div><div class="stat-value">${money(r.lastMonth)}</div><div class="cap">Previous month</div></div>
    <div class="stat"><div class="stat-label">💰 All Time</div><div class="stat-value">${money(r.total)}</div><div class="cap">${r.totalOrders} orders</div></div>
  `;
  drawOrdersTable();
}

function orderSource(o) {
  if (o.table != null && o.table !== '') return `Table T${esc(o.table)}`;
  if (o.type === 'take-away') return 'Takeaway';
  if (o.type === 'online') return 'Online';
  return 'Dine-in';
}

function drawOrdersTable() {
  const wrap = $('#ordersTable');
  if (!state.orders.length) {
    wrap.innerHTML = `<div class="empty"><div class="ico">🧾</div><div class="t">No orders yet</div><div class="s">Completed orders will appear here for bill printing.</div></div>`;
    return;
  }
  /* Status vocabulary the customer app understands (per fulfilment type). */
  const statusesFor = (o) => {
    const done = o.type === 'take-away' || o.type === 'online' ? 'picked-up' : 'served';
    return [
      ['placed', 'Order placed'],
      ['confirmed', 'Confirmed'],
      ['preparing', 'Preparing'],
      ['ready', o.type === 'take-away' || o.type === 'online' ? 'Ready for pickup' : 'Ready to serve'],
      [done, done === 'picked-up' ? 'Picked up' : 'Served'],
    ];
  };
  const list = [...state.orders].sort((a, b) => b.placedAt - a.placedAt);
  wrap.innerHTML = `
    <table class="data">
      <thead><tr><th>Order</th><th>Date</th><th>Source</th><th class="num">Items</th><th class="num">Total</th><th>Status</th><th></th></tr></thead>
      <tbody>
        ${list.map((o) => {
          const bucket = bucketOf(o.status);
          const statuses = statusesFor(o);
          const current = statuses.find(([key]) => key === o.status);
          const label = (STATUS_BUCKETS.find((b) => b.key === bucket) || {}).label || 'Pending';
          return `
          <tr>
            <td style="font-weight:800">#${esc(o.id)}</td>
            <td class="text-muted" style="font-size:13px">${fmtWhen(o.placedAt)}</td>
            <td><span class="pill-cat">${orderSource(o)}</span></td>
            <td class="num">${(o.items || []).reduce((s, i) => s + i.qty, 0)}</td>
            <td class="num money" style="font-weight:800">${money(o.total)}</td>
            <td><span class="st ${bucket}">${label}</span></td>
            <td>
              <div class="row-actions">
                ${bucket === 'cancelled'
                  ? `<button class="btn btn-soft btn-sm" data-print="${o.id}">🖨️ Print</button>`
                  : `<select class="status-select" data-status-for="${esc(o.id)}" title="Update order status — pushes to the customer app live">
                       ${statuses.map(([key, text]) => `<option value="${key}" ${o.status === key || (!current && key === statuses[0][0]) ? 'selected' : ''}>${esc(text)}</option>`).join('')}
                     </select>
                     <button class="btn btn-soft btn-sm" data-print="${o.id}">🖨️ Print</button>
                     <button class="icon-btn danger" data-cancel="${o.id}" title="Cancel order">✕</button>`}
              </div>
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
  wrap.querySelectorAll('[data-print]').forEach((b) => b.addEventListener('click', () => printPayslip(state.orders.find((o) => o.id === b.dataset.print))));
  wrap.querySelectorAll('[data-status-for]').forEach((sel) => sel.addEventListener('change', () => {
    const o = state.orders.find((x) => x.id === sel.dataset.statusFor);
    if (!o || o.status === sel.value) return;
    o.status = sel.value;
    o.statusTimes = { ...(o.statusTimes || {}), [sel.value]: Date.now() };
    save('orders');
    toast(`Order #${o.id} → ${sel.options[sel.selectedIndex].text} (live in the app)`);
    renderOrders();
  }));
  wrap.querySelectorAll('[data-cancel]').forEach((b) => b.addEventListener('click', () => {
    const o = state.orders.find((x) => x.id === b.dataset.cancel);
    if (!confirm(`Cancel order #${o.id}?`)) return;
    o.status = 'cancelled';
    o.statusTimes = { ...(o.statusTimes || {}), cancelled: Date.now() };
    save('orders');
    toast(`Order #${o.id} cancelled`);
    renderOrders();
  }));
}





/* ------------------------- Tables (floor layout) ------------------------- */
function renderTables() {
  $('#topbarActions').innerHTML = `<button class="btn btn-primary" id="addTableBtn">＋ Add Table</button>`;
  const occupied = state.tables.filter((t) => t.status === 'occupied').length;
  const seats = state.tables.reduce((s, t) => s + (t.seats || 0), 0);
  $('#pageBody').innerHTML = `
    <div class="mini-grid">
      <div class="mini accent-orange"><div class="m-label">Total Tables</div><div class="m-value">${state.tables.length}</div><div class="m-sub">${seats} seats in the hall</div></div>
      <div class="mini accent-red"><div class="m-label">Occupied</div><div class="m-value">${occupied}</div><div class="m-sub">guests seated right now</div></div>
      <div class="mini accent-green"><div class="m-label">Available</div><div class="m-value">${state.tables.length - occupied}</div><div class="m-sub">ready for walk-ins</div></div>
    </div>

    <div class="card">
      <div class="card-head"><h2>Floor Layout</h2><span class="hint">Seat guests or free a table with one click</span></div>
      <div class="floor-grid">
        ${state.tables.map((t) => (t.status === 'occupied' ? `
          <div class="floor-card busy">
            <div class="f-id">${esc(t.label)}</div>
            <div class="f-state">Occupied</div>
            <div class="f-meta">${t.guests || 1} guests · ${t.seats || '—'} seats</div>
            <div class="f-meta"><span data-since="${t.seatedAt || Date.now()}">${fmtElapsed(Date.now() - (t.seatedAt || Date.now()))}</span> seated</div>
            <div class="f-actions"><button class="btn btn-soft btn-sm" data-free="${esc(t.id)}">Free table</button></div>
          </div>` : `
          <div class="floor-card free">
            <div class="f-id">${esc(t.label)}</div>
            <div class="f-state">Available</div>
            <div class="f-meta">${t.seats || '—'} seats</div>
            <div class="f-actions">
              <button class="btn btn-primary btn-sm" data-seat="${esc(t.id)}">Seat guests</button>
              <button class="icon-btn danger" data-del-table="${esc(t.id)}" title="Remove table">🗑️</button>
            </div>
          </div>`)).join('')}
      </div>
    </div>

    <div class="card">
      <div class="card-head"><h2>Table QR Codes</h2><span class="hint">Guests scan the code at their table to open the menu</span></div>
      <div class="floor-grid">
        ${state.tables.map((t) => `
          <div class="floor-card" style="background:#fff">
            <div class="f-id">${esc(t.label)}</div>
            <div class="promo-qr" style="margin:10px auto;width:92px;height:92px" data-qr="${esc(t.label)}"></div>
            <button class="btn btn-soft btn-sm" data-copy-qr="${esc(t.label)}">Copy order link</button>
          </div>`).join('')}
      </div>
    </div>
  `;

  $('#addTableBtn').addEventListener('click', () => {
    const label = prompt('Table label (e.g. T9):', 'T' + (state.tables.length + 1));
    if (!label) return;
    const seatsRaw = prompt('How many seats?', '4');
    if (seatsRaw == null) return;
    state.tables.push({
      id: uid('t'),
      label: label.trim(),
      seats: Math.max(1, parseInt(seatsRaw, 10) || 4),
      status: 'free',
      guests: 0,
      seatedAt: null,
    });
    save('tables');
    toast('Table added');
    renderTables();
  });

  $$('#pageBody [data-seat]').forEach((b) => b.addEventListener('click', () => seatAt(b.dataset.seat)));
  $$('#pageBody [data-free]').forEach((b) => b.addEventListener('click', () => freeTable(b.dataset.free, true)));
  $$('#pageBody [data-del-table]').forEach((b) => b.addEventListener('click', () => {
    const t = state.tables.find((x) => String(x.id) === b.dataset.delTable);
    if (!t || !confirm(`Remove ${t.label}?`)) return;
    state.tables = state.tables.filter((x) => String(x.id) !== b.dataset.delTable);
    save('tables');
    toast('Table removed');
    renderTables();
  }));
  $$('#pageBody [data-copy-qr]').forEach((b) => b.addEventListener('click', () => {
    const link = `${location.origin}/?table=${encodeURIComponent(b.dataset.copyQr)}`;
    if (navigator.clipboard) navigator.clipboard.writeText(link).catch(() => {});
    toast(`Order link for ${b.dataset.copyQr} copied`);
  }));
  $$('#pageBody [data-qr]').forEach((el) => { el.innerHTML = fakeQrSvg(el.dataset.qr); });
}

function seatAt(tableId) {
  const t = state.tables.find((x) => String(x.id) === String(tableId));
  if (!t) return;
  const raw = prompt(`How many guests at ${t.label}?`, '2');
  if (raw == null) return;
  t.guests = Math.max(1, parseInt(raw, 10) || 1);
  t.status = 'occupied';
  t.seatedAt = Date.now();
  save('tables');
  toast(`${t.label} seated — ${t.guests} guests`);
  route(currentPage);
}

function freeTable(tableId, ask) {
  const t = state.tables.find((x) => String(x.id) === String(tableId));
  if (!t) return;
  if (ask && !confirm(`Free ${t.label}?`)) return;
  t.status = 'free';
  t.guests = 0;
  t.seatedAt = null;
  save('tables');
  toast(`${t.label} is now available`);
  route(currentPage);
}

/* ------------------------- Customers ------------------------- */
function renderCustomers() {
  $('#topbarActions').innerHTML = `<button class="btn btn-primary" id="addCustBtn">＋ Add Customer</button>`;
  const dayStart = startOfDay(0);
  const dayEnd = dayStart + 86400000;
  const newToday = state.customers.filter((c) => c.joinedAt >= dayStart && c.joinedAt < dayEnd).length;
  const totalSpent = state.customers.reduce((s, c) => s + (c.spent || 0), 0);
  $('#pageBody').innerHTML = `
    <div class="mini-grid">
      <div class="mini accent-blue"><div class="m-label">Total Customers</div><div class="m-value">${state.customers.length}</div><div class="m-sub">registered members</div></div>
      <div class="mini accent-orange"><div class="m-label">New Today</div><div class="m-value">${newToday}</div><div class="m-sub">joined since midnight</div></div>
      <div class="mini accent-green"><div class="m-label">Lifetime Value</div><div class="m-value">${money(totalSpent)}</div><div class="m-sub">across all customers</div></div>
    </div>
    <div class="card">
      <div class="card-head"><h2>Customers</h2><span class="hint">${state.customers.length} on record</span></div>
      <div class="table-wrap" id="custTable"></div>
    </div>
  `;
  $('#addCustBtn').addEventListener('click', () => {
    const name = prompt('Customer name:');
    if (!name) return;
    const phone = prompt('Phone number:') || '';
    const now = Date.now();
    state.customers.unshift({ id: uid('cu'), name: name.trim(), phone: phone.trim(), visits: 1, spent: 0, lastVisit: now, joinedAt: now });
    save('customers');
    toast('Customer added');
    renderCustomers();
  });
  drawCustomersTable();
}

function drawCustomersTable() {
  const wrap = $('#custTable');
  if (!state.customers.length) {
    wrap.innerHTML = `<div class="empty"><div class="ico">👥</div><div class="t">No customers yet</div><div class="s">Add your first customer to start tracking visits.</div></div>`;
    return;
  }
  wrap.innerHTML = `
    <table class="data">
      <thead><tr><th>Name</th><th>Phone</th><th class="num">Visits</th><th class="num">Total Spent</th><th>Last Visit</th><th></th></tr></thead>
      <tbody>
        ${state.customers.map((c) => `
          <tr>
            <td style="font-weight:700">${esc(c.name)}</td>
            <td class="money text-muted">${esc(c.phone || '—')}</td>
            <td class="num">${c.visits || 0}</td>
            <td class="num money" style="font-weight:800">${money(c.spent || 0)}</td>
            <td class="text-muted" style="font-size:13px">${c.lastVisit ? fmtWhen(c.lastVisit) : '—'}</td>
            <td>
              <div class="row-actions">
                <button class="icon-btn" data-c-edit="${esc(c.id)}" title="Edit">✏️</button>
                <button class="icon-btn danger" data-c-del="${esc(c.id)}" title="Delete">🗑️</button>
              </div>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;
  wrap.querySelectorAll('[data-c-edit]').forEach((b) => b.addEventListener('click', () => {
    const c = state.customers.find((x) => String(x.id) === b.dataset.cEdit);
    if (!c) return;
    const name = prompt('Name:', c.name);
    if (name == null) return;
    const phone = prompt('Phone:', c.phone || '');
    if (phone == null) return;
    c.name = name.trim() || c.name;
    c.phone = phone.trim();
    save('customers');
    toast('Customer updated');
    drawCustomersTable();
  }));
  wrap.querySelectorAll('[data-c-del]').forEach((b) => b.addEventListener('click', () => {
    const c = state.customers.find((x) => String(x.id) === b.dataset.cDel);
    if (!c || !confirm(`Delete ${c.name}?`)) return;
    state.customers = state.customers.filter((x) => String(x.id) !== b.dataset.cDel);
    save('customers');
    toast('Customer deleted');
    renderCustomers();
  }));
}

/* ------------------------- Inventory ------------------------- */
function stockState(item) {
  const qty = Number(item.qty) || 0;
  const min = Number(item.min) || 0;
  if (qty <= 0) return { key: 'out', label: 'Out of stock', cls: 'danger' };
  if (min > 0 && qty <= min) return { key: 'low', label: 'Low stock', cls: 'warning' };
  return { key: 'ok', label: 'In stock', cls: 'success' };
}

function renderInventory() {
  $('#topbarActions').innerHTML = `<button class="btn btn-primary" id="addStockBtn">＋ Add Item</button>`;
  const low = state.inventory.filter((i) => stockState(i).key === 'low').length;
  const out = state.inventory.filter((i) => stockState(i).key === 'out').length;
  $('#pageBody').innerHTML = `
    <div class="mini-grid">
      <div class="mini accent-orange"><div class="m-label">Tracked Items</div><div class="m-value">${state.inventory.length}</div><div class="m-sub">ingredients &amp; supplies</div></div>
      <div class="mini accent-red"><div class="m-label">Low Stock</div><div class="m-value">${low}</div><div class="m-sub">at or below reorder level</div></div>
      <div class="mini accent-red"><div class="m-label">Out of Stock</div><div class="m-value">${out}</div><div class="m-sub">needs immediate restock</div></div>
    </div>
    <div class="card">
      <div class="card-head"><h2>Inventory</h2><span class="hint">Use − / + to adjust stock quickly</span></div>
      <div class="table-wrap" id="stockTable"></div>
    </div>
  `;
  $('#addStockBtn').addEventListener('click', () => {
    const name = prompt('Item name (e.g. Basmati Rice):');
    if (!name) return;
    const category = (prompt('Category:', 'Supplies') || 'Supplies').trim();
    const qty = parseInt(prompt('Current quantity:', '10'), 10) || 0;
    const unit = (prompt('Unit (kg / L / pcs):', 'kg') || 'kg').trim();
    const min = parseInt(prompt('Reorder level:', '5'), 10) || 0;
    state.inventory.push({ id: uid('in'), name: name.trim(), category, qty, unit, min });
    save('inventory');
    toast('Inventory item added');
    renderInventory();
  });
  drawInventoryTable();
}

function drawInventoryTable() {
  const wrap = $('#stockTable');
  if (!state.inventory.length) {
    wrap.innerHTML = `<div class="empty"><div class="ico">📦</div><div class="t">No inventory items</div><div class="s">Add ingredients to start tracking stock.</div></div>`;
    return;
  }
  wrap.innerHTML = `
    <table class="data">
      <thead><tr><th>Item</th><th>Category</th><th class="num">Quantity</th><th>Status</th><th></th></tr></thead>
      <tbody>
        ${state.inventory.map((it) => {
          const st = stockState(it);
          return `
          <tr>
            <td style="font-weight:700">${esc(it.name)}</td>
            <td><span class="pill-cat">${esc(it.category || '—')}</span></td>
            <td class="num money" style="font-weight:800">${Number(it.qty) || 0} <span class="text-muted" style="font-weight:600">${esc(it.unit || '')}</span></td>
            <td><span class="badge ${st.cls}">${st.label}</span></td>
            <td>
              <div class="row-actions">
                <button class="icon-btn" data-qty-minus="${esc(it.id)}" title="Decrease">−</button>
                <button class="icon-btn" data-qty-plus="${esc(it.id)}" title="Increase">＋</button>
                <button class="icon-btn" data-i-edit="${esc(it.id)}" title="Edit">✏️</button>
                <button class="icon-btn danger" data-i-del="${esc(it.id)}" title="Delete">🗑️</button>
              </div>
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
  wrap.querySelectorAll('[data-qty-plus]').forEach((b) => b.addEventListener('click', () => {
    const it = state.inventory.find((x) => String(x.id) === b.dataset.qtyPlus);
    it.qty = (Number(it.qty) || 0) + 1;
    save('inventory');
    drawInventoryTable();
  }));
  wrap.querySelectorAll('[data-qty-minus]').forEach((b) => b.addEventListener('click', () => {
    const it = state.inventory.find((x) => String(x.id) === b.dataset.qtyMinus);
    it.qty = Math.max(0, (Number(it.qty) || 0) - 1);
    save('inventory');
    drawInventoryTable();
  }));
  wrap.querySelectorAll('[data-i-edit]').forEach((b) => b.addEventListener('click', () => {
    const it = state.inventory.find((x) => String(x.id) === b.dataset.iEdit);
    if (!it) return;
    const name = prompt('Item name:', it.name);
    if (name == null) return;
    const qty = prompt(`Quantity (${it.unit || 'units'}):`, it.qty);
    if (qty == null) return;
    const min = prompt('Reorder level:', it.min);
    if (min == null) return;
    it.name = name.trim() || it.name;
    it.qty = Math.max(0, parseInt(qty, 10) || 0);
    it.min = Math.max(0, parseInt(min, 10) || 0);
    save('inventory');
    toast('Inventory item updated');
    drawInventoryTable();
  }));
  wrap.querySelectorAll('[data-i-del]').forEach((b) => b.addEventListener('click', () => {
    const it = state.inventory.find((x) => String(x.id) === b.dataset.iDel);
    if (!it || !confirm(`Delete "${it.name}"?`)) return;
    state.inventory = state.inventory.filter((x) => String(x.id) !== b.dataset.iDel);
    save('inventory');
    toast('Inventory item deleted');
    renderInventory();
  }));
}

/* ------------------------- Reports ------------------------- */
function renderReports() {
  const r = revenue();
  const counts = statusCounts();
  const series = revenueSeries(7);
  const completed = state.orders.filter((o) => bucketOf(o.status) === 'completed');
  const avg = completed.length ? Math.round(r.total / completed.length) : 0;
  const best = [...series].sort((a, b) => b.total - a.total)[0];
  const top = popularItems(1)[0];
  const cancelRate = state.orders.length ? Math.round((counts.cancelled / state.orders.length) * 100) : 0;

  const channels = {
    dine: { label: 'Dine-in', color: '#f5a524', v: 0, c: 0 },
    take: { label: 'Takeaway', color: '#3b82f6', v: 0, c: 0 },
    online: { label: 'Online', color: '#22a06b', v: 0, c: 0 },
  };
  completed.forEach((o) => {
    const k = o.type === 'take-away' ? 'take' : o.type === 'online' ? 'online' : 'dine';
    channels[k].v += o.total;
    channels[k].c += 1;
  });
  const chanMax = Math.max(...Object.values(channels).map((c) => c.v), 1);
  const topItems = popularItems(5);
  const itemMax = Math.max(...topItems.map((i) => i.orders), 1);

  $('#pageBody').innerHTML = `
    <div class="mini-grid">
      <div class="mini accent-green"><div class="m-label">Today</div><div class="m-value">${money(r.today)}</div><div class="m-sub">${r.todayOrders} completed orders</div></div>
      <div class="mini"><div class="m-label">This Month</div><div class="m-value">${money(r.thisMonth)}</div><div class="m-sub">calendar month to date</div></div>
      <div class="mini"><div class="m-label">Last Month</div><div class="m-value">${money(r.lastMonth)}</div><div class="m-sub">previous calendar month</div></div>
      <div class="mini accent-orange"><div class="m-label">All Time</div><div class="m-value">${money(r.total)}</div><div class="m-sub">${r.totalOrders} completed orders</div></div>
    </div>

    <div class="card">
      <div class="card-head">
        <h2>Revenue — last 7 days</h2>
        <div class="legend">
          <span><i style="background:#f5a524"></i>Dine-in</span>
          <span><i style="background:#3b82f6"></i>Takeaway</span>
          <span><i style="background:#22a06b"></i>Online</span>
        </div>
      </div>
      ${series.some((d) => d.total > 0) ? stackedBarChart(series) : '<div class="chart-empty">No completed orders yet</div>'}
    </div>

    <div class="split-2">
      <div class="card" style="margin-bottom:0">
        <div class="card-head"><h2>Orders by Channel</h2></div>
        ${Object.values(channels).map((c) => `
          <div class="chan-row">
            <i style="background:${c.color}"></i>
            <span class="chan-name">${c.label}</span>
            <div class="chan-bar"><span style="width:${Math.round((c.v / chanMax) * 100)}%;background:${c.color}"></span></div>
            <span class="chan-val">${money(c.v)}</span>
          </div>`).join('')}
      </div>
      <div class="card" style="margin-bottom:0">
        <div class="card-head"><h2>Order Status</h2></div>
        <div class="donut-wrap">
          <div class="donut">
            ${donutSvg(counts)}
            <div class="donut-center"><b>${state.orders.length}</b><span>Orders</span></div>
          </div>
          <div class="donut-legend">
            ${STATUS_BUCKETS.map((b) => `
              <div class="dl-row">
                <i style="background:${b.color}"></i>
                <span class="name">${b.label}</span>
                <span class="val">${counts[b.key]}</span>
              </div>`).join('')}
          </div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:18px">
      <div class="card-head"><h2>Top Selling Items</h2><button class="link-btn" data-goto="menu">Manage Menu</button></div>
      ${topItems.length ? topItems.map((it) => `
        <div class="chan-row">
          <span class="chan-name" style="min-width:150px">${esc(it.name)}</span>
          <div class="chan-bar"><span style="width:${Math.round((it.orders / itemMax) * 100)}%;background:#f26722"></span></div>
          <span class="chan-val">${it.orders} orders</span>
        </div>`).join('') : '<div class="chart-empty">No orders yet</div>'}
    </div>

    <div class="mini-grid">
      <div class="mini"><div class="m-label">Avg Order Value</div><div class="m-value">${money(avg)}</div><div class="m-sub">completed orders</div></div>
      <div class="mini"><div class="m-label">Best Day (7d)</div><div class="m-value">${best ? best.label : '—'}</div><div class="m-sub">${best ? money(best.total) : 'no data'}</div></div>
      <div class="mini accent-orange"><div class="m-label">Top Item</div><div class="m-value" style="font-size:18px">${top ? esc(top.name) : '—'}</div><div class="m-sub">${top ? top.orders + ' orders' : 'no data'}</div></div>
      <div class="mini accent-red"><div class="m-label">Cancellation Rate</div><div class="m-value">${cancelRate}%</div><div class="m-sub">${counts.cancelled} cancelled</div></div>
    </div>
  `;
}

/* ------------------------- Payslip printing ------------------------- */
function printPayslip(order) {
  const rows = order.items
    .map(
      (i) =>
        `<tr><td>${esc(i.name)}</td><td class="num">${i.qty}</td><td class="num">${money(i.price)}</td><td class="num">${money(i.price * i.qty)}</td></tr>`
    )
    .join('');
  const discountRow = order.discount
    ? `<div class="line"><span>Discount</span><span>- ${money(order.discount)}</span></div>`
    : '';
  const chargesRow = order.charges
    ? `<div class="line"><span>Extra charges</span><span>${money(order.charges)}</span></div>`
    : '';
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Payslip #${esc(order.id)}</title>
    <style>
      *{font-family:'Courier New',monospace;box-sizing:border-box}
      body{margin:0;padding:24px;color:#111;max-width:420px;margin:0 auto}
      h1{font-size:18px;text-align:center;margin:0 0 2px;letter-spacing:1px}
      .sub{text-align:center;font-size:12px;color:#555;margin-bottom:2px}
      .hr{border-top:1px dashed #999;margin:12px 0}
      .meta{font-size:12px;color:#444;display:flex;justify-content:space-between;margin:2px 0}
      table{width:100%;border-collapse:collapse;font-size:13px;margin-top:6px}
      th{text-align:left;border-bottom:1px solid #ddd;padding-bottom:4px;font-size:12px;color:#555}
      td{padding:4px 0;vertical-align:top}
      .num{text-align:right}
      .line{display:flex;justify-content:space-between;padding:3px 0}
      .total{display:flex;justify-content:space-between;font-size:16px;font-weight:bold;border-top:1px solid #111;margin-top:6px;padding-top:8px}
      .thanks{text-align:center;font-size:13px;font-weight:bold;margin-top:14px}
    </style></head>
    <body>
      <h1>${esc(state.restaurant.name.toUpperCase())}</h1>
      <div class="sub">Payment Receipt / Payslip</div>
      <div class="hr"></div>
      <div class="meta"><span>Order #</span><span>${esc(order.id)}</span></div>
      <div class="meta"><span>Date</span><span>${fmtWhen(order.placedAt)}</span></div>
      <div class="meta"><span>Status</span><span>Completed</span></div>
      <div class="hr"></div>
      <table><thead><tr><th>Item</th><th class="num">Qty</th><th class="num">Rate</th><th class="num">Amount</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <div class="hr"></div>
      <div class="bill-lines">
        <div class="line"><span>Subtotal</span><span>${money(order.subtotal)}</span></div>
        ${discountRow}${chargesRow}
        <div class="line"><span>GST</span><span>${money(order.tax)}</span></div>
        <div class="total"><span>TOTAL PAID</span><span>${money(order.total)}</span></div>
      </div>
      <div class="hr"></div>
      <div class="thanks">Thank you! Visit again 🙏</div>
      <div class="sub" style="margin-top:8px">Computer-generated receipt.</div>
    </body></html>`;
  const w = window.open('', '_blank', 'width=460,height=720');
  if (!w) { toast('Please allow pop-ups to print payslips'); return; }
  w.document.write(html);
  w.document.close();
  w.focus();
  w.onload = () => setTimeout(() => w.print(), 250);
}

/* ------------------------- Topbar chrome ------------------------- */
function renderTopbarChrome() {
  const el = $('#dateLabel');
  if (el) el.textContent = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const pill = $('#openToggleBtn');
  if (pill) pill.classList.toggle('closed', !state.restaurant.isOpen);
  const label = $('#openLabel');
  if (label) label.textContent = state.restaurant.isOpen ? 'Open' : 'Closed';
}

$('#openToggleBtn').addEventListener('click', () => {
  state.restaurant.isOpen = !state.restaurant.isOpen;
  save('settings');
  toast(state.restaurant.isOpen ? 'Restaurant is now open' : 'Restaurant marked closed');
  renderTopbarChrome();
});
$('#datePill').addEventListener('click', () => toast(`Today · ${$('#dateLabel').textContent}`));
$('#bellBtn').addEventListener('click', () => toast('No new notifications yet'));
$('#profilePill').addEventListener('click', () => toast('Signed in as Restaurant Owner'));

/* Deterministic decorative QR (placeholder for the real per-table codes). */
function fakeQrSvg(seed) {
  const N = 21;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rand = () => {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
    return ((h >>> 0) % 1000) / 1000;
  };
  const inFinder = (x, y) => (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8);
  let cells = '';
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (inFinder(x, y)) continue;
      if (rand() > 0.52) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
    }
  }
  const finder = (fx, fy) => `
    <rect x="${fx + 0.5}" y="${fy + 0.5}" width="6" height="6" fill="none" stroke="#111" stroke-width="1"/>
    <rect x="${fx + 2}" y="${fy + 2}" width="3" height="3"/>`;
  return `<svg viewBox="0 0 ${N} ${N}" shape-rendering="crispEdges" fill="#111" aria-hidden="true">
    <rect width="${N}" height="${N}" fill="#fff"/>${cells}${finder(0, 0)}${finder(N - 7, 0)}${finder(0, N - 7)}
  </svg>`;
}

/* ------------------------- GST & Finance ------------------------- */
function renderFinance() {
  $('#topbarActions').innerHTML = '';
  const body = $('#pageBody');
  const gst = state.billing.gstPercent || 5;
  const ca = state.ca || {};

  /* Build monthly GST summary from completed orders */
  function buildMonthlyRows(orders) {
    const map = {};
    (orders || []).forEach((o) => {
      if (!['served','picked-up'].includes(o.status) && !String(o.status).includes('completed')) return;
      const d = new Date(o.placedAt || Date.now());
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!map[key]) map[key] = { taxable: 0, gst: 0, total: 0, count: 0 };
      const taxable = Math.round((o.total || 0) / (1 + gst / 100));
      const gstAmt = (o.total || 0) - taxable;
      map[key].taxable += taxable;
      map[key].gst += gstAmt;
      map[key].total += (o.total || 0);
      map[key].count += 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([k, v]) => {
        const [yr, mo] = k.split('-');
        const label = new Date(+yr, +mo - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
        return { label, ...v };
      });
  }

  let period = 'month';
  let rows = [];

  function filteredOrders() {
    const now = Date.now();
    const today = new Date(); today.setHours(0,0,0,0);
    if (period === 'today') return (state.orders||[]).filter(o => o.placedAt >= today.getTime());
    if (period === 'month') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
      return (state.orders||[]).filter(o => o.placedAt >= start);
    }
    return state.orders || [];
  }

  function drawTable() {
    rows = buildMonthlyRows(period === 'all' ? state.orders : filteredOrders());
    const totTaxable = rows.reduce((s,r) => s + r.taxable, 0);
    const totGst = rows.reduce((s,r) => s + r.gst, 0);
    const totTotal = rows.reduce((s,r) => s + r.total, 0);
    const wrap = $('#financeTable');
    if (!rows.length) {
      wrap.innerHTML = `<div class="empty"><div class="ico">🧾</div><div class="t">No completed orders in this period</div><div class="s">Change the period filter above to see data.</div></div>`;
      return;
    }
    wrap.innerHTML = `
      <table class="data tax-table">
        <thead><tr>
          <th>Period</th><th class="num">Orders</th>
          <th class="num">Taxable Amount</th>
          <th class="num">CGST (${gst/2}%)</th>
          <th class="num">SGST (${gst/2}%)</th>
          <th class="num">Total GST</th>
          <th class="num">Gross Total</th>
        </tr></thead>
        <tbody>
          ${rows.map(r => `<tr>
            <td style="font-weight:700">${esc(r.label)}</td>
            <td class="num">${r.count}</td>
            <td class="num money">₹${Math.round(r.taxable).toLocaleString('en-IN')}</td>
            <td class="num money">₹${Math.round(r.gst/2).toLocaleString('en-IN')}</td>
            <td class="num money">₹${Math.round(r.gst/2).toLocaleString('en-IN')}</td>
            <td class="num money" style="font-weight:800">₹${Math.round(r.gst).toLocaleString('en-IN')}</td>
            <td class="num money" style="font-weight:800">₹${Math.round(r.total).toLocaleString('en-IN')}</td>
          </tr>`).join('')}
        </tbody>
        <tfoot><tr>
          <td style="font-weight:800">Total</td>
          <td class="num">${rows.reduce((s,r)=>s+r.count,0)}</td>
          <td class="num money" style="font-weight:800">₹${Math.round(totTaxable).toLocaleString('en-IN')}</td>
          <td class="num money" style="font-weight:800">₹${Math.round(totGst/2).toLocaleString('en-IN')}</td>
          <td class="num money" style="font-weight:800">₹${Math.round(totGst/2).toLocaleString('en-IN')}</td>
          <td class="num money" style="font-weight:800;color:#f26722">₹${Math.round(totGst).toLocaleString('en-IN')}</td>
          <td class="num money" style="font-weight:800;color:#f26722">₹${Math.round(totTotal).toLocaleString('en-IN')}</td>
        </tr></tfoot>
      </table>`;
  }

  body.innerHTML = `
    <div class="card">
      <div class="card-head"><h2>GST Report</h2><span class="hint">${esc(state.restaurant.name || '')} · GSTIN: ${esc(state.restaurant.gstin || 'Not set')}</span></div>
      <div class="finance-toolbar">
        <div class="period-pills">
          <button class="period-pill ${period==='today'?'active':''}" data-p="today">Today</button>
          <button class="period-pill ${period==='month'?'active':''}" data-p="month">This Month</button>
          <button class="period-pill ${period==='all'?'active':''}" data-p="all">All Time</button>
        </div>
        <div class="finance-actions">
          <button class="btn btn-soft" id="dlCsv">⬇ Download CSV</button>
          <button class="btn btn-soft" id="dlPdf">⬇ Download PDF</button>
          <button class="btn btn-primary" id="shareCA">📤 Share with CA</button>
        </div>
      </div>
      <div class="table-wrap" id="financeTable"></div>
    </div>

    <div class="card ca-box">
      <div class="card-head"><h2>CA / Accountant Details</h2><span class="hint">Used when sending reports</span></div>
      <div class="form-grid">
        <div class="field"><label>CA Name / Firm</label><input id="caName" value="${esc(ca.name||'')}" placeholder="e.g. CA Rajesh Sharma" /></div>
        <div class="field"><label>Email</label><input id="caEmail" type="email" value="${esc(ca.email||'')}" placeholder="accountant@example.com" /></div>
        <div class="field"><label>Phone</label><input id="caPhone" value="${esc(ca.phone||'')}" placeholder="98000 11111" /></div>
        <div class="field"><label>GSTIN</label><input id="caGstin" value="${esc(ca.gstin||'')}" placeholder="29AABCT1332L1Z5" /></div>
        <div class="field" style="grid-column:1/-1"><label>Notes</label><input id="caNotes" value="${esc(ca.notes||'')}" placeholder="e.g. Monthly GSTR-1 &amp; 3B audit" /></div>
      </div>
      <div class="form-actions"><button class="btn btn-primary" id="saveCA">Save CA Details</button></div>
    </div>
  `;

  drawTable();

  /* Period pill clicks */
  $$('#pageBody .period-pill').forEach(btn => btn.addEventListener('click', () => {
    period = btn.dataset.p;
    $$('#pageBody .period-pill').forEach(b => b.classList.toggle('active', b.dataset.p === period));
    drawTable();
  }));

  /* CSV download */
  $('#dlCsv').addEventListener('click', () => {
    if (!rows.length) { toast('No data to export'); return; }
    const lines = [
      ['Period','Orders','Taxable Amount','CGST','SGST','Total GST','Gross Total'],
      ...rows.map(r => [r.label, r.count, Math.round(r.taxable), Math.round(r.gst/2), Math.round(r.gst/2), Math.round(r.gst), Math.round(r.total)])
    ].map(row => row.join(',')).join('\n');
    downloadBlob(new Blob([lines], {type:'text/csv'}), 'gst-report.csv');
    toast('CSV downloaded');
  });

  /* PDF download */
  function generatePdf() {
    if (!rows.length) { toast('No data to export'); return null; }
    if (!window.jspdf) { toast('PDF library not loaded'); return null; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const rest = state.restaurant;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('GST Report', 14, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${rest.name || ''} | GSTIN: ${rest.gstin || ''}`, 14, 28);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 34);

    let y = 44;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    const cols = [14, 60, 90, 115, 140, 165];
    const headers = ['Period', 'Taxable', 'CGST', 'SGST', 'Total GST', 'Gross'];
    headers.forEach((h, i) => doc.text(h, cols[i], y));
    y += 6;
    doc.setFont('helvetica', 'normal');
    rows.forEach(r => {
      if (y > 270) { doc.addPage(); y = 20; }
      const vals = [r.label, `₹${Math.round(r.taxable).toLocaleString('en-IN')}`, `₹${Math.round(r.gst/2).toLocaleString('en-IN')}`, `₹${Math.round(r.gst/2).toLocaleString('en-IN')}`, `₹${Math.round(r.gst).toLocaleString('en-IN')}`, `₹${Math.round(r.total).toLocaleString('en-IN')}`];
      vals.forEach((v, i) => doc.text(String(v), cols[i], y));
      y += 6;
    });

    if (ca.name || ca.email) {
      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.text('CA Details', 14, y); y += 6;
      doc.setFont('helvetica', 'normal');
      if (ca.name) { doc.text(`Name: ${ca.name}`, 14, y); y += 5; }
      if (ca.email) { doc.text(`Email: ${ca.email}`, 14, y); y += 5; }
      if (ca.phone) { doc.text(`Phone: ${ca.phone}`, 14, y); y += 5; }
    }
    return doc;
  }

  $('#dlPdf').addEventListener('click', () => {
    const doc = generatePdf();
    if (!doc) return;
    downloadBlob(doc.output('blob'), 'gst-report.pdf');
    toast('PDF downloaded');
  });

  $('#shareCA').addEventListener('click', () => {
    const doc = generatePdf();
    if (!doc) return;
    downloadBlob(doc.output('blob'), 'gst-report.pdf');
    toast('PDF ready — attach it to your email to the CA');
  });

  /* Save CA */
  $('#saveCA').addEventListener('click', () => {
    state.ca = {
      name: $('#caName').value.trim(),
      email: $('#caEmail').value.trim(),
      phone: $('#caPhone').value.trim(),
      gstin: $('#caGstin').value.trim(),
      notes: $('#caNotes').value.trim(),
    };
    save('ca');
    toast('CA details saved');
  });
}

/* ------------------------- Social Media ------------------------- */
function renderSocials() {
  $('#topbarActions').innerHTML = '';
  const body = $('#pageBody');
  const s = state.socials || {};

  const PLATFORMS = [
    { key: 'instagram', icon: '📷', label: 'Instagram',  color: '#e1306c',
      fields: [{ id: 'handle', label: 'Handle', ph: '@yourrestaurant' }, { id: 'url', label: 'Profile URL', ph: 'https://instagram.com/...' }, { id: 'followers', label: 'Followers', ph: '1.2K' }] },
    { key: 'google',    icon: '🗺️', label: 'Google Maps', color: '#4285f4',
      fields: [{ id: 'place', label: 'Place Name', ph: 'Your Restaurant, City' }, { id: 'url', label: 'Maps URL', ph: 'https://maps.google.com/...' }, { id: 'reviewUrl', label: 'Review Link', ph: 'https://g.page/r/...' }, { id: 'rating', label: 'Rating', ph: '4.5' }, { id: 'reviews', label: 'Reviews', ph: '200' }] },
    { key: 'facebook',  icon: '📘', label: 'Facebook',   color: '#1877f2',
      fields: [{ id: 'page', label: 'Page Name', ph: 'Your Restaurant' }, { id: 'url', label: 'Page URL', ph: 'https://facebook.com/...' }, { id: 'followers', label: 'Followers', ph: '3K' }] },
    { key: 'youtube',   icon: '▶️', label: 'YouTube',    color: '#ff0000',
      fields: [{ id: 'channel', label: 'Channel Name', ph: 'Your Restaurant Kitchen' }, { id: 'url', label: 'Channel URL', ph: 'https://youtube.com/@...' }, { id: 'subscribers', label: 'Subscribers', ph: '500' }] },
    { key: 'whatsapp',  icon: '💬', label: 'WhatsApp',   color: '#25d366',
      fields: [{ id: 'phone', label: 'Phone Number', ph: '+91 98000 11111' }, { id: 'url', label: 'wa.me Link', ph: 'https://wa.me/91...' }, { id: 'message', label: 'Default Message', ph: 'Hello! I would like to...' }] },
    { key: 'twitter',   icon: '🐦', label: 'X / Twitter', color: '#000',
      fields: [{ id: 'handle', label: 'Handle', ph: '@yourrestaurant' }, { id: 'url', label: 'Profile URL', ph: 'https://twitter.com/...' }] },
  ];

  body.innerHTML = `
    <div class="social-channel-grid">
      ${PLATFORMS.map(p => {
        const d = s[p.key] || {};
        const active = !!d.active;
        const showOnSlip = !!d.showOnSlip;
        return `
        <div class="social-card" data-platform="${p.key}">
          <div class="social-card-header" style="border-color:${p.color}">
            <span class="social-icon">${p.icon}</span>
            <span class="social-name">${p.label}</span>
            <span class="social-status-pill ${active ? 'connected' : 'inactive'}">${active ? 'Active' : 'Inactive'}</span>
          </div>
          <div class="social-card-body">
            ${p.fields.map(f => `
              <div class="field">
                <label>${f.label}</label>
                <input data-field="${f.id}" value="${esc(d[f.id] != null ? String(d[f.id]) : '')}" placeholder="${f.ph}" />
              </div>`).join('')}
            <div class="social-toggles">
              <label class="toggle-row">
                <span class="tr-body"><span class="tr-title">Active</span><span class="tr-sub">Show this platform as connected</span></span>
                <span class="switch"><input type="checkbox" data-toggle="active" ${active ? 'checked' : ''}><span class="track"></span></span>
              </label>
              <label class="toggle-row">
                <span class="tr-body"><span class="tr-title">Show on Bill Slip</span><span class="tr-sub">Print handle on customer receipts</span></span>
                <span class="switch"><input type="checkbox" data-toggle="showOnSlip" ${showOnSlip ? 'checked' : ''}><span class="track"></span></span>
              </label>
            </div>
          </div>
          <div class="social-card-footer">
            <button class="btn btn-primary btn-sm social-save-btn" data-save="${p.key}">Save Changes</button>
            ${d.url ? `<a class="btn btn-soft btn-sm" href="${esc(d.url)}" target="_blank" rel="noopener">Open ↗</a>` : ''}
          </div>
        </div>`;
      }).join('')}
    </div>
  `;

  /* Save button per card */
  $$('#pageBody .social-save-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.save;
      const card = body.querySelector(`.social-card[data-platform="${key}"]`);
      const updated = {};
      card.querySelectorAll('[data-field]').forEach(inp => {
        updated[inp.dataset.field] = inp.value.trim();
      });
      updated.active = card.querySelector('[data-toggle="active"]').checked;
      updated.showOnSlip = card.querySelector('[data-toggle="showOnSlip"]').checked;

      if (!state.socials) state.socials = {};
      state.socials[key] = { ...(state.socials[key] || {}), ...updated };
      save('socials');

      /* Update status pill */
      const pill = card.querySelector('.social-status-pill');
      pill.textContent = updated.active ? 'Active' : 'Inactive';
      pill.className = `social-status-pill ${updated.active ? 'connected' : 'inactive'}`;

      toast(`${key.charAt(0).toUpperCase() + key.slice(1)} saved`);
    });
  });
}

/* Live seating timers — update any [data-since] element once a second. */
setInterval(() => {
  document.querySelectorAll('[data-since]').forEach((el) => {
    el.textContent = fmtElapsed(Date.now() - Number(el.dataset.since || Date.now()));
  });
}, 1000);

/* ------------------------- Bootstrap ------------------------- */
if (location.hash === '#demo') sessionStorage.setItem('tapslip.authed', '1'); // preview shortcut (same trust level as the demo PIN)
hydrateLocal();
$('#promoQR').innerHTML = fakeQrSvg('tapslip-table-qr');
renderTopbarChrome();

if (isAuthed()) {
  enterApp();
  startLiveSync();
} else {
  $('#loginView').style.display = 'flex';
}

