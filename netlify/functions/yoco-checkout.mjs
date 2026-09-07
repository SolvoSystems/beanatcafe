// Netlify function: Yoco Checkout API integration.
//
// Holds the Yoco secret key server-side (process.env.YOCO_SECRET_KEY) so it
// never ships to the browser. Two actions:
//   action: "create" -> POST https://payments.yoco.com/checkouts, returns { id, url }
//   action: "status" -> GET  https://payments.yoco.com/checkouts/{checkoutId}
//
// Env vars (set in Netlify):
//   YOCO_SECRET_KEY  — live/secret API key from the Yoco dashboard.

const YOCO_API = 'https://payments.yoco.com/checkouts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  const key = process.env.YOCO_SECRET_KEY;
  if (!key) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'YOCO_SECRET_KEY is not configured.' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');

    if (body.action === 'status') {
      const checkoutId = body.checkoutId;
      if (!checkoutId) {
        return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Missing checkoutId.' }) };
      }
      const res = await fetch(`${YOCO_API}/${checkoutId}`, {
        headers: { Authorization: `Bearer ${key}` },
      });
      const data = await res.json();
      return { statusCode: res.ok ? 200 : res.status, headers: corsHeaders, body: JSON.stringify(data) };
    }

    // action: 'create'
    const { amountInCents, currency = 'ZAR', description, successUrl, cancelUrl, metadata } = body;
    if (!amountInCents || amountInCents <= 0) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Invalid amount.' }) };
    }
    const res = await fetch(YOCO_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amountInCents,
        currency,
        description,
        successUrl,
        cancelUrl,
        failureUrl: cancelUrl,
        metadata,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { statusCode: res.status, headers: corsHeaders, body: JSON.stringify({ error: data }) };
    }
    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ id: data.id, url: data.url }) };
  } catch (err) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: String((err && err.message) || err) }) };
  }
}