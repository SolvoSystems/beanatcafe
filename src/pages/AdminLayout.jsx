import { useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { isAdminAuthed, setAdminAuthed } from '../lib/store.js';

const TABS = [
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/import', label: 'Menu Import' },
  { to: '/admin/clients', label: 'Clients' },
  { to: '/admin/reports', label: 'Reporting' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const authed = isAdminAuthed();

  useEffect(() => {
    if (!authed) navigate('/admin/login');
  }, [authed, navigate]);

  if (!authed) return null;

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-ink text-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Bean@Cafe" className="h-9 w-auto" />
            <span className="font-extrabold">Admin</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link to="/" className="hover:underline">View site</Link>
            <button
              className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full font-bold"
              onClick={() => { setAdminAuthed(false); navigate('/admin/login'); }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-pale/60 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                'px-4 py-3 font-bold text-sm whitespace-nowrap border-b-2 ' +
                (isActive ? 'border-apricot text-apricot' : 'border-transparent text-muted hover:text-ink')
              }
            >
              {t.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}