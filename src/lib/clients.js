// Client tracking — auto-built profiles from orders.
// Flags:
//  - repeat   (green): 3+ paid orders in the last 60 days
//  - at-risk  (amber): previously regular, no order in the last 21 days
//  - dropped  (red):   no order in the last 60 days (beyond at-risk)

const PAID = ['Paid'];

function isPaid(o) {
  return PAID.includes(o.status);
}

function daysBetween(aIso, bIso) {
  return Math.floor((new Date(bIso).setHours(0, 0, 0, 0) - new Date(aIso).setHours(0, 0, 0, 0)) / 86400000);
}

export function clientProfiles(orders) {
  const map = {};
  const now = new Date().toISOString();

  for (const o of orders) {
    const phone = (o.mobile || '').replace(/\D/g, '');
    if (!phone) continue;
    const p = map[phone] || {
      phone,
      name: o.name,
      email: o.email || '',
      branch: o.branch,
      orders: [],
      totalSpend: 0,
      firstOrder: '',
      lastOrder: '',
      orderCount: 0,
      paidCount: 0,
      favourite: '',
      flag: 'new',
      daysSince: null,
    };
    p.name = o.name || p.name;
    p.email = o.email || p.email;
    p.branch = o.branch || p.branch;
    p.orders.push({ ref: o.ref, createdAt: o.createdAt, total: o.total, paid: isPaid(o), items: o.items || [] });
    if (isPaid(o)) p.totalSpend += Number(o.total) || 0;
    map[phone] = p;
  }

  const profiles = Object.values(map);
  for (const p of profiles) {
    const dates = p.orders.map((o) => o.createdAt).sort();
    p.firstOrder = dates[0] || '';
    p.lastOrder = dates[dates.length - 1] || '';
    p.orderCount = p.orders.length;
    p.paidCount = p.orders.filter((o) => o.paid).length;

    // Favourite menu category by item count.
    const counts = {};
    for (const o of p.orders) for (const it of o.items || []) {
      counts[it.typeLabel] = (counts[it.typeLabel] || 0) + 1;
    }
    p.favourite = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    // Flags.
    const recentPaid = p.orders.filter((o) => o.paid && daysBetween(o.createdAt, now) <= 60).length;
    const lastDate = p.lastOrder ? new Date(p.lastOrder) : null;
    const daysSince = lastDate ? Math.floor((Date.now() - lastDate.getTime()) / 86400000) : null;

    p.flag = 'new';
    if (recentPaid >= 3) p.flag = 'repeat';
    else if (p.paidCount > 0 && daysSince != null && daysSince > 21) p.flag = 'at-risk';
    if (p.paidCount > 0 && daysSince != null && daysSince > 60) p.flag = 'dropped';
    p.daysSince = daysSince;
  }

  return profiles;
}

export function flagLabel(flag) {
  return {
    repeat: 'Repeat Client',
    'at-risk': 'At Risk',
    dropped: 'Dropped Off',
    new: 'New',
  }[flag] || flag;
}

export function flagClass(flag) {
  return {
    repeat: 'bg-green-600',
    'at-risk': 'bg-amber-500',
    dropped: 'bg-red-600',
    new: 'bg-gray-400',
  }[flag] || 'bg-gray-400';
}