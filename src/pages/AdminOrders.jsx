import { useMemo, useState } from 'react';
import { useAppState, updateOrder, markOrderPaid } from '../lib/store.js';
import { formatPrice, prettyDate, formatDateTime, whatsappHref } from '../lib/format.js';
import { attachYocoLink } from '../lib/yoco.js';

const PAYMENT_STATUSES = ['Awaiting Payment', 'Payment Link Sent', 'Paid', 'Failed', 'Refunded'];
const DELIVERY_STATUSES = ['New', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const { orders, settings } = useAppState();
  const [q, setQ] = useState('');
  const [branch, setBranch] = useState('');
  const [status, setStatus] = useState('');
  const [yocoInput, setYocoInput] = useState({});
  const [toast, setToast] = useState('');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (branch && o.branch !== branch) return false;
      if (status && o.status !== status) return false;
      if (needle) {
        const hay = [o.ref, o.name, o.mobile].join(' ').toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [orders, q, branch, status]);

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  function saveYoco(o) {
    const link = yocoInput[o.ref]?.trim();
    if (!link) { flash('Paste a Yoco payment link first.'); return; }
    updateOrder(o.ref, attachYocoLink(o, link));
    setYocoInput((s) => ({ ...s, [o.ref]: '' }));
    flash(`Yoco link saved for ${o.ref}.`);
  }

  const summary = {
    awaiting: orders.filter((o) => o.status === 'Awaiting Payment').length,
    paid: orders.filter((o) => o.status === 'Paid').length,
    today: orders.filter((o) => o.deliveryDate === new Date().toISOString().slice(0, 10)).length,
    revenue: orders.filter((o) => o.status === 'Paid').reduce((s, o) => s + Number(o.total), 0),
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-4">Orders</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="card p-4"><p className="text-2xl font-extrabold text-apricot">{summary.awaiting}</p><p className="text-sm text-muted">Awaiting payment</p></div>
        <div className="card p-4"><p className="text-2xl font-extrabold text-sage">{summary.paid}</p><p className="text-sm text-muted">Paid</p></div>
        <div className="card p-4"><p className="text-2xl font-extrabold">{summary.today}</p><p className="text-sm text-muted">Deliveries today</p></div>
        <div className="card p-4"><p className="text-2xl font-extrabold">{formatPrice(summary.revenue)}</p><p className="text-sm text-muted">Revenue (paid)</p></div>
      </div>

      {toast && <div className="bg-green-100 text-green-800 rounded-xl px-4 py-2 mb-4 font-bold text-sm">{toast}</div>}

      <div className="flex flex-wrap gap-2 mb-4">
        <input className="input max-w-xs" placeholder="Search name / mobile / ref" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input max-w-[200px]" value={branch} onChange={(e) => setBranch(e.target.value)}>
          <option value="">All branches</option>
          {settings.branches.map((b) => <option key={b}>{b}</option>)}
        </select>
        <select className="input max-w-[200px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <button className="btn-ghost text-sm" onClick={() => { setQ(''); setBranch(''); setStatus(''); }}>Reset</button>
      </div>

      <div className="space-y-3">
        {!filtered.length && <p className="text-muted">No orders found.</p>}
        {filtered.map((o) => (
          <div key={o.ref} className="card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-extrabold">{o.ref} <span className="text-xs text-muted font-normal">{formatDateTime(o.createdAt)}</span></p>
                <p className="text-sm text-muted">{o.name} · {o.mobile} · {o.branch}</p>
                <p className="text-sm text-muted">Deliver {prettyDate(o.deliveryDate)} · {o.items.length} item(s)</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-extrabold">{formatPrice(o.total)}</p>
                <p className="text-xs text-muted">{o.items.map((it) => it.title).slice(0, 2).join(', ')}{o.items.length > 2 ? '…' : ''}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-3 items-end">
              <div>
                <label className="label text-xs">Payment</label>
                <select
                  className="input text-sm py-1.5"
                  value={o.status}
                  onChange={(e) => updateOrder(o.ref, { status: e.target.value })}
                >
                  {PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label text-xs">Delivery</label>
                <select
                  className="input text-sm py-1.5"
                  value={o.deliveryStatus}
                  onChange={(e) => updateOrder(o.ref, { deliveryStatus: e.target.value })}
                >
                  {DELIVERY_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-[240px]">
                <label className="label text-xs">Yoco payment link</label>
                <div className="flex gap-2">
                  <input
                    className="input text-sm py-1.5"
                    placeholder={o.yocoLink || 'Paste Yoco payment link'}
                    value={yocoInput[o.ref] || ''}
                    onChange={(e) => setYocoInput({ ...yocoInput, [o.ref]: e.target.value })}
                  />
                  <button className="btn-dark text-sm py-1.5" onClick={() => saveYoco(o)}>Save / Send</button>
                </div>
              </div>
              {o.status !== 'Paid' && (
                <button className="btn-primary text-sm py-1.5" onClick={() => { markOrderPaid(o.ref); flash(`${o.ref} marked as paid.`); }}>
                  Mark Paid
                </button>
              )}
              <a
                className="btn-wa text-sm py-1.5"
                href={whatsappHref(o.mobile, `Hi ${o.name}, here's an update on your Bean@Cafe order ${o.ref}.`)}
                target="_blank" rel="noreferrer"
              >
                WhatsApp
              </a>
            </div>
            {o.instructions && <p className="text-xs text-muted mt-2 whitespace-pre-line">{o.instructions}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}