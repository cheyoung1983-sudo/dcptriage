/** @jest-environment jsdom */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { fireEvent, getByLabelText } from '@testing-library/dom'
import { ServiceTier } from '@/types'
import { useCustomerQuote } from '@/hooks/useCustomerQuote'
import type { CustomerQuoteInput } from '@/lib/customer-quote'
import CustomerQuoteSummary from '@/components/CustomerQuoteSummary'
import RepairEstimateCalculator from '@/components/RepairEstimateCalculator'
import IntakeForm from '@/components/IntakeForm'

// Avoid animation-frame timing in assertions; preserve the actual screen and hook logic.
jest.mock('motion/react', () => ({
  motion: { div: ({ children, initial, animate, exit, transition, ...props }: any) =>
    require('react').createElement('div', props, children) },
  AnimatePresence: ({ children }: any) => children,
}))
jest.mock('../src/components/Toast', () => ({ useToast: () => ({ showToast: jest.fn() }) }))
jest.mock('../src/components/AIDiagnostic', () => () => null)
jest.mock('../src/components/DeviceCameraCapture', () => () => null)
jest.mock('../src/components/TechnicianChecklist', () => () => null)
jest.mock('../src/components/SmartTriageChat', () => () => null)
jest.mock('../src/components/SymptomChecklist', () => ({ __esModule: true, default: () => null, DIAGNOSTIC_SYMPTOMS: [] }))
jest.mock('../src/components/DevicePhotoCaptureInput', () => () => null)
jest.mock('../src/components/CommonRepairChecklist', () => () => null)
jest.mock('../src/components/RecommendedDiagnosticPath', () => () => null)
jest.mock('../src/components/DeviceModelAutocomplete', () => () => null)
jest.mock('../src/components/TriageSecurityResearchModal', () => () => null)

const input: CustomerQuoteInput = { device_model: 'iPhone 13', repair_type: 'battery', mobile_service: false, service_tier: ServiceTier.TIER_1_POWER }
const quote = { quote_available: true, ticket_id: 'test-ticket', repair_price: 108, mobile_trip_fee: 0, total: 108, currency: 'USD', tax_included: false }
const response = (body: unknown, ok = true) => ({ ok, json: async () => body }) as Response
let root: Root, container: HTMLDivElement, fetchMock: jest.Mock
function Harness({ value }: { value: CustomerQuoteInput }) { return <CustomerQuoteSummary state={useCustomerQuote(value)} /> }
const render = async (node: React.ReactNode) => { await act(async () => { root.render(node) }) }
const tick = async () => { await act(async () => { jest.advanceTimersByTime(400) }) }
beforeEach(() => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
  jest.useFakeTimers()
  localStorage.clear()
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container)
  fetchMock = jest.fn().mockResolvedValue(response(quote)); globalThis.fetch = fetchMock
})
afterEach(async () => { await act(async () => root.unmount()); container.remove(); jest.useRealTimers(); jest.restoreAllMocks() })
it('does not request until inputs are complete; displays loading then only server totals', async () => {
  await render(<Harness value={{ ...input, repair_type: '' }} />)
  await tick(); expect(fetchMock).not.toHaveBeenCalled()
  expect(container.textContent).toContain('Select a device')
  await render(<Harness value={input} />)
  expect(container.textContent).toContain('Checking repair price')
  await tick()
  expect(container.textContent).toContain('$108.00')
  expect(container.textContent).toContain('before sales tax')
  expect(container.textContent).not.toMatch(/wholesale|overhead|allocation|hours|\$25/)
  expect(fetchMock.mock.calls[0][0]).toBe('/api/pricing/customer-quote')
  expect(fetchMock.mock.calls[0][1].headers).toEqual({ 'Content-Type': 'application/json' })
})
it('mobile fee is separate and never recalculated in client', async () => {
  fetchMock.mockResolvedValue(response({ ...quote, mobile_trip_fee: 25, total: 133 }))
  await render(<Harness value={{ ...input, mobile_service: true }} />); await tick()
  expect(container.textContent).toContain('$108.00')
  expect(container.textContent).toContain('Mobile trip fee$25.00')
  expect(container.textContent).toContain('$133.00')
})
it('hides old total immediately and ignores late responses after input change', async () => {
  let resolveOld!: (r: Response) => void
  fetchMock.mockImplementationOnce(() => new Promise(r => { resolveOld = r }))
  await render(<Harness value={input} />); await tick()
  const oldSignal = fetchMock.mock.calls[0][1].signal
  await render(<Harness value={{ ...input, device_model: 'iPhone 15' }} />)
  expect(oldSignal.aborted).toBe(true)
  expect(container.textContent).not.toContain('$')
  await tick()
  await act(async () => resolveOld(response({ ...quote, total: 999 })))
  expect(container.textContent).toContain('$108.00')
  expect(container.textContent).not.toContain('$999')
  await render(<Harness value={{ ...input, repair_type: '' }} />)
  expect(container.textContent).not.toContain('$')
})
it.each(['network', 'http', 'invalid'])('never uses fallback amounts on %s failure', async mode => {
  if (mode === 'network') fetchMock.mockRejectedValue(new Error('network'))
  else fetchMock.mockResolvedValue(response(mode === 'invalid' ? { total: 1 } : {}, mode !== 'http'))
  await render(<Harness value={input} />); await tick()
  expect(container.textContent).toContain('Quote unavailable')
  expect(container.textContent).not.toContain('$')
})
it('manual review states show no prices and promise no automatic callback', async () => {
  await render(<Harness value={{ ...input, service_tier: ServiceTier.TIER_3_BOARD, repair_type: '' }} />); await tick()
  expect(fetchMock).not.toHaveBeenCalled()
  expect(container.textContent).toContain('Manual review required by Ryan')
  expect(container.textContent).not.toContain('$')
  await render(<Harness value={input} />)
  fetchMock.mockResolvedValue(response({ quote_available: false, requires_escalation: false }))
  await tick(); expect(container.textContent).toContain('Price needs technician confirmation')
})
it('calculator uses explicit repair and shared quote display', async () => {
  await render(<RepairEstimateCalculator />)
  await act(async () => { fireEvent.change(getByLabelText(container, 'Specific repair'), { target: { value: 'battery' } }) })
  await tick()
  expect(container.textContent).toContain('Repair (parts and labor)$108.00')
  expect(container.textContent).not.toMatch(/Parts & Component Cost|\+\$49|Flagship Tier|Sales Tax \(Spokane\)/)
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ repair_type: 'battery', service_tier: ServiceTier.TIER_1_POWER })
})
it('intake restored review uses same totals; historical legacy estimates are not displayed', async () => {
  localStorage.setItem('dcp_intake_draft', JSON.stringify({ step: 4, repairType: 'battery', mobileService: false, formData: {
    deviceModel: 'iPhone 13', serviceTier: ServiceTier.TIER_1_POWER, customerReportedIssue: 'battery drains fast',
    telemetry: { batteryTempCelsius: 30, isShortToGround: false },
  } }))
  localStorage.setItem('dcp_repairs', JSON.stringify([{ date: '2026-01-01', quote: { total: 999.99 } }]))
  await render(<IntakeForm />); await tick()
  expect(container.textContent).toContain('Repair (parts and labor)$108.00')
  expect(container.textContent).not.toMatch(/Parts Allocation|Overhead Markup|Labor \(|999\.99/)
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ device_model: 'iPhone 13', repair_type: 'battery', service_tier: ServiceTier.TIER_1_POWER, symptoms: 'battery drains fast' })
})

it('a resolved price disappears immediately when changing inputs or entering Tier 3', async () => {
  await render(<Harness value={input} />); await tick()
  expect(container.textContent).toContain('$108.00')
  await render(<Harness value={{ ...input, device_model: 'iPhone 15' }} />)
  expect(container.textContent).toContain('Checking repair price')
  expect(container.textContent).not.toContain('$')
  await render(<Harness value={{ ...input, service_tier: ServiceTier.TIER_3_BOARD }} />)
  expect(container.textContent).toContain('Manual review required by Ryan')
  expect(container.textContent).not.toContain('$')
})
it('aborts pending requests on unmount and does not restart unchanged input', async () => {
  fetchMock.mockImplementation(() => new Promise(() => {}))
  await render(<Harness value={input} />); await tick()
  await render(<Harness value={{ ...input }} />); await tick()
  expect(fetchMock).toHaveBeenCalledTimes(1)
  const signal = fetchMock.mock.calls[0][1].signal
  await render(null)
  expect(signal.aborted).toBe(true)
})
