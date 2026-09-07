import { useState } from 'react';
import { useAppState } from '../lib/store.js';
import { formatPrice, prettyDate, todayYmd, addDaysYmd } from '../lib/format.js';
import { downloadCSV } from '../lib/export.js';

export default function AdminReports() {
  const { orders, settings } = useAppState();
  const [from, setFrom] = useState(addDaysYmd(todayYmd(), -30));
  const [to, setTo] = useState(todayYmd());
  const [prepDate, setPrepDate] = useState(todayYmd());

  const inRange = (o) => !from || !to || (o.createdAt.slice(0, 10) >= from && o.createdAt.slice(0, 10) <= to);
  const paid = orders.filter((o) => o.status === 'Paid' && inRange(o));
  const revenue = paid.reduce((s, o) => s + Number(o.total), 0);
  const awaiting = orders.filter((o) => o.status === 'Awaiting Payment' && inRange(o)).length;
  const todayCount = orders.filter((o) => o.deliveryDate === todayYmd()).length;

  // Revenue by menu category.
  const byCat = {};
  for (const o of paid) for (const it of o.items || []) {
    byCat[it.typeLabel] = (byCat[it.typeLabel] || 0) + Number(it.price) * it.qty;
  }

  // Orders by day (last 30 days).
  const daily = {};
  for (let i = 29; i >= 0; i--) daily[addDaysYmd(todayYmd(), -i)] = 0;
  for (const o of orders) {
    const d = o.createdAt.slice(0, 10);
    if (d in daily) daily[d]++;
  }
  const maxDaily = Math.max(1, ...Object.values(daily));

  function exportOrders() {
    const rows = [
      ['Reference', 'Date', 'Customer', 'Mobile', 'Email', 'Branch', 'Delivery Date', 'Meals', 'Total', 'Payment Status', 'Delivery Status'],
      ...orders
        .filter((o) => inRange(o))
        .map((o) => [
          o.ref, o.createdAt, o.name, o.mobile, o.email, o.branch, o.deliveryDate,
          o.items.map((it) => `${it.title} x${it.qty}`).join('; '),
          o.total, o.status, o.deliveryStatus,
        ]),
    ];
    downloadCSV(`bean-cafe-orders-${from}-to-${to}.csv`, rows);
  }

  function exportPrep() {
    const rows = [
      ['Branch', 'Reference', 'Customer', 'Mobile', 'Meals'],
      ...orders
        .filter((o) => o.deliveryDate === prepDate)
        .sort((a, b) => (a.branch || '').localeCompare(b.branch || ''))
        .map((o) => [o.branch, o.ref, o.name, o.mobile, o.items.map((it) => `${it.title} x${it.qty}`).join('; ')]),
    ];
    downloadCSV(`bean-cafe-prep-list-${prepDate}.csv`, rows);
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-4">Reporting</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="card p-4"><p className="text-2xl font-extrabold text-apricot">{orders.length}</p><p className="text-sm text-muted">All orders</p></div>
        <div className="card p-4"><p className="text-2xl font-extrabold text-sage">{formatPrice(revenue)}</p><p className="text-sm text-muted">Paid revenue (range)</p></div>
        <div className="card p-4"><p className="text-2xl font-extrabold">{awaiting}</p><p className="text-sm text-muted">Awaiting payment</p></div>
        <div className="card p-4"><p className="text-2xl font-extrabold">{todayCount}</p><p className="text-sm text-muted">Deliveries today</p></div>
      </div>

      {/* Order volume */}
      <div className="card p-5 mb-6">
        <h2 className="font-extrabold mb-3">Order volume — last 30 days</h2>
        <div className="flex items-end gap-[3px] h-32">
          {Object.entries(daily).map(([d, n]) => (
            <div key={d} className="flex-1 bg-apricot/60 hover:bg-apricot rounded-t transition relative" style={{ height: `${(n / maxDaily) * 100}%` }} title={`${prettyDate(d)}: ${n}`}>
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-muted hidden lg:block">{n || ''}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue by category */}
      <div className="card p-5 mb-6">
        <h2 className="font-extrabold mb-3">Revenue by menu category</h2>
        <table className="w-full text-sm">
          <tbody>
            {Object.entries(byCat).length === 0 && <tr><td className="py-2 text-muted">No paid orders yet.</td></tr>}
            {Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([cat, v]) => (
              <tr key={cat} className="border-b border-pale/50">
                <td className="py-2">{cat}</td>
                <td className="py-2 text-right font-bold">{formatPrice(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Exports */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-extrabold mb-3">Export orders (CSV)</h2>
          <div className="flex flex-wrap gap-2 items-center">
            <input type="date" className="input max-w-[150px]" value={from} onChange={(e) => setFrom(e.target.value)} />
            <span>to</span>
            <input type="date" className="input max-w-[150px]" value={to} onChange={(e) => setTo(e.target.value)} />
            <button className="btn-primary text-sm" onClick={exportOrders}>Export</button>
          </div>
        </div>
        <div className="card p-5">
          <h2 className="font-extrabold mb-3">Daily prep list</h2>
          <div className="flex flex-wrap gap-2 items-center">
            <input type="date" className="input max-w-[150px]" value={prepDate} onChange={(e) => setPrepDate(e.target.value)} />
            <button className="btn-dark text-sm" onClick={exportPrep}>Download prep list</button>
          </div>
          <p className="text-xs text-muted mt-2">Grouped by delivery date and branch, ready for the kitchen.</p>
        </div>
      </div>
    </div>
  );
}