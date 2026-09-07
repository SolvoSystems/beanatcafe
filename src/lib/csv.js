// Tiny CSV parser (RFC-ish: handles quoted fields, commas and newlines inside quotes).

export function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  const src = String(text);
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field); field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((c) => c !== '')) rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  row.push(field);
  if (row.some((c) => c !== '')) rows.push(row);
  return rows;
}

// Normalise a date cell to YYYY-MM-DD. Accepts "31 Aug", "1 Sep", "2026-08-31".
export function toYmd(value, year) {
  const v = String(value || '').trim();
  if (!v) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const m = v.match(/^(\d{1,2})\s+([a-z]+)(?:\s+(\d{4}))?$/i);
  if (!m) return '';
  const months = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
  const mon = months[m[2].slice(0, 3).toLowerCase()];
  if (!mon) return '';
  const y = Number(m[3] || year);
  const day = Number(m[1]);
  const d = new Date(Date.UTC(y, mon - 1, day));
  if (isNaN(d)) return '';
  return d.toISOString().slice(0, 10);
}

// Price cell → number. Kiddies are always flat R45.
export function toPrice(value, type) {
  if (type === 'kiddies') return 45;
  const n = parseFloat(String(value || '').replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
}

const COLUMN_ALIASES = {
  category: ['category', 'section', 'menu_category', 'menucategory', 'type', 'menu type'],
  week: ['week'],
  day: ['day'],
  date: ['date'],
  meal: ['meal', 'meal description', 'meals', 'description', 'meal_description', 'mealdescription', 'dish'],
  price: ['price', 'price_zar', 'pricezar', 'price (zar)', 'cost'],
  month: ['month', 'menu_month', 'menumonth'],
  notice: ['notice_type', 'noticetype', 'holiday', 'is_orderable', 'isorderable'],
};

function findColumn(header, alias) {
  const wanted = COLUMN_ALIASES[alias];
  for (let i = 0; i < header.length; i++) {
    const h = String(header[i] || '').trim().toLowerCase();
    if (wanted.some((w) => h === w || h.replace(/\s+/g, '_') === w.replace(/\s+/g, '_'))) return i;
  }
  return -1;
}

function slugForType(v) {
  const s = String(v || '').toLowerCase();
  if (s.includes('low') || s.includes('carb')) return 'low-carb';
  if (s.includes('kid')) return 'kiddies';
  if (s.includes('fam')) return 'family';
  return '';
}

/**
 * Parse a monthly menu workbook (CSV) into a flat item list.
 * Supports:
 *  - Header columns: category/section/menu_category, week, day, date,
 *    meal/meal description, price/price_zar
 *  - Or the raw workbook layout (Week | Day | Date | Meal Description | Price)
 *    with week carry-down, when no category column exists (defaults to Family).
 * Rules: Week carried down; PUBLIC HOLIDAY / CHEF'S HOLIDAY → notices;
 * Kiddies flat R45; pricing footer block ignored.
 */
export function parseMenuCSV(text) {
  const rows = parseCSV(text);
  if (rows.length < 2) return { error: 'File is empty or too short.' };

  // Find the header row: the first row containing "meal"/"description" text.
  let headerIdx = -1;
  for (let i = 0; i < Math.min(rows.length, 8); i++) {
    const joined = rows[i].join(' ').toLowerCase();
    if (joined.includes('meal') || joined.includes('description')) { headerIdx = i; break; }
  }
  if (headerIdx < 0) return { error: 'Could not find a header row with Meal / Description columns.' };

  const header = rows[headerIdx].map((h) => String(h || '').trim());
  const c = {
    category: findColumn(header, 'category'),
    week: findColumn(header, 'week'),
    day: findColumn(header, 'day'),
    date: findColumn(header, 'date'),
    meal: findColumn(header, 'meal'),
    price: findColumn(header, 'price'),
    month: findColumn(header, 'month'),
  };

  const hasColumns = c.week >= 0 && c.day >= 0 && c.date >= 0 && c.meal >= 0;

  // Month + year from a menu_month column, a header/title row, or the file.
  let month = '';
  let year = String(new Date().getFullYear());
  for (let i = 0; i <= headerIdx; i++) {
    const line = rows[i].join(' ');
    const mm = line.match(/(january|february|march|april|may|june|july|august|september|october|november|december)\s*(\d{4})/i);
    if (mm) { month = mm[1][0].toUpperCase() + mm[1].slice(1).toLowerCase(); year = mm[2]; break; }
  }
  if (!month) {
    const mm = String(header[c.month >= 0 ? c.month : 0] || '') || '';
    month = mm.trim() || 'New Menu';
  }
  const monthKey = month.includes(year) ? month : `${month} ${year}`;

  let items = [];
  let currentWeek = '';
  let nextId = 1;
  let inPricing = false;

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const r = rows[i].map((x) => String(x || '').trim());
    if (r.join(' ').toLowerCase().includes('pricing')) { inPricing = true; }
    if (inPricing) continue;

    if (hasColumns) {
      const week = r[c.week] || '';
      const m = week.match(/week\s*(\d+)/i);
      if (m) currentWeek = `Week ${m[1]}`;
      if (!currentWeek) continue;

      const day = r[c.day] || '';
      const date = toYmd(r[c.date], year);
      const meal = r[c.meal] || '';
      if (!meal) continue;

      const typeRaw = c.category >= 0 ? r[c.category] : '';
      const type = slugForType(typeRaw) || 'family';
      const isHol = /public holiday/i.test(meal) || /chef's holiday/i.test(meal);

      if (isHol) {
        items.push({
          id: `bc-${nextId++}`, type, typeLabel: typeLabel(type),
          week: currentWeek, day, date, title: meal, price: 0,
          holiday: true, holidayType: /public/i.test(meal) ? 'Public Holiday' : "Chef's Holiday",
        });
      } else {
        items.push({
          id: `bc-${nextId++}`, type, typeLabel: typeLabel(type),
          week: currentWeek, day, date, title: meal,
          price: toPrice(r[c.price >= 0 ? c.price : 0], type), holiday: false,
        });
      }
    } else {
      // Raw workbook layout: Week | Day | Date | Meal Description | Price
      const week = r[0] || '';
      const m = week.match(/week\s*(\d+)/i);
      if (m) currentWeek = `Week ${m[1]}`;
      if (!currentWeek) continue;

      const day = r[1] || '';
      const date = toYmd(r[2], year);
      const meal = r[3] || '';
      if (!meal) continue;

      const isHol = /public holiday/i.test(meal) || /chef's holiday/i.test(meal);
      if (isHol) {
        items.push({
          id: `bc-${nextId++}`, type: 'family', typeLabel: 'Family',
          week: currentWeek, day, date, title: meal, price: 0,
          holiday: true, holidayType: /public/i.test(meal) ? 'Public Holiday' : "Chef's Holiday",
        });
      } else {
        items.push({
          id: `bc-${nextId++}`, type: 'family', typeLabel: 'Family',
          week: currentWeek, day, date, title: meal,
          price: toPrice(r[4] || '', 'family'), holiday: false,
        });
      }
    }
  }

  if (!items.length) return { error: 'No meals found in the file.' };
  return { month: monthKey, items };
}

export function typeLabel(slug) {
  return { family: 'Family', 'low-carb': 'Low Carb', kiddies: 'Kiddies' }[slug] || slug;
}