/** @jest-environment node */
import { POST, GET } from '@/app/api/pricing/customer-quote/route'
import { POST as agentPOST } from '@/app/api/pricing/quote/route'
import { setTicketStoreForTests } from '@/lib/store'
import { createMemoryStore } from '@/lib/store/memory'
import { resetAdminTokenCacheForTests } from '@/lib/shopify-admin'
import { ServiceTier } from '@/types'
import { ADMIN_ENV, SECRET, mockFetch, costed, shopifyResponse } from '../test-utils/helpers'

const input = { device_model: 'iPhone 13', repair_type: 'battery', service_tier: ServiceTier.TIER_1_POWER, mobile_service: false }
const url = 'https://triage.example/api/pricing/customer-quote'
const request = (body: unknown = input, headers: Record<string, string> = {}) => new Request(url, {
  method: 'POST', headers: { origin: 'https://triage.example', 'content-type': 'application/json', ...headers }, body: JSON.stringify(body),
})
const originalEnv = process.env
let count: number, redisFailure: boolean, cost: string | null, unconfirmed: boolean
let fetcher: jest.Mock
beforeEach(() => {
  process.env = { ...originalEnv, ...ADMIN_ENV, UPSTASH_REDIS_REST_URL: 'https://redis.example', UPSTASH_REDIS_REST_TOKEN: 'test-redis-token' }
  setTicketStoreForTests(createMemoryStore())
  resetAdminTokenCacheForTests()
  count = 1; redisFailure = false; cost = '18.01'; unconfirmed = false
  const shopify = mockFetch({ admin: () => shopifyResponse(cost === null ? [] : [{ ...costed('iPhone 13 Battery', cost), ...(unconfirmed ? { partCost: null } : {}) }]) })
  fetcher = jest.fn(async (url: string | URL | Request) => {
    if (String(url).includes('redis.example')) {
      if (redisFailure) throw new Error('mock failure')
      return new Response(JSON.stringify([{ result: count }, { result: 1 }, { result: 60 }]))
    }
    return shopify(url)
  })
  jest.spyOn(globalThis, 'fetch').mockImplementation(fetcher)
  jest.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => { process.env = originalEnv; setTicketStoreForTests(null); jest.restoreAllMocks() })

it.each([false, true])('matches protected agent totals (mobile=%s), whitelist only, no secret required for browser', async mobile => {
  const web = await POST(request({ ...input, mobile_service: mobile }))
  expect(web.status).toBe(200)
  expect(web.headers.get('cache-control')).toBe('no-store')
  const body = await web.json()
  expect(body).toEqual({ ticket_id: expect.any(String), quote_available: true, repair_price: 108,
    mobile_trip_fee: mobile ? 25 : 0, total: mobile ? 133 : 108, currency: 'USD', tax_included: false })
  const agent = await agentPOST(new Request('https://triage.example/api/pricing/quote', {
    method: 'POST', headers: { 'x-dcp-agent-secret': SECRET }, body: JSON.stringify({ ...input, mobile_service: mobile }),
  }))
  const a = await agent.json()
  for (const key of ['repair_price', 'mobile_trip_fee', 'total']) expect(body[key]).toBe(a[key])
  expect(JSON.stringify(body)).not.toMatch(/18\.01|part.?cost|wholesale|secret|token|formula|laborHours/i)
})
it('does not weaken agent authentication', async () => {
  expect((await agentPOST(request(input))).status).toBe(401)
  delete process.env.ELEVENLABS_WEBHOOK_SECRET
  expect((await agentPOST(request(input))).status).toBe(503)
  expect((await POST(request())).status).toBe(200)
})
it.each([
  { ...input, service_tier: ServiceTier.TIER_3_BOARD, repair_type: 'logic_board' },
  { ...input, symptoms: 'liquid damage, battery swollen' },
  { ...input, board_short: true },
  { ...input, symptoms: 'unspecified unusual failure' },
])('returns manual review without amounts or Shopify call: %j', async body => {
  const res = await POST(request(body))
  expect(await res.json()).toEqual({ quote_available: false, requires_escalation: true })
  expect(fetcher.mock.calls.every(([u]) => String(u).includes('redis.example'))).toBe(true)
})
it.each([
  {}, { ...input, repair_type: 'banana' }, { ...input, device_model: ' ' },
  { ...input, device_model: 'a'.repeat(121) }, { ...input, mobile_service: 'false' },
  { ...input, partCost: 1 }, { ...input, total: 5 }, { ...input, source: 'voice' },
  { ...input, service_tier: ServiceTier.TIER_2_DISPLAY }, { ...input, symptoms: 'x'.repeat(4001) },
])('rejects invalid/untrusted fields: %j', async body => {
  expect((await POST(request(body))).status).toBe(400)
})
it.each(['https://evil.example', 'null', ''])('rejects foreign/missing origin %s', async origin => {
  expect((await POST(request(input, { origin }))).status).toBe(403)
  expect(fetcher).not.toHaveBeenCalled()
})
it('rejects cross-site metadata and non-JSON bodies', async () => {
  expect((await POST(request(input, { 'sec-fetch-site': 'cross-site' }))).status).toBe(403)
  expect((await POST(request(input, { 'content-type': 'text/plain' }))).status).toBe(415)
})
it('limits request bytes even without content-length and handles malformed JSON', async () => {
  const req = (body: string) => new Request(url, { method: 'POST', headers: { origin: 'https://triage.example', 'content-type': 'application/json' }, body })
  expect((await POST(req('{'))).status).toBe(400)
  expect((await POST(req('x'.repeat(17000)))).status).toBe(413)
})
it('limits clients and the aggregate, with Retry-After; Redis outage fails closed', async () => {
  count = 11
  const limited = await POST(request())
  expect(limited.status).toBe(429)
  expect(limited.headers.get('retry-after')).toBe('60')
  expect(fetcher).toHaveBeenCalledTimes(1)
  redisFailure = true
  expect((await POST(request())).status).toBe(503)
})
it('aggregate limiter denies across distinct clients', async () => {
  fetcher.mockImplementationOnce(async () => new Response(JSON.stringify([{ result: 1 }, { result: 1 }, { result: 60 }])))
  count = 121
  expect((await POST(request(input, { 'x-vercel-forwarded-for': '192.0.2.99' }))).status).toBe(429)
  expect(fetcher).toHaveBeenCalledTimes(2)
})
it('missing Redis configuration fails closed without lookup', async () => {
  delete process.env.UPSTASH_REDIS_REST_URL; delete process.env.KV_REST_API_URL
  expect((await POST(request())).status).toBe(503)
  expect(fetcher).not.toHaveBeenCalled()
})
it('missing Shopify, missing listing or unconfirmed cost never fabricates prices', async () => {
  cost = null
  expect(await (await POST(request())).json()).toMatchObject({ quote_available: false, requires_escalation: false })
  delete process.env.SHOPIFY_CLIENT_SECRET
  expect(await (await POST(request())).json()).toMatchObject({ quote_available: false })
})
it('an existing listing without confirmed wholesale cost yields no price', async () => {
  unconfirmed = true
  const body = await (await POST(request())).json()
  expect(body).toEqual({ quote_available: false, requires_escalation: false, ticket_id: expect.any(String) })
})
it('storage/service exceptions are sanitized', async () => {
  const store = createMemoryStore()
  store.create = async () => { throw new Error('mock-sensitive-admin-token') }
  setTicketStoreForTests(store)
  const res = await POST(request())
  expect(res.status).toBe(503)
  expect(await res.json()).toEqual({ error: 'Quotes are temporarily unavailable' })
})
it('GET is not allowed', () => { expect(GET().status).toBe(405) })
