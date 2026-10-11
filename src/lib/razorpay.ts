import "server-only";
import crypto from "node:crypto";
import { getSetting } from "./settings";

export function razorpayKeys() {
  const c = getSetting("commerce");
  const keyId = c.razorpayKeyId || process.env.RAZORPAY_KEY_ID || "";
  const keySecret = c.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET || "";
  return { enabled: c.razorpayEnabled && !!keyId && !!keySecret, keyId, keySecret };
}

/** https://razorpay.com/docs/api/orders/create/ */
export async function createRazorpayOrder(amountPaise: number, receipt: string) {
  const { keyId, keySecret } = razorpayKeys();
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64") },
    body: JSON.stringify({ amount: amountPaise, currency: "INR", receipt }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.description || "Couldn't start online payment");
  return json as { id: string; amount: number; currency: string };
}

/** https://razorpay.com/docs/payments/server-integration/nodejs/payment-gateway/build-integration/#verify-payment-signature */
export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string) {
  const { keySecret } = razorpayKeys();
  const expected = crypto.createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature || "");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
