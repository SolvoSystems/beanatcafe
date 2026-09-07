import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppState, addToCart, setCartQty } from '../lib/store.js';
import { formatPrice, prettyDate, weeksInMenu, foodImage } from '../lib/format.js';
import { MENU_THEMES } from '../lib/menuThemes.js';

const TYPES = [
  { slug: 'family', label: 'Family' },
  { slug: 'low-carb', label: 'Low Carb' },
  { slug: 'kiddies', label: 'Kiddies' },
];

function shortDate(ymd) {
  if (!ymd) return '';
  const d = new Date(ymd + 'T00:00:00');
  return isNaN(d) ? ymd : d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
}

const BTN_BASE =
  'inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-extrabold text-sm transition cursor-pointer select-none shadow-sm active:scale-90';

function MealCard({ item, qty, theme }) {
  const [bump, setBump] = useState(false);
  const weekNum = parseInt(String(item.week || '').replace(/\D/g, ''), 10) || 0;
  const odd = weekNum % 2 === 1;

  function add() {
    addToCart(item.id, 1);
    setBump(true);
    setTimeout(() => setBump(false), 320);
  }

  return (
    <article className="card overflow-hidden flex flex-col group">
      <div className="relative aspect-video overflow-hidden bg-pale/30">
        {/* week-based secondary accent bar */}
        <div className={`absolute top-0 inset-x-0 h-1.5 z-10 ${odd ? 'bg-sage' : 'bg-apricot'}`} aria-hidden="true" />
        <img
          src={foodImage(item.id)}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className={`absolute top-4 left-3 chip ${theme.solid} ${theme.btnText} shadow-sm`}>{prettyDate(item.date)}</span>
        <span className="absolute top-4 right-3 chip bg-pale text-ink">{item.typeLabel}</span>
      </div>
      <div className="p-5 flex flex-col gap-2 flex-1">
        <h3 className="text-charcoal font-extrabold leading-snug">{item.title}</h3>
        <div className="flex items-center justify-between gap-2 mt-auto pt-3">
          <div className={`text-2xl font-bold ${theme.text}`}>{formatPrice(item.price)}</div>
          {qty > 0 ? (
            <div className="flex items-center gap-1">
              <button
                className="qty-btn"
                onClick={() => setCartQty(item.id, qty - 1)}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-7 text-center font-extrabold">{qty}</span>
              <button
                className="qty-btn"
                onClick={() => setCartQty(item.id, qty + 1)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          ) : (
            <button
              className={`${BTN_BASE} ${theme.solid} ${theme.btnText} ${bump ? 'animate-pop' : ''}`}
              onClick={add}
              aria-label={`Add ${item.title} to order`}
            >
              Add
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default function MenuPage() {
  const { settings, menu, cart } = useAppState();
  const [type, setType] = useState('family');
  const [week, setWeek] = useState('');

  const theme = MENU_THEMES[type] || MENU_THEMES.family;
  const weeks = useMemo(() => weeksInMenu(menu), [menu]);
  const items = menu.filter((i) => i.type === type && (!week || i.week === week));

  const weekRanges = useMemo(() => {
    const byWeek = {};
    menu.forEach((i) => {
      if (!i.holiday && i.date) (byWeek[i.week] = byWeek[i.week] || []).push(i.date);
    });
    return weeks.map((w) => {
      const dates = (byWeek[w] || []).sort();
      if (!dates.length) return '';
      return `${shortDate(dates[0])} – ${shortDate(dates[dates.length - 1])}`;
    });
  }, [menu, weeks]);

  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const total = menu.reduce(
    (sum, it) => sum + (cart[it.id] ? it.price * cart[it.id] : 0),
    0
  );

  if (!menu.length) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-extrabold">No menu is active right now</h1>
        <p className="text-muted mt-2">Please check back soon, or WhatsApp us at {settings.whatsapp}.</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden py-10 pb-28">
      <div className="relative max-w-6xl mx-auto px-4">
        {/* Section header — tinted by the active menu theme */}
        <div className={`rounded-3xl px-6 py-8 text-center mb-8 ${theme.tint}`}>
          <p className="eyebrow">{settings.activeMonth}</p>
          <h1 className="display text-3xl sm:text-4xl mt-2">This month’s dinner menu</h1>
          <p className="text-muted mt-2">
            {settings.tagline} · Delivery from R{settings.deliveryFrom} · or collect near you
          </p>
        </div>

        {/* Category tabs — theme-colored when active */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {TYPES.map((t) => (
            <button
              key={t.slug}
              onClick={() => setType(t.slug)}
              className={`rounded-full px-7 py-3 font-extrabold transition-all duration-300 cursor-pointer select-none ${
                type === t.slug
                  ? `${MENU_THEMES[t.slug].bg} ${MENU_THEMES[t.slug].btnText} shadow-lg scale-105`
                  : 'bg-white text-muted border border-pale hover:text-ink hover:bg-pale/30'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Week filter — scrollable date-range tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:justify-center mb-8">
          <button
            onClick={() => setWeek('')}
            className={`rounded-full px-5 py-2 text-sm font-bold border whitespace-nowrap transition-all duration-300 cursor-pointer ${
              week === '' ? 'bg-ink text-white border-ink shadow-md' : 'bg-white border-pale text-muted hover:text-ink hover:bg-pale/30'
            }`}
          >
            All Weeks
          </button>
          {weeks.map((w, i) => (
            <button
              key={w}
              onClick={() => setWeek(w)}
              className={`rounded-full px-5 py-2 text-sm font-bold border whitespace-nowrap transition-all duration-300 cursor-pointer ${
                week === w ? 'bg-ink text-white border-ink shadow-md' : 'bg-white border-pale text-muted hover:text-ink hover:bg-pale/30'
              }`}
            >
              {w}
              {weekRanges[i] && <span className={`ml-1.5 text-xs font-semibold ${week === w ? 'text-white/80' : 'text-muted/70'}`}>{weekRanges[i]}</span>}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) =>
            item.holiday ? (
              <div
                key={item.id}
                className="col-span-full stripe-pale bg-pale/40 border border-pale/60 rounded-3xl px-6 py-5 flex items-center gap-4"
              >
                <span className="w-12 h-12 rounded-2xl bg-white shadow-sm grid place-items-center text-sage flex-none">
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="17" rx="3" />
                    <path d="M8 2v4M16 2v4M3 9h18" />
                  </svg>
                </span>
                <div>
                  <p className="font-extrabold text-ink">
                    {item.holidayType === 'Public Holiday' ? 'Take the night off with us!' : 'The chef is taking a break!'}
                  </p>
                  <p className="text-sm text-ink/70">
                    {item.holidayType} — {prettyDate(item.date)}. The kitchen is closed; no orders on this day.
                  </p>
                </div>
              </div>
            ) : (
              <MealCard key={item.id} item={item} qty={cart[item.id] || 0} theme={theme} />
            )
          )}
        </div>
      </div>

      {/* Sticky cart bar */}
      {count > 0 && (
        <div className="fixed bottom-4 inset-x-0 z-30 px-4">
          <div className="max-w-3xl mx-auto bg-ink text-white rounded-3xl px-5 py-3 shadow-xl shadow-ink/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className={`w-10 h-10 rounded-full ${theme.solid} ${theme.btnText} grid place-items-center font-extrabold flex-none`}>
                {count}
              </span>
              <div>
                <p className="font-extrabold leading-tight">{count} item{count > 1 ? 's' : ''}</p>
                <p className="text-sm text-pale">{formatPrice(total)}</p>
              </div>
            </div>
            <Link to="/checkout" className="btn-primary">Go to Checkout</Link>
          </div>
        </div>
      )}
    </div>
  );
}