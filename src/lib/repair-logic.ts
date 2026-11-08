export const WA_TAX_DATA: Record<string, { city: string; rate: number }> = {
  "98101": { city: "Seattle", rate: 0.1035 },
  "98102": { city: "Seattle", rate: 0.1035 },
  "98104": { city: "Seattle", rate: 0.1035 },
  "98115": { city: "Seattle", rate: 0.1035 },
  "98004": { city: "Bellevue", rate: 0.101 },
  "98005": { city: "Bellevue", rate: 0.101 },
  "98402": { city: "Tacoma", rate: 0.103 },
  "98405": { city: "Tacoma", rate: 0.103 },
  "98052": { city: "Redmond", rate: 0.101 },
  "98201": { city: "Everett", rate: 0.099 },
  "98501": { city: "Olympia", rate: 0.095 },
  "99201": { city: "Spokane", rate: 0.090 },
  "98660": { city: "Vancouver", rate: 0.087 },
};

import { repairPriceFromPartCost } from './pricing';

/**
 * Server-only illustrative estimator for the storefront /api/generate-quote.
 * Uses the ONE V4 rule from ./pricing: ceil(part cost x 1.8 + $75 labor).
 * Part (wholesale) costs below never leave this module: only the customer
 * price (`subtotal`) is returned.
 */
export function calculateQuoteInternal(issueType: string, deviceTier: string) {
  const getPartsCost = (quality: "budget" | "pro" | "auth") => {
    if (issueType === "screen") {
      if (quality === "auth") return deviceTier === "flagship" ? 220 : 180;
      if (quality === "pro") return deviceTier === "flagship" ? 140 : 95;
      return deviceTier === "flagship" ? 75 : 45;
    } else if (issueType === "battery") {
      if (quality === "auth") return 65;
      if (quality === "pro") return 45;
      return 25;
    }
    return 30;
  };
  const calculateTier = (quality: "budget" | "pro" | "auth") => ({ subtotal: repairPriceFromPartCost(getPartsCost(quality)) });
  return {
    budget: calculateTier("budget"),
    professional: calculateTier("pro"),
    authorized: calculateTier("auth"),
  };
}
