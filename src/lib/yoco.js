// Yoco payment integration — modular.
//
// Modes:
//  - 'checkout' (default, when a serverless function is reachable): the customer
//    clicks "Pay now via Yoco" on their confirmation screen. The app calls the
//    Netlify function (netlify/functions/yoco-checkout.mjs) which creates a Yoco
//    Checkout session with the order total and returns a hosted payment URL.
//    The secret key never leaves the server (process.env.YOCO_SECRET_KEY).
//  - 'link' (fallback): staff attach a Yoco payment link to each order from the
//    admin Orders screen. Used when the function isn't reachable (e.g. local dev
//    without `netlify dev`), so the app still works.

const FN_URL = '/.netlify/functions/yoco-checkout';

export function yocoMode() {
  return 'checkout';
}

export function paymentLinkFor(order) {
  return order?.yocoLink || '';
}

export function attachYocoLink(order, link) {
  return { ...order, yocoLink: link, status: 'Payment Link Sent' };
}

export function isPaid(status) {
  return status === 'Paid';
}

// Create a Yoco Checkout session server-side and return { id, url }.
// Throws if the function is unreachable or Yoco rejects.
export async function createCheckout(order) {
  const res = await fetch(FN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'create',
      amountInCents: Math.round(order.total * 100),
      currency: 'ZAR',
      description: `Bean@Cafe order ${order.ref}`,
      successUrl: `${window.location.origin}/confirmation/${order.ref}`,
      cancelUrl: `${window.location.origin}/confirmation/${order.ref}`,
      metadata: { ref: order.ref },
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error ? JSON.stringify(data.error) : `Yoco request failed (${res.status})`);
  }
  return data; // { id, url }
}

// Ask the server what a checkout's status is.
export async function checkCheckout(checkoutId) {
  const res = await fetch(FN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'status', checkoutId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ? JSON.stringify(data.error) : `Yoco status failed (${res.status})`);
  return data; // { id, status, payments }
}

// A checkout is considered paid when its status is a success state or one of
// its payments succeeded.
export function checkoutWasPaid(checkout) {
  const status = String(checkout?.status || '').toLowerCase();
  const paidStatuses = ['completed', 'successful', 'paid', 'succeeded'];
  if (paidStatuses.includes(status)) return true;
  return (checkout?.payments || []).some((p) =>
    paidStatuses.includes(String(p?.status || '').toLowerCase())
  );
}

// Drop-in for local dev without `netlify dev`: returns true when the function
// endpoint responds. Used to decide whether to show the Pay-now button.
export async function checkoutAvailable() {
  try {
    const res = await fetch(FN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'ping' }),
    });
    return res.status === 200;
  } catch {
    return false;
  }
}

// Placeholder client-side link builder (testing only). Real deployments should
// call a serverless endpoint that holds the Yoco secret key.
export function createPaymentLink(order, apiKey) {
  if (!apiKey) return null;
  const amountInCents = Math.round(order.total * 100);
  const params = new URLSearchParams({
    amountInCents: String(amountInCents),
    currency: 'ZAR',
    description: `Bean@Cafe order ${order.ref}`,
    redirectUrl: `${window.location.origin}/confirmation/${order.ref}`,
  });
  return `https://pay.yoco.com/checkout/v2?${params.toString()}`;
}