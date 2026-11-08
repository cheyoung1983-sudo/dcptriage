'use client'
import type { QuoteState } from '../hooks/useCustomerQuote'

export default function CustomerQuoteSummary({ state }: { state: QuoteState }) {
  if (state.status === 'idle') return <p role="status">Select a device, service tier and specific repair to request a quote.</p>
  if (state.status === 'loading') return <p role="status">Checking repair price…</p>
  if (state.status === 'error') return <p role="alert">Quote unavailable. Please try again later or contact the lab for confirmation. No price has been confirmed.</p>
  const { quote } = state
  if (quote.quote_available === false) return <p role="status">{quote.requires_escalation
    ? 'Manual review required by Ryan. No automated quote is available. Contact the lab to arrange review; a callback has not been scheduled.'
    : 'Price needs technician confirmation. No automated quote is available.'}</p>
  const money = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: quote.currency }).format(n)
  return <div aria-live="polite" className="space-y-3">
    <div className="flex justify-between"><span>Repair (parts and labor)</span><span>{money(quote.repair_price)}</span></div>
    {quote.mobile_trip_fee > 0 && <div className="flex justify-between"><span>Mobile trip fee</span><span>{money(quote.mobile_trip_fee)}</span></div>}
    <div className="flex justify-between font-bold"><span>Total before sales tax</span><span>{money(quote.total)}</span></div>
    <p className="text-xs">Sales tax is not included. Final price is confirmed by the technician after inspection.</p>
  </div>
}
