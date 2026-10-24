import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Secret key for verifying Shopify webhooks
const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (!SHOPIFY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const body = await req.text();
  const hmac = req.headers.get('x-shopify-hmac-sha256');
  
  if (!hmac) {
    return NextResponse.json({ error: 'Missing HMAC signature' }, { status: 401 });
  }

  const generatedHmac = crypto
    .createHmac('sha256', SHOPIFY_WEBHOOK_SECRET)
    .update(body, 'utf8')
    .digest('base64');

  if (hmac !== generatedHmac) {
    return NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 401 });
  }

  const data = JSON.parse(body);
  const topic = req.headers.get('x-shopify-topic');

  console.log(`Received Shopify webhook: ${topic}`);

  // TODO: Add logic to process order creation/updates (Phase 1)
  // Example: if (topic === 'orders/create') { ... }

  return NextResponse.json({ received: true }, { status: 200 });
}
