import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppState, updateOrder } from '../lib/store.js';
import { formatPrice, prettyDate, formatDateTime, whatsappHref } from '../lib/format.js';
import { paymentLinkFor, createCheckout, checkCheckout, checkoutWasPaid } from '../lib/yoco.js';

export default function ConfirmationPage() {
  const { ref } = useParams();
  const { settings, orders } = useAppState();
  const order = orders.find((o) => o.ref === ref);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const [verifying, setVerifying] = useState(false);

  // If we created a checkout for this order and the customer is back unpaid,
  // ask the server what happened and mark the order paid when it succeeded.
  useEffect(() => {
    if (!order || !order.yocoCheckoutId || order.status === 'Paid') return;
    let cancelled = false;
    setVerifying(true);
    checkCheckout(order.yocoCheckoutId)
      .then((chk) => {
        if (cancelled) return;
        if (checkoutWasPaid(chk)) {
          updateOrder(order.ref, { status: 'Paid', paidAt: new Date().toISOString(), yocoRef: chk.id });
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setVerifying(false);
      });
    return () => { cancelled = true; };
  }, [order?.ref, order?.status, order?.yocoCheckoutId]);

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-extrabold">Order not found</h1>
        <p className="text-muted mt-2">Check your order reference and try again.</p>
        <Link to="/menu" className="btn-primary inline-block mt-4">Back to menu</Link>
      </div>
    );
  }

  const yoco = paymentLinkFor(order);
  const wa = whatsappHref(settings.whatsapp, `Hi Bean@Cafe, I have a question about order ${order.ref}.`);

  async function payNow() {
    setPaying(true);
    setPayError('');
    try {
      const chk = await createCheckout(order);
      updateOrder(order.ref, { yocoCheckoutId: chk.id, status: 'Payment Link Sent' });
      window.location.href = chk.url;
    } catch (e) {
      console.error(e);
      setPayError('We couldn’t start the payment just now. Please try again, or WhatsApp us and we’ll send you a payment link.');
      setPaying(false);
    }
  }

  const paid = order.status === 'Paid';

  return (
    <div className="relative overflow-hidden">
      <div className="relative max-w-2xl mx-auto px-4 py-10">
        <div className="card p-8 text-center">
          <h1 className="text-2xl font-extrabold">
            {paid ? 'Payment received — thank you!' : 'Thank you! Your order is in.'}
          </h1>
          <p className="mt-2 text-muted">Order reference</p>
          <p className="text-3xl font-extrabold text-apricot">{order.ref}</p>
          {paid ? (
            <p className="mt-1 inline-block rounded-full bg-sage/20 text-sage font-bold text-sm px-4 py-1">
              ✓ Paid · {order.paidAt ? formatDateTime(order.paidAt) : ''}
            </p>
          ) : (
            <p className="mt-1">Status: <strong>{order.status}</strong>{verifying && <span className="text-muted text-sm"> · checking payment…</span>}</p>
          )}

          <div className="text-left mt-6 space-y-2">
            {order.items.map((it) => (
              <div key={it.id} className="flex justify-between text-sm py-1 border-b border-dashed border-pale">
                <span>{it.title} × {it.qty} <span className="text-muted">({prettyDate(it.date)})</span></span>
                <span className="font-bold">{formatPrice(it.price * it.qty)}</span>
              </div>
            ))}
            {(order.addons || []).map((a) => (
              <div key={a.key} className="flex justify-between text-sm py-1 border-b border-dashed border-pale">
                <span>{a.label}</span>
                <span className="font-bold">+ {formatPrice(a.price)}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm py-1 border-b border-dashed border-pale">
              <span>Delivery</span>
              <span className="font-bold">{formatPrice(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-lg font-extrabold py-2">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {paid ? (
              <p className="text-sm text-muted">We’re on it — your order is confirmed.</p>
            ) : yoco ? (
              <a className="btn-primary w-full" href={yoco} target="_blank" rel="noreferrer">Pay securely via Yoco</a>
            ) : (
              <>
                <button className="btn-primary w-full" onClick={payNow} disabled={paying || verifying}>
                  {paying ? 'Starting payment…' : 'Pay now via Yoco'}
                </button>
                {payError && <p className="text-red-600 text-sm font-bold">{payError}</p>}
                <p className="text-xs text-muted">
                  Prefer to pay later? We can send you a payment link on WhatsApp — just message us.
                </p>
              </>
            )}
            <a className="btn-wa w-full" href={wa} target="_blank" rel="noreferrer">WhatsApp us if you have questions</a>
            <p className="text-xs text-muted">Ordered {formatDateTime(order.createdAt)} · {order.branch} · {prettyDate(order.deliveryDate)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}