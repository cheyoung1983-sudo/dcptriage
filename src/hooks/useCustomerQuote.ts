'use client'
import { useEffect, useState } from 'react'
import { ServiceTier } from '../types'
import { CustomerQuoteSchema, type CustomerQuote, type CustomerQuoteInput } from '../lib/customer-quote'

export type QuoteState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; quote: CustomerQuote }

export function useCustomerQuote(input: CustomerQuoteInput): QuoteState {
  const key = JSON.stringify(input)
  const manual = input.service_tier === ServiceTier.TIER_3_BOARD || input.board_short === true
  const enabled = !manual && Boolean(input.device_model.trim() && input.repair_type && input.service_tier)
  const [result, setResult] = useState<{ key: string; state: QuoteState } | null>(null)
  useEffect(() => {
    if (!enabled) return
    setResult({ key, state: { status: 'loading' } })
    const controller = new AbortController()
    let active = true
    const timer = setTimeout(async () => {
      try {
        const response = await fetch('/api/pricing/customer-quote', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin', body: key, signal: controller.signal,
        })
        if (!response.ok) throw new Error('Quote unavailable')
        const quote = CustomerQuoteSchema.parse(await response.json())
        if (active) setResult({ key, state: { status: 'ready', quote } })
      } catch {
        if (active) setResult({ key, state: { status: 'error' } })
      }
    }, 400)
    return () => { active = false; clearTimeout(timer); controller.abort() }
  }, [key, enabled])
  // Hide previous amounts synchronously on input change, even before effect cleanup.
  if (manual) return { status: 'ready', quote: { quote_available: false, requires_escalation: true } }
  return !enabled ? { status: 'idle' } : result?.key === key ? result.state : { status: 'loading' }
}
