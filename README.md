# Bean@Cafe — Ordering & Admin App

Static, mobile-first single-page app for Bean@Cafe: customer menu, cart/checkout, order confirmation with Yoco, and an admin dashboard. React + Vite + Tailwind CSS v4. No backend — data persists to `localStorage`.

## Run locally

Requires [Node.js](https://nodejs.org) 18+.

```bash
npm install
npm run dev
```

Open the printed URL (default `http://localhost:5173`).

- Customer menu: `/`
- Admin dashboard: `/admin` (passcode: `bean12345` — change in `src/lib/store.js` → `adminPassword`)

> Note: the Yoco Pay-now button needs the serverless function, which only runs on
> Netlify (or locally via `npx netlify dev`). Under plain `npm run dev` it will show
> a "payment unavailable" message and fall back to WhatsApp — the rest of the app
> works normally.

## Build & preview

```bash
npm run build     # outputs to dist/
npm run preview   # serve the production build locally
```

## Deploy to Netlify (1-click, via GitHub) — same as subURBN

The repo is Vite-ready, SPA-fallback is handled by `public/_redirects`, and the
Yoco function lives in `netlify/functions/` (wired by `netlify.toml`).

1. Create a GitHub repo (e.g. `SolvoSystems/beanatcafe`) and push this folder:
   ```bash
   git init
   git add .
   git commit -m "Bean@Cafe app"
   git branch -M main
   git remote add origin https://github.com/SolvoSystems/beanatcafe.git
   git push -u origin main
   ```
2. On Netlify: **Add new site → Import an existing project → GitHub**.
3. Pick the repo. Netlify auto-detects Vite from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
4. Set environment variables: **Site settings → Environment variables**:
   - `YOCO_SECRET_KEY` — your Yoco secret API key (never commit this).
5. Click **Deploy site**. Your review link is `https://<site-name>.netlify.app` — share that with the client.

## Yoco integrated auto-payment

The confirmation screen shows **"Pay now via Yoco"**. When clicked it calls the
Netlify function `yoco-checkout`, which creates a Yoco Checkout session with the
order total and returns a hosted payment URL. The customer pays on Yoco's page,
is redirected back, and the app auto-verifies the checkout status and marks the
order **Paid**. The secret key only ever lives server-side.

Fallbacks (all still work if the function is unreachable):
- If a staff member has attached a payment link (`order.yocoLink`), the customer
  sees that link button instead.
- Otherwise the WhatsApp "we'll send you a link" path applies.

## Config

All business settings live at the top of `src/lib/store.js`:

- Branch list (4 Planet Fitness locations), WhatsApp number, tagline
- Add-on pricing (extra chicken/fish, beef, veg/starch) and delivery fee
- Admin passcode
- Yoco — integrated checkout via `netlify/functions/yoco-checkout.mjs` (see "Yoco integrated auto-payment" above)

## Menu data

Seed menu is embedded in `src/data/menu.json` (September 2026). Staff upload the next month's CSV in the admin **Menu Import** tab, edit inline, then **Publish Menu**. Public holidays / Chef's holidays render as full-width banners with no price or order button.

## Project structure

```
src/
  App.jsx                  routes
  components/Layout.jsx    header/nav/footer + cart badge
  pages/
    HomePage.jsx           hero
    MenuPage.jsx           segmented tabs + week filters + meal cards
    CheckoutPage.jsx       customer details, add-ons, total
    ConfirmationPage.jsx   order summary + Yoco + WhatsApp
    AdminLogin.jsx         passcode
    AdminLayout.jsx
    AdminOrders.jsx        table, filters, status updates, copy Yoco link
    AdminReports.jsx       overview metrics
    AdminClients.jsx       repeat / inactive client tracking
    AdminImport.jsx        CSV upload + preview + publish
  lib/
    store.js               state + localStorage persistence
    csv.js                 CSV parsing
    yoco.js                payment link helpers
    clients.js, export.js, format.js
  data/menu.json           seed menu
```
