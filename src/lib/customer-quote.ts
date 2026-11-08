/** Public quote contract and display metadata only. No pricing arithmetic or costs. */
import { z } from 'zod'
import { ServiceTier } from '../types'
import { REPAIR_TYPES, type RepairType } from './tiers'

export const REPAIR_LABELS: Record<RepairType, string> = {
  battery: 'Battery', charging_port: 'Charging port',
  screen_aftermarket: 'Screen (aftermarket)', screen_oem: 'Screen (OEM)',
  camera: 'Camera', back_glass: 'Back glass', logic_board: 'Logic board',
  motherboard: 'Motherboard', micro_soldering: 'Micro-soldering',
  liquid_damage: 'Liquid damage', water_damage: 'Water damage',
  data_recovery: 'Data recovery', no_power: 'No power',
}
export const SERVICE_TIER_IDS = {
  [ServiceTier.TIER_1_POWER]: 'TIER_1',
  [ServiceTier.TIER_2_DISPLAY]: 'TIER_2',
  [ServiceTier.TIER_3_BOARD]: 'TIER_3',
} as const
export function repairsForTier(tier?: ServiceTier): RepairType[] {
  return (Object.keys(REPAIR_TYPES) as RepairType[]).filter(r => tier && REPAIR_TYPES[r] === SERVICE_TIER_IDS[tier])
}

const amount = z.number().finite().nonnegative()
export const CustomerQuoteSchema = z.discriminatedUnion('quote_available', [
  z.object({ quote_available: z.literal(true), ticket_id: z.string(),
    repair_price: amount, mobile_trip_fee: amount, total: amount, currency: z.string(),
    tax_included: z.literal(false) }),
  z.object({ quote_available: z.literal(false), requires_escalation: z.boolean(),
    ticket_id: z.string().optional() }),
])
export type CustomerQuote = z.infer<typeof CustomerQuoteSchema>
export interface CustomerQuoteInput {
  device_model: string
  repair_type: RepairType | ''
  mobile_service: boolean
  service_tier: ServiceTier | undefined
  symptoms?: string
  board_short?: boolean
}
