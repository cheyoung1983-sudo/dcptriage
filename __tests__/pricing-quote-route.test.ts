/** @jest-environment node */
// Ported from dcp-triage tests/auth-routes.test.ts + admin-cost.test.ts (quote/escalate parts), vitest -> jest
import { POST as quotePOST, GET as quoteGET } from '@/app/api/pricing/quote/route'
import { POST as escalatePOST } from '@/app/api/intake/escalate-tier3/route'
import { POST as genQuotePOST } from '@/app/api/generate-quote/route'
import { checkAgentRequest, secretsMatch } from '@/lib/auth'
import { quoteTool } from '@/lib/tools/quote'
import { createMemoryStore } from '@/lib/store/memory'
import { getTicketStore, setTicketStoreForTests } from '@/lib/store'
import { ADMIN_ENV, NO_SHOPIFY_ENV, SECRET, mockFetch, product, shopifyResponse } from '../test-utils/helpers'
import fs from 'node:fs'
import path from 'node:path'

const post = (p: string, body: unknown, secret?: string) =>
  new Request(`http://localhost${p}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(secret !== undefined ? { 'X-DCP-Agent-Secret': secret } : {}) },
    body: JSON.stringify(body),
  })
const input = { device_model: 'iPhone 13', repair_type: 'battery' }
const withCost = (value: string | null) => () =>
  shopifyResponse([product('iPhone 13 Battery', '89.00', { partCost: value === null ? null : { value } })])
const OLD_ENV = process.env

describe('agent secret guard', () => {
  it('compares correctly and fails closed when unset', () => {
    expect(secretsMatch('abc', 'abc')).toBe(true)
    expect(secretsMatch('a', 'abcdefgh')).toBe(false)
    for (const NODE_ENV of ['production', 'development', 'test'])
      expect(checkAgentRequest({ method: 'POST', headers: new Headers({ 'x-dcp-agent-secret': 'x' }) }, { env: { NODE_ENV } })).toEqual({ status: 503, error: 'Tool endpoint is not configured' })
  })
})

describe('routes', () => {
  beforeEach(() => {
    process.env = { ...OLD_ENV, ELEVENLABS_WEBHOOK_SECRET: SECRET }
    setTicketStoreForTests(createMemoryStore())
  })
  afterEach(() => {
    process.env = OLD_ENV
    setTicketStoreForTests(null)
    jest.restoreAllMocks()
  })

  it.each([['/api/pricing/quote', quotePOST], ['/api/intake/escalate-tier3', escalatePOST]] as const)('%s: 401 without/wrong secret, 503 unset, 400 empty body', async (p, h) => {
    expect((await h(post(p, {}))).status).toBe(401)
    expect((await h(post(p, {}, 'wrong'))).status).toBe(401)
    expect((await h(post(p, {}, SECRET))).status).toBe(400)
    process.env.ELEVENLABS_WEBHOOK_SECRET = ''
    expect((await h(post(p, {}, SECRET))).status).toBe(503)
  })

  it('405 for GET', () => {
    const res = quoteGET()
    expect(res.status).toBe(405)
    expect(res.headers.get('Allow')).toBe('POST')
  })

  it('Tier 3 quote is refused and escalation persists', async () => {
    const q = await quotePOST(post('/api/pricing/quote', { device_model: 'iPhone 12', repair_type: 'logic_board' }, SECRET))
    const qb = await q.json()
    expect(qb).toMatchObject({ success: false, requires_escalation: true, quote_available: false, escalation_tool: 'escalate_tier3_ticket', tier: 'Tier 3' })
    for (const k of ['total', 'repair_price', 'mobile_trip_fee', 'lines']) expect(qb).not.toHaveProperty(k)
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('ok', { status: 200 }))
    process.env.SLACK_ESCALATION_WEBHOOK_URL = 'https://hooks.slack.test/x'
    const e = await escalatePOST(post('/api/intake/escalate-tier3', { customer_name: 'A', customer_phone: '5095550111', device_model: 'iPhone 12', failure_symptoms: 'no power' }, SECRET))
    expect(e.status).toBe(200)
    expect(await e.json()).toMatchObject({ success: true, escalated: true })
  })

  it('escalation fails closed (503) without a Slack webhook', async () => {
    delete process.env.SLACK_ESCALATION_WEBHOOK_URL
    const e = await escalatePOST(post('/api/intake/escalate-tier3', { customer_name: 'A', customer_phone: '5095550111', device_model: 'iPhone 12', failure_symptoms: 'no power' }, SECRET))
    expect(e.status).toBe(503)
  })
})

describe('quote tool (live contract)', () => {
  it('confirmed cost: repair_price = ceil(cost x 1.8 + 75), trip fee separate', async () => {
    const store = createMemoryStore()
    const r = await quoteTool({ ...input, mobile_service: true }, { env: ADMIN_ENV, fetchImpl: mockFetch({ admin: withCost('18') }), store })
    expect(r.status).toBe(200)
    expect(r.body).toMatchObject({ success: true, quote_available: true, tier: 'Tier 1', repair_price: 108, mobile_trip_fee: 25, total: 133, cost_confirmed: true, tax_included: false, currency: 'USD' })
    expect(r.body.lines).toEqual([{ label: 'Repair (parts and labor)', amount: 108 }, { label: 'Mobile trip fee', amount: 25 }])
  })
  it('Shopify not configured: fails closed with quote_available false and no number', async () => {
    const r = await quoteTool(input, { env: NO_SHOPIFY_ENV, fetchImpl: mockFetch({}), store: createMemoryStore() })
    expect(r.body).toMatchObject({ quote_available: false, price_needs_confirmation: true })
    expect(JSON.stringify(r.body)).not.toMatch(/\$\d/)
  })
  it('ticket storage not configured on Vercel: 503, no quote', async () => {
    expect(getTicketStore({ NODE_ENV: 'production', VERCEL_ENV: 'production' })).toBeNull()
    const r = await quoteTool(input, { env: { ...ADMIN_ENV, NODE_ENV: 'production', VERCEL_ENV: 'production' }, fetchImpl: mockFetch({ admin: withCost('18') }) })
    expect(r.status).toBe(503)
    expect(r.body).not.toHaveProperty('total')
  })
})

describe('cost never leaks', () => {
  it('is absent from quote responses, tickets and logs', async () => {
    const store = createMemoryStore()
    const logs: string[] = []
    ;(['log', 'warn', 'error', 'info'] as const).forEach((m) => jest.spyOn(console, m).mockImplementation((...a: unknown[]) => { logs.push(a.map(String).join(' ')) }))
    const q = await quoteTool(input, { env: ADMIN_ENV, fetchImpl: mockFetch({ admin: withCost('17.4321') }), store })
    const ticket = await store.get(String(q.body.ticket_id))
    const blob = JSON.stringify([q.body, ticket, logs])
    expect(blob).not.toContain('17.43')
    expect(blob).not.toMatch(/part_?cost|wholesale/i)
    expect(blob).not.toContain('admin-secret')
    jest.restoreAllMocks()
  })
  it('/api/generate-quote never returns partsCost/laborCost', async () => {
    const res = await genQuotePOST(new Request('http://x', { method: 'POST', body: JSON.stringify({ issueType: 'screen', deviceTier: 'flagship', zipCode: '98101' }) }))
    const body = await res.json()
    expect(JSON.stringify(body)).not.toMatch(/partsCost|laborCost|wholesale|partCost/i)
    expect(body.tiers.budget.subtotal).toBe(210) // ceil(75 x 1.8 + 75)
  })
  it('client modules do not import server pricing/Shopify code', () => {
    const walk = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)])
    const offenders = walk('src').filter((f) => /\.tsx?$/.test(f)).filter((f) => {
      const s = fs.readFileSync(f, 'utf8')
      return /^\s*['"]use client['"]/.test(s) && /from ['"](@\/lib\/(shopify|shopify-admin|repair-logic|pricing|tools\/)|\.\.?\/.*(shopify|repair-logic))/.test(s)
    })
    expect(offenders).toEqual([])
  })
})
