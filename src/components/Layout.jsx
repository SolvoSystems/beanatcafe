import { useState } from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import { useAppState } from '../lib/store.js';
import { whatsappHref } from '../lib/format.js';

function cartCount(cart) {
  return Object.values(cart).reduce((a, b) => a + b, 0);
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 14 14" className="w-3.5 h-3.5" fill="currentColor" aria-hidden="true">
      <path d="M0.656238 13.3845C0.441949 13.1703 0.320238 12.8809 0.317881 12.5802C0.315523 12.2796 0.432714 11.9921 0.643668 11.7812L9.85925 2.56558L2.97594 2.51323C2.82686 2.51206 2.67902 2.48154 2.54084 2.42341C2.40267 2.36528 2.27687 2.28068 2.17063 2.17444C2.06439 2.0682 1.97979 1.9424 1.92166 1.80423C1.86353 1.66605 1.83301 1.51821 1.83184 1.36913C1.83068 1.22005 1.85888 1.07267 1.91485 0.935388C1.97082 0.798108 2.05346 0.673621 2.15804 0.569034C2.26263 0.464448 2.38712 0.38181 2.5244 0.325841C2.66168 0.269872 2.80906 0.241667 2.95814 0.242836L12.5784 0.318255C12.7276 0.319236 12.8755 0.349628 13.0138 0.407691C13.152 0.465753 13.2779 0.550345 13.3842 0.656622C13.4904 0.762899 13.575 0.888772 13.6331 1.02703C13.6912 1.16529 13.7215 1.31322 13.7225 1.46235L13.7979 11.0826C13.8003 11.3837 13.683 11.6715 13.4717 11.8827C13.2605 12.094 12.9727 12.2113 12.6717 12.2089C12.3706 12.2066 12.0809 12.0847 11.8663 11.8702C11.6518 11.6556 11.5299 11.3659 11.5276 11.0648L11.4752 4.18154L2.25962 13.3971C2.04867 13.6081 1.76122 13.7253 1.46053 13.7229C1.15984 13.7205 0.870526 13.5988 0.656238 13.3845Z" />
    </svg>
  );
}

export default function Layout() {
  const { settings, cart } = useAppState();
  const count = cartCount(cart);
  const [open, setOpen] = useState(false);
  const wa = whatsappHref(settings.whatsapp, 'Hi Bean@Cafe, I have a question about my order.');

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-cream/85 backdrop-blur border-b border-pale/50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center" onClick={() => setOpen(false)}>
            <img src="/logo.png" alt="Bean@Cafe" className="h-12 w-auto" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/menu" className="px-4 py-2 rounded-full font-bold text-sm bg-apricot text-ink hover:bg-apricot/80 transition">Order Now</NavLink>
            <NavLink
              to="/checkout"
              className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-ink text-white font-bold text-sm hover:bg-sage transition"
            >
              <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                <path d="M4 2h12a1 1 0 0 1 .9 1.45L14.2 8l2.7 4.55A1 1 0 0 1 16 14H6v1a1 1 0 0 0 1 1h9v2H7a3 3 0 0 1-3-3V4a2 2 0 0 0-2-2H1V0h2a2 2 0 0 1 2 2v14z" />
              </svg>
              Basket
              {count > 0 && (
                <span className="min-w-5 h-5 px-1 rounded-full bg-apricot text-ink grid place-items-center text-xs font-extrabold">{count}</span>
              )}
            </NavLink>
            <NavLink to="/admin" className="px-4 py-2 rounded-full font-bold text-sm bg-sage text-white hover:bg-sage/80 transition">Admin</NavLink>
          </nav>

          {/* Mobile: cart + burger */}
          <div className="flex items-center gap-2 md:hidden">
            <NavLink
              to="/checkout"
              className="relative w-10 h-10 rounded-full bg-ink text-white grid place-items-center"
              aria-label="Basket"
            >
              <svg viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor" aria-hidden="true">
                <path d="M4 2h12a1 1 0 0 1 .9 1.45L14.2 8l2.7 4.55A1 1 0 0 1 16 14H6v1a1 1 0 0 0 1 1h9v2H7a3 3 0 0 1-3-3V4a2 2 0 0 0-2-2H1V0h2a2 2 0 0 1 2 2v14z" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-apricot text-ink grid place-items-center text-xs font-extrabold">{count}</span>
              )}
            </NavLink>
            <button
              className="w-10 h-10 rounded-full bg-white border border-pale grid place-items-center"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              <svg viewBox="0 0 10 7" className="w-5 h-5" fill="currentColor" aria-hidden="true">
                <path d="M9.5 1H0.5C0.22 1 0 0.78 0 0.5C0 0.22 0.22 0 0.5 0H9.5C9.78 0 10 0.22 10 0.5C10 0.78 9.78 1 9.5 1ZM9.5 4H0.5C0.22 4 0 3.78 0 3.5C0 3.22 0.22 3 0.5 3H9.5C9.78 3 10 3.22 10 3.5C10 3.78 9.78 4 9.5 4ZM9.5 7H0.5C0.22 7 0 6.78 0 6.5C0 6.22 0.22 6 0.5 6H9.5C9.78 6 10 6.22 10 6.5C10 6.78 9.78 7 9.5 7Z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <nav className="md:hidden border-t border-pale/50 bg-cream px-4 py-3 flex flex-col gap-1">
            <NavLink to="/menu" className="rounded-xl px-4 py-3 font-bold bg-apricot text-ink" onClick={() => setOpen(false)}>Order Now</NavLink>
            <NavLink to="/admin" className="rounded-xl px-4 py-3 font-bold bg-sage text-white" onClick={() => setOpen(false)}>Admin</NavLink>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="relative overflow-hidden bg-sage text-white mt-16">
        <div className="relative max-w-6xl mx-auto px-4 py-12 grid gap-10 md:grid-cols-3">
          <div>
            <img
              src="/logo.png"
              alt="Bean@Cafe"
              className="h-14 w-auto mb-4 [filter:drop-shadow(0_0_6px_rgba(255,255,255,0.65))]"
            />
            <p className="text-apricot text-sm font-extrabold">{settings.tagline}</p>
          </div>
          <div>
            <p className="font-extrabold text-white mb-3 uppercase tracking-widest text-xs">Contact</p>
            <div className="flex gap-3">
              <a
                className="w-11 h-11 rounded-full bg-white/10 grid place-items-center text-white hover:bg-apricot hover:text-ink transition"
                href={wa}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
                  <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-2-1.2 7.6 7.6 0 0 1-1.4-1.7c-.1-.3 0-.4.1-.5l.4-.5.3-.4a.6.6 0 0 0 0-.5c-.1-.2-.6-1.5-.9-2s-.4-.5-.6-.5h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.6 4 5.1 5.1 0 0 0 3.2.7 2.8 2.8 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z" />
                </svg>
              </a>
              <a
                className="w-11 h-11 rounded-full bg-white/10 grid place-items-center text-white hover:bg-apricot hover:text-ink transition"
                href="https://instagram.com/beanatcafe7"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
                  <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4a3.8 3.8 0 0 1-1.4-.9 3.8 3.8 0 0 1-.9-1.4c-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 3.2A6.6 6.6 0 1 0 18.6 12 6.6 6.6 0 0 0 12 5.4zm0 10.9A4.3 4.3 0 1 1 16.3 12 4.3 4.3 0 0 1 12 16.3zm6.9-11.2a1.5 1.5 0 1 1-1.5-1.5 1.5 1.5 0 0 1 1.5 1.5z" />
                </svg>
              </a>
            </div>
          </div>
          <div className="text-sm">
            <p className="font-extrabold text-white mb-3 uppercase tracking-widest text-xs">Delivery</p>
            <p className="text-white/90">Delivery from R{settings.deliveryFrom} · Or Collect Near You.</p>
          </div>
        </div>
        <div className="relative border-t border-white/10 py-4 text-center text-xs text-white/70">
          © {new Date().getFullYear()} Bean@Cafe · Fuel your body. Feed your soul.
        </div>
      </footer>
    </div>
  );
}

// Re-export so the SVG can be shared by pages without importing Layout.
export { ArrowIcon };