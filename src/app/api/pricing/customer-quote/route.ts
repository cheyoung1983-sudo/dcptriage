/** Same-origin browser adapter. Calls the service directly, never forwards agent credentials. */
import { z } from 'zod'
import { getClientIp, rateLimitIpKey } from '@/lib/auth'
import { methodNotAllowed, readJson, toResponse } from '@/lib/http'
import { createSharedLimiter } from '@/lib/shared-limit'
import { getUpstashConfig } from '@/lib/store/upstash'
import { QuoteSchema, quoteTool } from '@/lib/tools/quote'
import { classifySymptoms, tierForRepairType } from '@/lib/tiers'
import { CustomerQuoteSchema, SERVICE_TIER_IDS } from '@/lib/customer-quote'
import { ServiceTier } from '@/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const schema = QuoteSchema.omit({ source: true }).extend({
  service_tier: z.nativeEnum(ServiceTier),
  symptoms: z.string().trim().max(4000).optional(),
  board_short: z.boolean().optional(),
}).strict()
const perClient = createSharedLimiter({ name: 'customer-quote', limit: 10, windowSeconds: 60, failOpen: false })
const aggregate = createSharedLimiter({ name: 'customer-quote-global', limit: 120, windowSeconds: 60, failOpen: false })
const failure = (status: number, error: string, headers?: Record<string, string>) =>
  toResponse({ status, body: { error }, headers })

export async function POST(req: Request) {
  if (req.headers.get('origin') !== new URL(req.url).origin ||
      (req.headers.get('sec-fetch-site') && req.headers.get('sec-fetch-site') !== 'same-origin')) {
    return failure(403, 'Same-origin request required')
  }
  if (req.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    return failure(415, 'JSON required')
  }
  // No per-instance production fallback for a public, potentially billable lookup.
  if (!getUpstashConfig()) return failure(503, 'Quotes are temporarily unavailable')
  try {
    for (const [limiter, key] of [[perClient, rateLimitIpKey(getClientIp(req.headers))], [aggregate, 'all']] as const) {
      const decision = await limiter.consume(key)
      if (!decision.allowed) return failure(decision.source === 'closed' ? 503 : 429,
        'Please try again later', { 'Retry-After': String(decision.retryAfterSeconds) })
    }
    const body = await readJson(req)
    if ('response' in body) {
      body.response.headers.set('Cache-Control', 'no-store')
      return body.response
    }
    const parsed = schema.safeParse(body.data)
    if (!parsed.success) return failure(400, 'Invalid quote request')
    const { service_tier, symptoms, board_short, ...input } = parsed.data
    if (service_tier === ServiceTier.TIER_3_BOARD || board_short ||
        (symptoms && classifySymptoms(symptoms).requiresEscalation)) {
      return toResponse({ status: 200, body: { quote_available: false, requires_escalation: true } })
    }
    if (SERVICE_TIER_IDS[service_tier] !== tierForRepairType(input.repair_type)) {
      return failure(400, 'Repair does not match selected service tier')
    }
    const result = await quoteTool({ ...input, source: 'web' })
    if (result.status !== 200) return failure(503, 'Quotes are temporarily unavailable')
    // Whitelist only public totals. Internal service metadata/messages never reach the browser.
    const publicQuote = CustomerQuoteSchema.parse({ ...result.body,
      ...(result.body.quote_available === false ? { requires_escalation: result.body.requires_escalation === true } : {}),
    })
    return toResponse({ status: 200, body: publicQuote })
  } catch {
    return failure(503, 'Quotes are temporarily unavailable')
  }
}
export const GET = () => methodNotAllowed()
