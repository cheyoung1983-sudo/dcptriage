import { NextResponse } from 'next/server';
import { calculateWATax } from '@/lib/tax';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { zipCode } = await req.json();
    console.log(`[Diagnostic] Tax lookup for ZIP: ${zipCode}`);
    if (!zipCode) {
      return NextResponse.json({ error: "zipCode is required." }, { status: 400 });
    }

    const cleanedZip = zipCode.trim();
    const taxInfo = calculateWATax(100, cleanedZip); // Use 100 as base to get rate easily

    if (taxInfo.rate > 0) {
      return NextResponse.json({
        valid: true,
        zipCode: cleanedZip,
        city: taxInfo.city,
        rate: taxInfo.rate,
        message: `WASHINGTON TAX COMPLIANT: Destined delivery in ${taxInfo.city} (${cleanedZip}) is subject to ${(taxInfo.rate * 100).toFixed(2)}% local combined sales tax.`,
      });
    } else {
      return NextResponse.json({
        valid: false,
        zipCode: cleanedZip,
        city: "Out of State",
        rate: 0,
        message: "Out of State destination. No Washington destination sales tax collected.",
      });
    }
  } catch (err: any) {
    console.error("[Tax Lookup Error]:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
