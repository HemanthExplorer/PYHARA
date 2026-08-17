/**
 * PYHARA — Razorpay Payment Service Layer
 * 
 * Interacts with FastAPI Payment APIs:
 * POST /api/payments/create-order
 * POST /api/payments/verify
 * GET  /api/payments/order/{order_id}
 */

const getHost = () => (typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : '127.0.0.1');

/**
 * Dynamically loads the official Razorpay Checkout SDK script safely.
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.getElementById('razorpay-checkout-sdk');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-checkout-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

export async function createPaymentOrder(orderId) {
  const host = getHost();
  const url = `http://${host}:8000/api/payments/create-order`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ order_id: orderId }),
  });

  if (!res.ok) {
    let errorDetail = `HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson.detail) errorDetail = errJson.detail;
    } catch {}
    const err = new Error(errorDetail);
    err.status = res.status;
    throw err;
  }

  return await res.json();
}

export async function verifyPayment(orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature) {
  const host = getHost();
  const url = `http://${host}:8000/api/payments/verify`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      order_id: orderId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    }),
  });

  if (!res.ok) {
    let errorDetail = `HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson.detail) errorDetail = errJson.detail;
    } catch {}
    const err = new Error(errorDetail);
    err.status = res.status;
    throw err;
  }

  return await res.json();
}

export async function getPaymentForOrder(orderId) {
  if (!orderId) return null;
  const host = getHost();
  const url = `http://${host}:8000/api/payments/order/${encodeURIComponent(orderId)}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  if (res.status === 404) return null;

  if (!res.ok) {
    throw new Error(`Failed to load payment details: HTTP ${res.status}`);
  }

  return await res.json();
}
