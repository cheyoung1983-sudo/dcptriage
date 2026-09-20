/**
 * Real-Time Quote Generation System
 * 
 * Securely calculates repair quotes based on selected parts, estimated labor time, 
 * and overhead. Identifies B2B clients and applies appropriate fleet discounts.
 * Ensures the quote generation is secure and does not expose underlying cost structures.
 */

import { calculateWATax } from "./tax";

export interface Part {
  id: string;
  name: string;
  wholesaleCost: number; // Internal only, should not be exposed to client
}

export interface QuoteRequest {
  parts: { id: string; quantity: number }[];
  laborHours: number;
  zipCode: string;
  isB2B: boolean;
  companyName?: string;
}

export interface QuoteResponse {
  quoteId: string;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  discount: { applied: boolean; amount: number; description: string };
  tax: { amount: number; rate: number; city: string };
  total: number;
}

// Internal pricing constants - NOT EXPOSED to the client
const HOURLY_LABOR_RATE = 95; // USD per hour for specialized restoration
const OVERHEAD_MULTIPLIER = 1.15; // 15% overhead on top of (parts + labor)
const RETAIL_MARKUP_MULTIPLIER = 1.8; // 80% markup on parts
const B2B_DISCOUNT_RATE = 0.20; // 20% flat discount for verified fleet partners

/**
 * Generates a secure quote.
 * 
 * Architectural Safety: Wholesale costs and internal multipliers are used here
 * but the response only contains the final retail prices.
 */
export function generateQuote(
  request: QuoteRequest,
  availableParts: Part[]
): QuoteResponse {
  let totalPartsRetail = 0;
  const items: { name: string; quantity: number; price: number }[] = [];

  // 1. Calculate parts retail prices (Wholesale * Markup)
  request.parts.forEach(p => {
    const part = availableParts.find(ap => ap.id === p.id);
    if (part) {
      const retailPrice = Math.round(part.wholesaleCost * RETAIL_MARKUP_MULTIPLIER * 100) / 100;
      totalPartsRetail += retailPrice * p.quantity;
      items.push({
        name: part.name,
        quantity: p.quantity,
        price: retailPrice
      });
    }
  });

  // 2. Calculate labor cost (Hours * Rate)
  const laborRetail = Math.round(request.laborHours * HOURLY_LABOR_RATE * 100) / 100;
  items.push({
    name: "Specialized Technical Labor",
    quantity: request.laborHours,
    price: laborRetail
  });

  // 3. Base subtotal with overhead
  const subtotalWithOverhead = Math.round((totalPartsRetail + laborRetail) * OVERHEAD_MULTIPLIER * 100) / 100;

  // 4. B2B Client Identification & Discount Application
  let discountAmount = 0;
  if (request.isB2B) {
    discountAmount = Math.round(subtotalWithOverhead * B2B_DISCOUNT_RATE * 100) / 100;
  }

  const discountedSubtotal = subtotalWithOverhead - discountAmount;

  // 5. Automated WA Tax Calculation (Zip code based)
  const taxInfo = calculateWATax(discountedSubtotal, request.zipCode);

  return {
    quoteId: `DCP-QT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    items,
    subtotal: subtotalWithOverhead,
    discount: {
      applied: request.isB2B,
      amount: discountAmount,
      description: request.isB2B ? `B2B Fleet Preferred Discount (20%) for ${request.companyName || "Client"}` : "None"
    },
    tax: {
      amount: taxInfo.amount,
      rate: taxInfo.rate,
      city: taxInfo.city
    },
    total: Math.round((discountedSubtotal + taxInfo.amount) * 100) / 100
  };
}
