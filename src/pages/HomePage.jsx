import { Link } from 'react-router-dom';
import { useAppState } from '../lib/store.js';
import { whatsappHref } from '../lib/format.js';
import { MENU_THEMES } from '../lib/menuThemes.js';
import Reveal from '../components/Reveal.jsx';

function ArrowIcon() {
  return (
    <svg viewBox="0 0 14 14" className="w-3.5 h-3.5" fill="currentColor" aria-hidden="true">
      <path d="M0.656238 13.3845C0.441949 13.1703 0.320238 12.8809 0.317881 12.5802C0.315523 12.2796 0.432714 11.9921 0.643668 11.7812L9.85925 2.56558L2.97594 2.51323C2.82686 2.51206 2.67902 2.48154 2.54084 2.42341C2.40267 2.36528 2.27687 2.28068 2.17063 2.17444C2.06439 2.0682 1.97979 1.9424 1.92166 1.80423C1.86353 1.66605 1.83301 1.51821 1.83184 1.36913C1.83068 1.22005 1.85888 1.07267 1.91485 0.935388C1.97082 0.798108 2.05346 0.673621 2.15804 0.569034C2.26263 0.464448 2.38712 0.38181 2.5244 0.325841C2.66168 0.269872 2.80906 0.241667 2.95814 0.242836L12.5784 0.318255C12.7276 0.319236 12.8755 0.349628 13.0138 0.407691C13.152 0.465753 13.2779 0.550345 13.3842 0.656622C13.4904 0.762899 13.575 0.888772 13.6331 1.02703C13.6912 1.16529 13.7215 1.31322 13.7225 1.46235L13.7979 11.0826C13.8003 11.3837 13.683 11.6715 13.4717 11.8827C13.2605 12.094 12.9727 12.2113 12.6717 12.2089C12.3706 12.2066 12.0809 12.0847 11.8663 11.8702C11.6518 11.6556 11.5299 11.3659 11.5276 11.0648L11.4752 4.18154L2.25962 13.3971C2.04867 13.6081 1.76122 13.7253 1.46053 13.7229C1.15984 13.7205 0.870526 13.5988 0.656238 13.3845Z" />
    </svg>
  );
}

const STEPS = [
  ['Step 1', 'Pick your meals', 'Browse the month’s menu by Family, Low Carb or Kiddies.'],
  ['Step 2', 'Choose collection & date', 'Select your nearest collection point and a delivery date.'],
  ['Step 3', 'Pay & collect', 'Check out, pay securely via Yoco, and collect at your branch.'],
];

const TYPES = [
  {
    t: MENU_THEMES.family.label,
    d: 'Hearty, balanced weekday dinners for the whole family.',
    p: 'R69 – R77',
    theme: MENU_THEMES.family,
  },
  {
    t: MENU_THEMES['low-carb'].label,
    d: 'All the flavour, lighter on the carbs.',
    p: 'R69 – R77',
    theme: MENU_THEMES['low-carb'],
  },
  {
    t: MENU_THEMES.kiddies.label,
    d: 'Kid-friendly favourites, flat R45.',
    p: 'R45 flat',
    theme: MENU_THEMES.kiddies,
  },
];

const REVIEWS = [
  ['Fresh, hearty dinners that made our weeknights so much easier.', 'Janine M.'],
  ['The low-carb options are flavourful — you don’t feel like you’re missing out.', 'Sibusiso K.'],
  ['My kids actually ask for their kiddies dinner. Enough said.', 'Taryn V.'],
];

export default function HomePage() {
  const { settings, menu } = useAppState();
  const wa = whatsappHref(settings.whatsapp, 'Hi Bean@Cafe, I would like to order.');

  return (
    <div>
      {/* Hero — warm sage-to-cream gradient */}
      <section className="relative overflow-hidden bg-gradient-to-b from-pale/70 via-cream to-cream text-ink">
        {/* soft sage accent blob */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[640px] h-[320px] rounded-full bg-sage/20 blur-3xl" aria-hidden="true" />
        {/* Hero corner graphic — full-clarity leaf/bean from public/leaf.png, kept inside the hero */}
        <img src="/leaf.png" alt="" aria-hidden="true" className="pointer-events-none absolute top-6 right-6 w-56 sm:w-72 lg:w-80 rotate-12" />
        <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-24 text-center">
          <img src="/logo.png" alt="Bean@Cafe" className="w-[576px] max-w-full h-auto mx-auto mb-8" />
          <h1 className="display text-5xl sm:text-6xl lg:text-7xl">
            Fuel your body.
            <br />
            <span className="text-apricot">Feed your soul.</span>
          </h1>
          <p className="max-w-xl mx-auto text-muted mt-5 text-lg">
            Family Dinners, Low Carb and Kiddies dinners, made fresh and ready to collect near you.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link to="/menu" className="btn-primary">
              View this month’s menu
              <ArrowIcon />
            </Link>
            <a href={wa} target="_blank" rel="noreferrer" className="btn-wa">
              Order Now
            </a>
          </div>
          <div className="mt-10 mx-auto max-w-3xl rounded-3xl bg-white text-ink px-6 py-4 shadow-xl flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-sm font-extrabold">
            <span>Freshly Prepared Daily</span>
            <span className="text-apricot">·</span>
            <span>Ready to Heat & Eat</span>
            <span className="text-apricot">·</span>
            <span>Convenient Collection</span>
          </div>
        </div>
      </section>

      {/* Marquee divider */}
      <div className="relative overflow-hidden bg-sage text-white py-3" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((n) => (
            <span key={n} className="flex shrink-0">
              {Array.from({ length: 4 }).map((_, i) => (
                <span key={i} className="flex items-center mx-4 text-sm sm:text-base font-extrabold uppercase tracking-widest whitespace-nowrap">
                  <span className="text-white">Fuel Your Body</span>
                  <span className="mx-4 text-apricot">·</span>
                  <span className="text-apricot">Feed Your Soul</span>
                  <span className="mx-4 text-apricot">·</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section className="relative overflow-hidden py-16">
        <div className="relative max-w-6xl mx-auto px-4">
          <Reveal className="text-center mb-10">
            <p className="eyebrow text-4xl">Zero-stress meal prep</p>
            <h2 className="display text-3xl sm:text-4xl mt-2">Ordering in 3 easy steps</h2>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-3">
            {STEPS.map(([n, t, d], i) => (
              <Reveal key={n} delay={i * 120}>
                <div className="card p-6 h-full hover:-translate-y-1 transition">
                  <span className="chip bg-pale/70 text-sage">{n}</span>
                  <p className="font-extrabold text-lg mt-3">{t}</p>
                  <p className="text-sm text-muted mt-1">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* divider accent — full-resolution bean+leaf, intentionally sized */}
      <div className="flex justify-center py-12" aria-hidden="true">
        <img src="/leaf.png" alt="" className="w-28 sm:w-32 h-auto" />
      </div>

      {/* Menu types */}
      <section className="relative overflow-hidden bg-white border-y border-pale/50">
        <div className="relative max-w-6xl mx-auto px-4 py-16">
          <Reveal className="text-center mb-10">
            <p className="eyebrow text-4xl">Three ways to fuel up</p>
            <h2 className="display text-3xl sm:text-4xl mt-2">Choose your dinner style</h2>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-3">
            {TYPES.map((x, i) => (
              <Reveal key={x.t} delay={i * 120}>
                <Link to="/menu" className={`block rounded-3xl p-7 h-full transition hover:-translate-y-1 hover:shadow-xl ${x.theme.bg} ${x.theme.btnText}`}>
                  <p className="font-extrabold text-xl">{x.t}</p>
                  <p className="text-sm opacity-80 mt-1">{x.d}</p>
                  <p className="font-extrabold mt-6 flex items-center justify-between">
                    {x.p}
                    <span className={`w-10 h-10 rounded-full ${x.theme.arrow} grid place-items-center`}>
                      <ArrowIcon />
                    </span>
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="relative overflow-hidden py-16">
        <div className="relative max-w-6xl mx-auto px-4">
          <Reveal className="text-center mb-10">
            <p className="eyebrow">Loved by our regulars</p>
            <h2 className="display text-3xl sm:text-4xl mt-2">What regulars say</h2>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-3">
            {REVIEWS.map(([q, n], i) => (
              <Reveal key={n} delay={i * 120}>
                <div className="card p-6 h-full">
                  <div className="flex gap-0.5 text-apricot">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <svg key={s} viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                        <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 15l-5.3 2.6 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
                      </svg>
                    ))}
                  </div>
                  <p className="mt-3 text-muted text-sm leading-relaxed">“{q}”</p>
                  <p className="font-extrabold mt-4 text-sm">— {n}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="text-center mt-10">
            <p className="text-muted text-sm">{menu.length} meals live in the {settings.activeMonth} menu · Delivery from R{settings.deliveryFrom} · or collect near you</p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}