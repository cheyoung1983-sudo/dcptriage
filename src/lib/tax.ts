/**
 * Washington State Automated Tax Calculation Module
 * 
 * This module provides precise sales tax rate lookups based on zip codes
 * within Washington State. It follows the Washington Department of Revenue
 * combined sales tax rates (State 6.5% + Local).
 */

interface TaxInfo {
  zip: string;
  city: string;
  combinedRate: number;
}

// A subset of major WA zip codes and their corresponding combined tax rates.
const WA_TAX_MAPPING: Record<string, TaxInfo> = {
  // Spokane Area
  "99201": { zip: "99201", city: "Spokane", combinedRate: 0.091 },
  "99202": { zip: "99202", city: "Spokane", combinedRate: 0.091 },
  "99203": { zip: "99203", city: "Spokane", combinedRate: 0.091 },
  "99204": { zip: "99204", city: "Spokane", combinedRate: 0.091 },
  "99205": { zip: "99205", city: "Spokane", combinedRate: 0.091 },
  "99207": { zip: "99207", city: "Spokane", combinedRate: 0.091 },
  "99208": { zip: "99208", city: "Spokane", combinedRate: 0.091 },
  "99212": { zip: "99212", city: "Spokane Valley", combinedRate: 0.091 },
  "99216": { zip: "99216", city: "Spokane Valley", combinedRate: 0.091 },

  // Seattle Area
  "98101": { zip: "98101", city: "Seattle", combinedRate: 0.1035 },
  "98102": { zip: "98102", city: "Seattle", combinedRate: 0.1035 },
  "98104": { zip: "98104", city: "Seattle", combinedRate: 0.1035 },
  "98105": { zip: "98105", city: "Seattle", combinedRate: 0.1035 },
  "98109": { zip: "98109", city: "Seattle", combinedRate: 0.1035 },
  "98121": { zip: "98121", city: "Seattle", combinedRate: 0.1035 },

  // Bellevue / Eastside
  "98004": { zip: "98004", city: "Bellevue", combinedRate: 0.102 },
  "98005": { zip: "98005", city: "Bellevue", combinedRate: 0.102 },
  "98052": { zip: "98052", city: "Redmond", combinedRate: 0.102 },
  "98033": { zip: "98033", city: "Kirkland", combinedRate: 0.102 },

  // Tacoma
  "98402": { zip: "98402", city: "Tacoma", combinedRate: 0.103 },
  "98403": { zip: "98403", city: "Tacoma", combinedRate: 0.103 },

  // Vancouver
  "98660": { zip: "98660", city: "Vancouver", combinedRate: 0.087 },
  "98661": { zip: "98661", city: "Vancouver", combinedRate: 0.087 },
};

/**
 * Calculates the total tax amount for a given subtotal and zip code.
 */
export function calculateWATax(subtotal: number, zipCode: string): { amount: number; rate: number; city: string } {
  const info = WA_TAX_MAPPING[zipCode];
  
  if (info) {
    return {
      amount: Math.round(subtotal * info.combinedRate * 100) / 100,
      rate: info.combinedRate,
      city: info.city
    };
  }

  const fallbackRate = 0.089;
  return {
    amount: Math.round(subtotal * fallbackRate * 100) / 100,
    rate: fallbackRate,
    city: "Washington State (Default)"
  };
}

export function isWAZipCode(zipCode: string): boolean {
  const zip = parseInt(zipCode);
  return zip >= 98001 && zip <= 99403;
}
