import { useMemo, useState } from 'react';
import { useAppState } from '../lib/store.js';
import { clientProfiles, flagLabel, flagClass } from '../lib/clients.js';
import { formatPrice, whatsappHref } from '../lib/format.js';

const FLAGS = [
  { slug: 'repeat', label: 'Repeat Client' },
  { slug: 'at-risk', label: 'At Risk' },
  { slug: 'dropped', label: 'Dropped Off' },
  { slug: 'new', label: 'New' },
];

export default function AdminClients() {
  const { orders } = useAppState();
  const [flag, setFlag] = useState('');
  const [sort, setSort] = useState('flag');

  const profiles = useMemo(() => {
    let list = clientProfiles(orders);
    if (flag) list = list.filter((p) => p.flag === flag);
    const rank = { repeat: 1, 'at-risk': 2, dropped: 3, new: 4 };
    list.sort((a, b) => {
      if (sort === 'totalSpend') return b.totalSpend - a.totalSpend;
      if (sort === 'orderCount') return b.orderCount - a.orderCount;
      return (rank[a.flag] || 9) - (rank[b.flag] || 9);
    });
    return list;
  }, [orders, flag, sort]);

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-1">Clients</h1>
      <p className="text-sm text-muted mb-4">
        Auto-built from order history. Repeat = 3+ paid orders in 60 days · At Risk = no order in 21 days · Dropped = no order in 60 days.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {FLAGS.map((f) => (
          <button
            key={f.slug}
            onClick={() => setFlag(flag === f.slug ? '' : f.slug)}
            className={`rounded-full px-4 py-1.5 text-sm font-bold border transition ${
              flag === f.slug ? 'bg-ink text-white border-ink' : 'bg-white border-pale hover:bg-pale/40'
            }`}
          >
            {f.label}
          </button>
        ))}
        <select className="input max-w-[160px] text-sm py-1.5" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="flag">Sort: Status</option>
          <option value="totalSpend">Sort: Spend</option>
          <option value="orderCount">Sort: Orders</option>
        </select>
      </div>

      {!profiles.length && <p className="text-muted">No clients yet. Place a test order on the checkout to see profiles appear.</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted border-b border-pale">
              <th className="py-2 pr-3">Client</th>
              <th className="py-2 pr-3">Branch</th>
              <th className="py-2 pr-3">Orders</th>
              <th className="py-2 pr-3">Spend</th>
              <th className="py-2 pr-3">Favourite</th>
              <th className="py-2 pr-3">Last order</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => (
              <tr key={p.phone} className="border-b border-pale/50">
                <td className="py-3 pr-3">
                  <p className="font-bold">{p.name || '—'}</p>
                  <p className="text-xs text-muted">{p.mobile}</p>
                </td>
                <td className="py-3 pr-3">{p.branch}</td>
                <td className="py-3 pr-3">{p.orderCount}</td>
                <td className="py-3 pr-3 font-bold">{formatPrice(p.totalSpend)}</td>
                <td className="py-3 pr-3">{p.favourite}</td>
                <td className="py-3 pr-3">
                  {p.daysSince == null ? '—' : `${new Date(p.lastOrder).toLocaleDateString()} (${p.daysSince}d ago)`}
                </td>
                <td className="py-3 pr-3">
                  <span className={`pill ${flagClass(p.flag)} text-white`}>{flagLabel(p.flag)}</span>
                </td>
                <td className="py-3">
                  <a className="btn-wa text-xs py-1.5" href={whatsappHref(p.mobile, `Hi ${p.name}, Bean@Cafe here — time to reorder?`)} target="_blank" rel="noreferrer">WhatsApp</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}