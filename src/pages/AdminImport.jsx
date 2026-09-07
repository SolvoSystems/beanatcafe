import { useRef, useState } from 'react';
import { useAppState, publishMenu } from '../lib/store.js';
import { parseMenuCSV, typeLabel } from '../lib/csv.js';
import { prettyDate } from '../lib/format.js';

export default function AdminImport() {
  const { menu, menuHistory, importLog, settings } = useAppState();
  const fileRef = useRef(null);
  const [draft, setDraft] = useState(null); // { month, items, file }
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const sections = ['family', 'low-carb', 'kiddies'];

  function onFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    setBusy(true);
    const reader = new FileReader();
    reader.onload = () => {
      const result = parseMenuCSV(String(reader.result || ''));
      setBusy(false);
      if (result.error) { setError(result.error); return; }
      setDraft({ month: result.month, items: result.items, file: file.name });
      e.target.value = '';
    };
    reader.onerror = () => { setBusy(false); setError('Could not read the file.'); };
    reader.readAsText(file);
  }

  function editItem(id, patch) {
    setDraft({
      ...draft,
      items: draft.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    });
  }

  function removeItem(id) {
    setDraft({ ...draft, items: draft.items.filter((it) => it.id !== id) });
  }

  function publish() {
    if (!draft) return;
    publishMenu(draft.items, draft.month, {
      file: draft.file,
      notes: `Published from ${draft.file} (${draft.items.filter((i) => !i.holiday).length} meals)`,
    });
    setDraft(null);
  }

  function loadEmbedded() {
    // Reset the live menu back to the shipped September 2026 menu.
    import('../data/menu.json').then((mod) => {
      const data = mod.default;
      publishMenu(data.items, data.month, { file: 'menu.json', notes: 'Reloaded embedded September 2026 menu' });
    });
  }

  const groups = draft
    ? sections.map((s) => ({
        slug: s,
        label: typeLabel(s),
        weeks: groupByWeek(draft.items.filter((i) => i.type === s)),
      }))
    : [];

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-4">Menu Import</h1>
      <p className="text-sm text-muted mb-4 max-w-3xl">
        Upload a monthly menu CSV (columns: category/section, week, day, date, meal description, price).
        You'll preview every meal grouped by week, edit prices and descriptions, then publish — which
        replaces the current month's live menu and archives the old one. Holiday rows become calendar notices.
      </p>

      <div className="card p-5 mb-6">
        <h2 className="font-extrabold mb-3">1. Upload a new month</h2>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.txt"
          className="block w-full text-sm text-muted file:mr-4 file:rounded-full file:border-0 file:bg-apricot file:px-4 file:py-2 file:font-bold file:text-white"
          onChange={onFile}
        />
        {busy && <p className="text-sm text-muted mt-2">Parsing…</p>}
        {error && <p className="text-red-600 text-sm font-bold mt-2">{error}</p>}
        <p className="text-xs text-muted mt-3">Current live menu: <strong>{settings.activeMonth}</strong> ({menu.length} items)</p>
        <div className="mt-3">
          <button className="btn-ghost text-sm" onClick={loadEmbedded}>Reload embedded September 2026 menu</button>
        </div>
      </div>

      {draft && (
        <div className="card p-5 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 className="font-extrabold">2. Preview — {draft.month}</h2>
            <div className="flex gap-2">
              <button className="btn-ghost text-sm" onClick={() => setDraft(null)}>Cancel</button>
              <button className="btn-primary" onClick={publish}>
                Publish {draft.month} Menu
              </button>
            </div>
          </div>
          <p className="text-sm text-muted mb-4">
            {draft.items.filter((i) => !i.holiday).length} meals · {draft.items.filter((i) => i.holiday).length} calendar notices. Edit below as needed.
          </p>

          {groups.map((g) => (
            <div key={g.slug} className="mb-6">
              <h3 className="font-extrabold text-sage mb-2">{g.label} Dinners</h3>
              {Object.entries(g.weeks).map(([week, rows]) => (
                <div key={week} className="mb-4">
                  <p className="font-bold text-sm mb-1">{week}</p>
                  <div className="space-y-2">
                    {rows.map((it) =>
                      it.holiday ? (
                        <div key={it.id} className="bg-amber-100 border-l-4 border-amber-400 px-3 py-2 rounded-r-lg text-sm text-muted flex justify-between">
                          <span><strong>{it.holidayType}</strong> — {it.day} {prettyDate(it.date)}</span>
                          <button className="text-red-600 font-bold" onClick={() => removeItem(it.id)}>Remove</button>
                        </div>
                      ) : (
                        <div key={it.id} className="bg-cream border border-pale rounded-xl p-3 grid gap-2 md:grid-cols-[100px_130px_1fr_90px_30px] items-center">
                          <input className="input text-sm py-1.5" value={it.day} onChange={(e) => editItem(it.id, { day: e.target.value })} aria-label="Day" />
                          <input className="input text-sm py-1.5" type="date" value={it.date} onChange={(e) => editItem(it.id, { date: e.target.value })} aria-label="Date" />
                          <textarea className="input text-sm py-1.5" rows={2} value={it.title} onChange={(e) => editItem(it.id, { title: e.target.value })} aria-label="Meal description" />
                          <input className="input text-sm py-1.5" type="number" min="0" step="0.01" value={it.price} onChange={(e) => editItem(it.id, { price: Number(e.target.value) })} aria-label="Price" />
                          <button className="text-red-600 font-extrabold" onClick={() => removeItem(it.id)} aria-label="Remove">×</button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-extrabold mb-3">Import log</h2>
          {!importLog.length && <p className="text-sm text-muted">No imports yet.</p>}
          <ul className="text-sm divide-y divide-pale/50">
            {importLog.slice(0, 20).map((l, i) => (
              <li key={i} className="py-2">
                <p className="font-bold">{new Date(l.time).toLocaleString()} — {l.file}</p>
                <p className="text-muted text-xs">{l.count} items · {l.notes}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-5">
          <h2 className="font-extrabold mb-3">Menu history (archived months)</h2>
          {!menuHistory.length && <p className="text-sm text-muted">No archived months yet.</p>}
          <ul className="text-sm divide-y divide-pale/50">
            {menuHistory.map((h) => (
              <li key={h.month} className="py-2">
                <p className="font-bold">{h.month}</p>
                <p className="text-muted text-xs">Archived {new Date(h.publishedAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function groupByWeek(items) {
  const groups = {};
  for (const it of items) {
    (groups[it.week] = groups[it.week] || []).push(it);
  }
  const sortWeek = (a, b) => (parseInt(a.replace(/\D/g, ''), 10) || 0) - (parseInt(b.replace(/\D/g, ''), 10) || 0);
  return Object.fromEntries(Object.entries(groups).sort(([a], [b]) => sortWeek(a, b)));
}