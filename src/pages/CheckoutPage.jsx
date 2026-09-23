import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppState, placeOrder, clearCart } from '../lib/store.js';
import { formatPrice, prettyDate, todayLocalYmd, addDaysLocal, isAfterCutoff, nextDeliveryDate } from '../lib/format.js';

const CUTOFF_HOUR = 12;

export default function CheckoutPage() {
  const { settings, menu, cart } = useAppState();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    branch: settings.branches[0] || '',
    deliveryDate: addDaysLocal(todayLocalYmd(), 1),
    instructions: '',
    notes: '',
  });
  const [addons, setAddons] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [cutoffNotice, setCutoffNotice] = useState('');

  const lineItems = Object.entries(cart)
    .map(([id, qty]) => ({ item: menu.find((m) => m.id === id), qty }))
    .filter((x) => x.item && !x.item.holiday);

  const mealsTotal = lineItems.reduce((s, x) => s + x.item.price * x.qty, 0);
  const addonTotal = Object.entries(addons).reduce(
    (s, [k, on]) => s + (on ? settings.addons.find((a) => a.key === k)?.price || 0 : 0),
    0
  );
  const total = mealsTotal + addonTotal + settings.deliveryFrom;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const setDate = (e) => {
    const val = e.target.value;
    setCutoffNotice('');
    if (val === todayLocalYmd() && isAfterCutoff(CUTOFF_HOUR)) {
      const bumped = nextDeliveryDate(CUTOFF_HOUR);
      setForm({ ...form, deliveryDate: bumped });
      setCutoffNotice(`It's after ${CUTOFF_HOUR}:00, so same-day is no longer available — your order is set for ${prettyDate(bumped)}.`);
      return;
    }
    setForm({ ...form, deliveryDate: val });
  };

  const minDate = isAfterCutoff(CUTOFF_HOUR) ? nextDeliveryDate(CUTOFF_HOUR) : todayLocalYmd();

  if (!lineItems.length) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-extrabold">Your basket is empty</h1>
        <p className="text-muted mt-2">Add a few meals first.</p>
        <Link to="/menu" className="btn-primary inline-block mt-4">Browse the menu</Link>
      </div>
    );
  }

  function submit(e) {
    e.preventDefault();
    setError('');
    let deliveryDate = form.deliveryDate;
    if (deliveryDate === todayLocalYmd() && isAfterCutoff(CUTOFF_HOUR)) {
      deliveryDate = nextDeliveryDate(CUTOFF_HOUR);
      setCutoffNotice(`It's after ${CUTOFF_HOUR}:00 — your order has been set for ${prettyDate(deliveryDate)}.`);
      setForm({ ...form, deliveryDate });
    }
    if (!form.name.trim() || !form.mobile.trim() || !form.branch || !deliveryDate) {
      setError('Please fill in your name, mobile, branch and delivery date.');
      return;
    }
    setSubmitting(true);
    const order = placeOrder({
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      email: form.email.trim(),
      branch: form.branch,
      deliveryDate,
      instructions: form.instructions.trim() + (form.notes.trim() ? `\n\nNotes: ${form.notes.trim()}` : ''),
      items: lineItems.map((x) => ({
        id: x.item.id,
        title: x.item.title,
        typeLabel: x.item.typeLabel,
        week: x.item.week,
        date: x.item.date,
        price: x.item.price,
        qty: x.qty,
      })),
      addons: Object.entries(addons)
        .filter(([, on]) => on)
        .map(([k]) => settings.addons.find((a) => a.key === k)),
      mealsSubtotal: mealsTotal,
      deliveryFee: settings.deliveryFrom,
      total,
    });
    clearCart();
    navigate(`/confirmation/${order.ref}`);
  }

  return (
    <div className="relative overflow-hidden">
      <div className="relative max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold mb-6">Checkout</h1>
      <form onSubmit={submit} className="grid gap-6 md:grid-cols-2 items-start">
        {/* Summary */}
        <div className="card p-6">
          <h2 className="font-extrabold mb-3">Your order</h2>
          {lineItems.map((x) => (
            <div key={x.item.id} className="flex justify-between gap-2 py-2 border-b border-dashed border-pale text-sm">
              <span>
                {x.item.title} × {x.qty}
                <span className="text-muted"> ({prettyDate(x.item.date)})</span>
              </span>
              <span className="font-bold">{formatPrice(x.item.price * x.qty)}</span>
            </div>
          ))}

          <p className="font-extrabold mt-4 mb-1">Add-ons</p>
          {settings.addons.map((a) => (
            <label key={a.key} className="flex justify-between py-1.5 text-sm cursor-pointer">
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="accent-apricot w-4 h-4"
                  checked={!!addons[a.key]}
                  onChange={(e) => setAddons({ ...addons, [a.key]: e.target.checked })}
                />
                {a.label}
              </span>
              <span>+ {formatPrice(a.price)}</span>
            </label>
          ))}

          <div className="flex justify-between py-1.5 text-sm">
            <span>Delivery</span>
            <span>From {formatPrice(settings.deliveryFrom)}</span>
          </div>
          <div className="flex justify-between py-2 mt-1 text-xl font-extrabold border-t border-pale">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        {/* Details */}
        <div className="card p-6 space-y-3">
          <h2 className="font-extrabold">Your details</h2>
          <div>
            <label className="label" htmlFor="name">Full name</label>
            <input id="name" className="input" value={form.name} onChange={set('name')} required />
          </div>
          <div>
            <label className="label" htmlFor="mobile">Mobile</label>
            <input id="mobile" className="input" type="tel" value={form.mobile} onChange={set('mobile')} required />
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" className="input" type="email" value={form.email} onChange={set('email')} />
          </div>
          <div>
            <label className="label" htmlFor="branch">Branch</label>
            <select id="branch" className="input" value={form.branch} onChange={set('branch')}>
              {settings.branches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="deliveryDate">Delivery date</label>
            <input id="deliveryDate" className="input" type="date" min={minDate} value={form.deliveryDate} onChange={setDate} required />
            <p className="text-xs text-muted mt-1">Order by 12:00 for same-day delivery/collection. After 12:00, orders go to the next day.</p>
            {cutoffNotice && (
              <p className="text-sm font-bold text-sage mt-1 bg-pale/40 rounded-xl px-3 py-2">{cutoffNotice}</p>
            )}
          </div>
          <div>
            <label className="label" htmlFor="instructions">Delivery address / instructions</label>
            <textarea id="instructions" className="input" rows={3} value={form.instructions} onChange={set('instructions')} />
          </div>
          <div>
            <label className="label" htmlFor="notes">Notes</label>
            <textarea id="notes" className="input" rows={2} value={form.notes} onChange={set('notes')} />
          </div>

          {error && <p className="text-red-600 text-sm font-bold">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? 'Placing order…' : 'Place Order'}
          </button>
          <p className="text-xs text-muted">
            You'll pay securely via Yoco after placing your order, or pay on collection.
          </p>
        </div>
      </form>
      </div>
    </div>
  );
}