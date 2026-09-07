// Formatting helpers.

export function formatPrice(v) {
  return 'R' + Number(v || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function prettyDate(ymd) {
  if (!ymd) return '';
  const d = new Date(ymd + 'T00:00:00');
  if (isNaN(d)) return ymd;
  return d.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function formatDateTime(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleString('en-ZA', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function weeksInMenu(items) {
  const set = new Set(items.map((i) => i.week).filter(Boolean));
  return [...set].sort((a, b) => {
    const na = parseInt(a.replace(/\D/g, ''), 10) || 0;
    const nb = parseInt(b.replace(/\D/g, ''), 10) || 0;
    return na - nb;
  });
}

export function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysYmd(ymd, days) {
  const d = new Date(ymd + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function whatsappHref(number, text) {
  const digits = number.replace(/\D/g, '');
  return `https://wa.me/27${digits.replace(/^27/, '').replace(/^0/, '')}?text=${encodeURIComponent(text)}`;
}

// Placeholder food imagery (Unsplash). Picks deterministically per meal id.
const FOOD_POOL = [
  'photo-1546069901-ba9599a7e63c',
  'photo-1540189549336-e6e99c3679fe',
  'photo-1512621776951-a57141f2eefd',
  'photo-1504674900247-0877df9cc836',
  'photo-1467003909585-2f8a72700288',
  'photo-1600891964092-4316c288032e',
  'photo-1555939594-58d7cb561ad1',
  'photo-1604908176997-125f25cc6f3d',
  'photo-1585937421612-70a008356fbe',
  'photo-1567620905732-2d1ec7ab7445',
  'photo-1563379926898-05f4575a45d8',
  'photo-1547592166-23ac45744acd',
  'photo-1484723091739-30a097e8f929',
  'photo-1498837167922-ddd27525d352',
];

export function foodImage(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  const photo = FOOD_POOL[Math.abs(hash) % FOOD_POOL.length];
  return `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=900&q=60`;
}