// Bean@Cafe data layer.
// Persists to localStorage today. Every accessor here is deliberately thin so
// the same API can be backed by Supabase/Firebase later — swap the load/save
// internals, keep the rest of the app untouched.
import { useSyncExternalStore } from 'react';
import seededMenu from '../data/menu.json';

const KEYS = {
  settings: 'bc.settings',
  menu: 'bc.menu',
  menuHistory: 'bc.menuHistory',
  orders: 'bc.orders',
  importLog: 'bc.importLog',
  cart: 'bc.cart',
  adminAuthed: 'bc.adminAuthed',
};

export const DEFAULT_SETTINGS = {
  siteName: 'Bean@Cafe',
  tagline: 'FUEL YOUR BODY. FEED YOUR SOUL.',
  whatsapp: '078 463 2352',
  branches: [
    'Planet Fitness – Fourways',
    'Planet Fitness – Randburg',
    'Planet Fitness – Sandton',
    'Planet Fitness – Rosebank',
  ],
  addons: [
    { key: 'extra_chicken', label: 'Extra chicken / fish', price: 28 },
    { key: 'extra_beef', label: 'Extra beef', price: 32 },
    { key: 'extra_veg', label: 'Extra veg / starch', price: 17 },
  ],
  deliveryFrom: 38,
  activeMonth: 'September 2026',
  adminPassword: 'bean12345',
  yocoMode: 'link', // 'link' | 'webhook' (webhook needs a server; see lib/yoco.js)
  yocoApiKey: '',
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full/blocked — keep app working in memory */
  }
}

let state = {
  settings: { ...DEFAULT_SETTINGS, ...read(KEYS.settings, {}) },
  menu: read(KEYS.menu, seededMenu.items),
  menuHistory: read(KEYS.menuHistory, []),
  orders: read(KEYS.orders, []),
  importLog: read(KEYS.importLog, []),
  cart: read(KEYS.cart, {}),
};

const listeners = new Set();
function setState(patch) {
  state = { ...state, ...patch };
  write(KEYS.settings, state.settings);
  write(KEYS.menu, state.menu);
  write(KEYS.menuHistory, state.menuHistory);
  write(KEYS.orders, state.orders);
  write(KEYS.importLog, state.importLog);
  write(KEYS.cart, state.cart);
  listeners.forEach((l) => l());
}

export function useAppState() {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => state
  );
}

/* ---------------- settings ---------------- */
export function updateSettings(patch) {
  setState({ settings: { ...state.settings, ...patch } });
}

/* ---------------- menu ---------------- */
export function publishMenu(items, month, note) {
  const history = state.menuHistory.filter((h) => h.month !== month);
  history.push({ month, publishedAt: new Date().toISOString() });
  const log = [
    {
      time: new Date().toISOString(),
      file: note?.file || 'manual',
      count: items.filter((i) => !i.holiday).length,
      notes: note?.notes || '',
    },
    ...state.importLog,
  ].slice(0, 200);
  setState({
    menu: items,
    menuHistory: history,
    importLog: log,
    settings: { ...state.settings, activeMonth: month },
  });
}

/* ---------------- cart ---------------- */
export function addToCart(id, qty = 1) {
  const cart = { ...state.cart };
  cart[id] = (cart[id] || 0) + qty;
  setState({ cart });
}
export function removeFromCart(id) {
  const cart = { ...state.cart };
  delete cart[id];
  setState({ cart });
}
export function setCartQty(id, qty) {
  const cart = { ...state.cart };
  if (qty <= 0) delete cart[id];
  else cart[id] = qty;
  setState({ cart });
}
export function clearCart() {
  setState({ cart: {} });
}

/* ---------------- orders ---------------- */
export function placeOrder(input) {
  const order = {
    ref: newOrderRef(),
    createdAt: new Date().toISOString(),
    status: 'Awaiting Payment',
    deliveryStatus: 'New',
    yocoLink: '',
    yocoRef: '',
    paidAt: null,
    ...input,
  };
  const orders = [order, ...state.orders];
  setState({ orders });
  return order;
}
export function updateOrder(ref, patch) {
  const orders = state.orders.map((o) => (o.ref === ref ? { ...o, ...patch } : o));
  setState({ orders });
}
export function markOrderPaid(ref) {
  updateOrder(ref, { status: 'Paid', paidAt: new Date().toISOString() });
}

/* ---------------- admin auth ---------------- */
export function isAdminAuthed() {
  return read(KEYS.adminAuthed, false);
}
export function setAdminAuthed(v) {
  write(KEYS.adminAuthed, v);
}
export function adminAuthedKey() {
  return KEYS.adminAuthed;
}

/* ---------------- helpers ---------------- */
export function newOrderRef() {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BC-${yy}${mm}${dd}-${rand}`;
}

export function seedNewestMenu() {
  // If the browser has no stored menu yet, offer to load the embedded one.
  return seededMenu.items;
}

export function seededMonth() {
  return seededMenu.month;
}