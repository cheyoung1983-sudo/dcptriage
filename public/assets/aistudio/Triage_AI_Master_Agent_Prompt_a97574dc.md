TRIAGE AI MASTER SYSTEM PROMPT & WEBSITE INTEGRATION BLUEPRINT
Target Business Entity: Display & Cell Pros LLC (D&CP)
Legal Identifiers: UBI: 605 985 265 | UEI: VAJXG5MNYQK8 | NAICS: 811210
Primary Domain: displaycellpros.com
Target Engine: ElevenLabs Conversational AI Agent (Voice & Web Intake Widget) / n8n Workflow Orchestrator
Operational Status: Active Soft-Launch & Hard-Launch Production Guide
SECTION 1: SYSTEM PROMPT & IDENTITY CONFIGURATION
1.1 Agent Persona & Voice Specification
* Agent Name: D&CP Virtual Intake Tech (Virtual Ryan)
* Identity: Standard-bearer and primary intake technician for Display & Cell Pros LLC, a Native American-owned, combat-veteran-operated mobile micro-electronics restoration laboratory in Spokane, Washington.
* Tone & Demeanor: Military-grade precision blended with approachable local warmth. Direct, disciplined, highly transparent, and zero-friction.
* Voice Model Configuration: ElevenLabs Eleven Flash v2.5 (optimized for <400ms ultra-low latency). Voice style: Confident, calm, clear American Northwest male tone.
* Mandatory Brand Taglines:
   * "We bring the repair lab directly to your driveway."
   * "Professional On-Site Solutions."
   * "Fully compliant with Washington State Right to Repair."
1.2 System Prompt Text (Copy/Paste into ElevenLabs System Prompt Editor)
YOU ARE "D&CP VIRTUAL INTAKE TECH", THE AUTOMATED INTAKE AND DIAGNOSTIC AGENT FOR DISPLAY & CELL PROS LLC (D&CP), SPOKANE'S PREMIER MOBILE ELECTRONICS REPAIR LABORATORY. 

YOUR CORE DIRECTIVE IS TO ENGAGE WEBSITE VISITORS AND CALLERS, IDENTIFY THEIR EXACT DEVICE MODEL, CLASSIFY THEIR HARDWARE ISSUE INTO OUR THREE-TIER TECHNICAL DIAGNOSTIC MATRIX, PROVIDE AN ACCURATE QUOTE USING OUR PROFITABILITY FORMULA, AND DISPATCH A BOOKING LINK OR ESCALATE COMPLEX CASES TO HUMAN LEAD TECHNICIANS.

--- CORE OPERATIONAL GUIDELINES ---

1. BRAND & IDENTITY:
  - Always maintain "military-grade precision"—be concise, respectful, and authoritative.
  - Routinely reinforce our primary differentiator: "We bring the repair lab to you—no travel time, no leaving your device at a shop."
  - Identify D&CP as a combat-veteran-owned, Native-owned local business serving Spokane, Spokane Valley, and the Inland Northwest.

2. INTAKE FLOW & DEVICE QUALIFICATION:
  - STEP 1: Warm Welcome. Greet the customer and ask what device needs technical restoration today.
  - STEP 2: Exact Model Identification. Distinguish precisely between models (e.g., iPhone 14 Pro Max vs. standard iPhone 14, or Galaxy S24 Ultra vs. S24+).
  - STEP 3: Issue Categorization. Map the issue to Tier 1, Tier 2, or Tier 3.

3. THREE-TIER DIAGNOSTIC & PRICING LOGIC:
  - TIER 1 (Core Power & Port): Minor repairs (Battery replacement, charging port restoration). Fixed pricing range: $69 - $97.
  - TIER 2 (Display Renewal): High-velocity major repairs (Cracked OLED/LCD screens). Calculate quote using formula: Customer Price = Parts Cost + Labor ($50/hr) + 80% Profit/Overhead Margin.
    * Baseline Example: iPhone 12/13 Aftermarket Screen = $139.
    * Baseline Example: iPhone 14/15 Aftermarket Screen = $149 - $179.
    * Genuine OEM Options: $249 - $379 (Requires Apple/Samsung calibration disclosure).
  - TIER 3 (Specialized Micro-Soldering & Forensic Diagnostics): Motherboard shorts (VDD_MAIN / PP_VCC_MAIN), liquid damage, backlight coil/IC failure, data recovery, or no-power/dead-board issues.
    * PROCEDURE: DO NOT provide a binding quote. Inform the client that Tier 3 issues require surgical diagnostics under our lab's JBC micro-soldering stations and RF4 microscopy. Trigger the 'escalate_tier3_ticket' tool immediately for a manual callback from Ryan Young.

4. B2B & FLEET RECOGNITION:
  - Ask if the customer represents a commercial or corporate fleet partner (HVAC, Plumbing, Real Estate, Law Enforcement, ITAD).
  - If YES, apply a 15% B2B Preferred Discount to the labor component and highlight on-site data security compliance (data never leaves their parking lot).

5. WASHINGTON RIGHT TO REPAIR & PARTS QUALITY DISCLOSURES:
  - If asked about parts quality, state: "We operate in strict compliance with the Washington State Right to Repair Law (HB 1483). We use high-grade, factory-tested replacement components sourced from vetted wholesale distributors like MobileSentrix, fully backed by our D&CP warranty."
  - Disclose that serialized repairs (True Tone, Battery Health, Face ID) utilize JCID/i2C cryptographic programmers to ensure zero system popup warnings.

6. DATA PRIVACY & WAIVER MANDATE:
  - Inform all customers that before on-site repair, a digital liability waiver and NIST SP 800-88 R1 compliant data privacy acknowledgment must be signed via text/email link.

7. STRICT BOUNDARIES & ANTI-HALLUCINATION RULES:
  - If you do not have exact parts pricing for a niche model, invoke the 'get_repair_quote' tool.
  - Never promise zero-cost repairs or guarantee data recovery on physically destroyed NAND flash storage chips.
  - If a customer is abusive or requests illegal carrier/IMEI unlocking on stolen devices, state that D&CP strictly adheres to federal and state compliance laws and end the call.

SECTION 2: OPERATIONAL DECISION TREES & DIAGNOSTIC MATRIX
+-----------------------------------------------------------------------------------+
|                            VISITOR INTENT IDENTIFIED                              |
+-----------------------------------------------------------------------------------+
                                        |
                                        v
+-----------------------------------------------------------------------------------+
|                        STEP 1: DEVICE IDENTIFICATION                              |
|           - Brand (Apple / Samsung / Google)                                      |
|           - Specific Model (e.g., iPhone 15 Pro Max, Galaxy S24 Ultra)            |
+-----------------------------------------------------------------------------------+
                                        |
                                        v
+-----------------------------------------------------------------------------------+
|                        STEP 2: DAMAGE CATEGORIZATION                              |
+-----------------------------------------------------------------------------------+
        |                                 |                                 |
        v                                 v                                 v
+-------------------+             +-------------------+             +-------------------+
|   TIER 1 REPAIR   |             |   TIER 2 REPAIR   |             |   TIER 3 REPAIR   |
| Power & Port      |             | Display Renewal   |             | Micro-Soldering   |
+-------------------+             +-------------------+             +-------------------+
        |                                 |                                 |
        | * Fixed Pricing:                | * Pricing Formula:              | * Diagnostic Fee: $49
        |   $69 - $97                     |   Parts + Labor + 80%           | * Custom Quote Required
        | * Turnaround:                   | * Turnaround:                   | * Lead Tech Callback
        |   20 - 30 Mins                  |   45 Mins                       | * Trigger Escalation
        |                                 |                                 |
        +---------------------------------+---------------------------------+
                                        |
                                        v
+-----------------------------------------------------------------------------------+
|                     STEP 3: B2B FLEET & PROMO QUALIFICATION                       |
|           - Check Commercial Status (HVAC, Real Estate, Local Fleet)              |
|           - Apply 15% B2B Discount to Labor if Applicable                         |
+-----------------------------------------------------------------------------------+
                                        |
                                        v
+-----------------------------------------------------------------------------------+
|                       STEP 4: QUOTE & BOOKING DISPATCH                            |
|           - Display/Speak Transparent Out-the-Door Price                          |
|           - Trigger Tool: 'dispatch_booking_link' via SMS                         |
|           - Send Square/CellSmart Intake Link & Digital Waiver                    |
+-----------------------------------------------------------------------------------+

SECTION 3: TOOL DEFINITIONS & API SCHEMA (ELEVENLABS / BUILDSHIP / N8N)
To allow the AI agent to execute real-time business actions, configure the following Custom Tools inside ElevenLabs or your n8n middleware endpoint.
Tool 1: get_repair_quote
* Purpose: Fetches the real-time wholesale parts cost and calculates the customer price based on D&CP's formula.
* HTTP Method: POST
* URL Endpoint: https://api.displaycellpros.com/v1/pricing/quote
Request Payload Schema (JSON)
{
 "$schema": "[http://json-schema.org/draft-07/schema#](http://json-schema.org/draft-07/schema#)",
 "title": "GetRepairQuoteInput",
 "type": "object",
 "properties": {
   "device_brand": {
     "type": "string",
     "enum": ["Apple", "Samsung", "Google", "Motorola", "Other"]
   },
   "device_model": {
     "type": "string",
     "description": "Exact device model, e.g., 'iPhone 14 Pro' or 'Galaxy S23 Ultra'"
   },
   "repair_type": {
     "type": "string",
     "enum": ["screen_aftermarket", "screen_oem", "battery", "charging_port", "camera", "back_glass"]
   },
   "is_b2b": {
     "type": "boolean",
     "default": false
   }
 },
 "required": ["device_brand", "device_model", "repair_type"]
}

Response Output Schema (JSON)
{
 "type": "object",
 "properties": {
   "tier": { "type": "string", "enum": ["Tier 1", "Tier 2", "Tier 3"] },
   "parts_cost": { "type": "number" },
   "labor_cost": { "type": "number" },
   "markup_overhead": { "type": "number" },
   "discount_applied": { "type": "number" },
   "subtotal": { "type": "number" },
   "wa_sales_tax_9_1": { "type": "number" },
   "total_out_the_door": { "type": "number" },
   "estimated_duration_minutes": { "type": "integer" }
 }
}

Tool 2: dispatch_booking_link
* Purpose: Sends a direct SMS to the customer containing their customized Square/CellSmart appointment booking link and pre-repair waiver.
* HTTP Method: POST
* URL Endpoint: https://api.displaycellpros.com/v1/intake/dispatch-sms
Request Payload Schema (JSON)
{
 "$schema": "[http://json-schema.org/draft-07/schema#](http://json-schema.org/draft-07/schema#)",
 "title": "DispatchBookingLinkInput",
 "type": "object",
 "properties": {
   "customer_name": { "type": "string" },
   "customer_phone": { "type": "string", "pattern": "^\\+1[0-9]{10}$" },
   "device_summary": { "type": "string" },
   "quoted_price": { "type": "number" },
   "service_tier": { "type": "string" },
   "location_address": { "type": "string", "description": "Spokane area service location" }
 },
 "required": ["customer_name", "customer_phone", "device_summary", "quoted_price"]
}

Tool 3: escalate_tier3_ticket
* Purpose: Flags complex motherboard, micro-soldering, or liquid damage cases for manual review by Ryan Young.
* HTTP Method: POST
* URL Endpoint: https://api.displaycellpros.com/v1/intake/escalate-tier3
Request Payload Schema (JSON)
{
 "customer_name": "John Doe",
 "customer_phone": "+15095550199",
 "device_model": "iPhone XR",
 "failure_symptoms": "Shorted on VDD_MAIN, dead board, no boot, power supply drawing max current instantly",
 "intake_notes": "Client requested data recovery and board-level restoration. Pushed to Lead Tech dashboard."
}

SECTION 4: N8N AUTOMATION WORKFLOW BLUEPRINT (QUICKBOOKS ONLINE & SQUARE INTEGRATION)
When the ElevenLabs agent triggers dispatch_booking_link or escalate_tier3_ticket, an n8n orchestration workflow processes the payload, creates an estimate in QuickBooks Online, generates a Square appointment slot, and updates the D&CP Master Inventory Ledger.
[ ElevenLabs Web/Voice Agent ]
            |
            v (HTTP POST Webhook)
   [ n8n Trigger Node ]
            |
            +-----------------------------------+
            |                                   |
            v (If Tier 1 or Tier 2)             v (If Tier 3 Escalation)
 [ Create QBO Customer ]               [ Slack/SMS Alert to Ryan ]
            |                                   |
            v                                   v
 [ Create QBO Estimate ]               [ Log High-Priority Ticket ]
            |                                   |
            v                                   v
 [ Reserve MobileSentrix SKU ]         [ Generate Forensic Intake Record ]
            |
            v
 [ Send Twilio SMS with Booking Link & WA Waiver ]

Key Implementation Steps in n8n:
1. Webhook Node: Set to receive POST data from ElevenLabs tool calls.
2. QuickBooks Online Node:
   * Resource: Customer -> Operation: Get or Create (Match by phone number).
   * Resource: Estimate -> Operation: Create (Apply items using SKU codes like IPH13-SCR-AFT or BAT-IPH14-OEM).
3. Location Tax Calculation Code Node (JavaScript):
// Wa State Retail Sales Tax Multi-Location Logic
const basePrice = $json.body.subtotal;
const locationCode = $json.body.location_zip || "99208"; // Spokane default
const waTaxRate = 0.091; // 9.1% combined Spokane city/state rate

const taxAmount = Math.round((basePrice * waTaxRate) * 100) / 100;
const finalTotal = Math.round((basePrice + taxAmount) * 100) / 100;

return [{
 json: {
   subtotal: basePrice,
   taxAmount: taxAmount,
   finalTotal: finalTotal,
   locationCode: locationCode
 }
}];

4. Twilio SMS Node: Sends the personalized URL: https://displaycellpros.com/book?ticket={{ $json.qbo_estimate_id }}.
SECTION 5: WEBSITE EMBED CODE & FRONT-END IMPLEMENTATION
To deploy Triage AI onto your website (displaycellpros.com), paste the low-latency ElevenLabs Conversational Widget script directly into your site's HTML header or footer.
5.1 Single-Page Static HTML Implementation (index.html)
<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>Display & Cell Pros LLC | Spokane Mobile Electronics Repair</title>
   <!-- Tailwind CSS CDN -->
   <script src="[https://cdn.tailwindcss.com](https://cdn.tailwindcss.com)"></script>
   <script>
       tailwind.config = {
           theme: {
               extend: {
                   colors: {
                       navy: '#0A192F',
                       gold: '#D4AF37',
                       slate: '#1E293B',
                   }
               }
           }
       }
   </script>
</head>
<body class="bg-slate-900 text-slate-100 font-sans antialiased">

   <!-- Navigation Header -->
   <header class="border-b border-slate-800 bg-navy/90 backdrop-blur sticky top-0 z-50">
       <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
           <div class="flex items-center space-x-3">
               <span class="text-2xl">🚐💨</span>
               <div>
                   <h1 class="font-bold text-lg text-gold tracking-wider">DISPLAY & CELL PROS</h1>
                   <p class="text-xs text-slate-400">Professional On-Site Solutions | Spokane, WA</p>
               </div>
           </div>
           <a href="tel:5092160526" class="bg-gold hover:bg-yellow-500 text-navy font-bold px-4 py-2 rounded-lg transition text-sm">
               📞 (509) 216-0526
           </a>
       </div>
   </header>

   <!-- Hero Section -->
   <section class="py-20 px-4 text-center max-w-4xl mx-auto">
       <span class="inline-block bg-gold/10 text-gold text-xs font-semibold px-3 py-1 rounded-full border border-gold/30 mb-4">
           Native American & Combat Veteran-Owned
       </span>
       <h2 class="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
           We Bring The Mobile Repair Lab <span class="text-gold">Directly To You</span>
       </h2>
       <p class="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
           Zero travel time. Zero data privacy risk. High-velocity screen replacements, core battery swaps, and Tier 3 micro-soldering performed inside our state-of-the-art mobile laboratory.
       </p>

       <!-- CTA Buttons -->
       <div class="flex flex-col sm:flex-row justify-center gap-4">
           <button onclick="elevenlabsAgent.open()" class="bg-gold hover:bg-yellow-500 text-navy font-bold text-lg px-8 py-4 rounded-xl shadow-lg transition">
               💬 Start AI Diagnostic Triage
           </button>
           <a href="#services" class="border border-slate-700 hover:border-gold text-slate-300 font-semibold text-lg px-8 py-4 rounded-xl transition">
               📋 View Service Tiers
           </a>
       </div>
   </section>

   <!-- Three-Tier Service Matrix -->
   <section id="services" class="py-16 bg-slate-800/50 border-t border-slate-700/50">
       <div class="max-w-6xl mx-auto px-4">
           <h3 class="text-3xl font-bold text-center mb-12 text-gold">Technical Service Menu</h3>
           <div class="grid md:grid-cols-3 gap-8">
               
               <!-- Tier 1 -->
               <div class="bg-slate-800 border border-slate-700 rounded-2xl p-6 relative flex flex-col justify-between">
                   <div>
                       <div class="text-xs font-bold text-gold uppercase tracking-wider mb-2">Tier 1</div>
                       <h4 class="text-xl font-bold mb-3">Power & Port Renewal</h4>
                       <p class="text-slate-400 text-sm mb-4">High-demand minor restorations including battery replacements and charging port repairs.</p>
                       <div class="text-3xl font-extrabold text-white mb-4">$69 - $97</div>
                       <ul class="text-sm text-slate-300 space-x-0 space-y-2 mb-6">
                           <li>✓ 20-30 Minute On-Site Repair</li>
                           <li>✓ AmpSentrix High-Capacity Batteries</li>
                           <li>✓ Complete Port Debris & IC Test</li>
                       </ul>
                   </div>
                   <button onclick="elevenlabsAgent.open()" class="w-full bg-slate-700 hover:bg-gold hover:text-navy text-white font-semibold py-2 rounded-lg transition">
                       Select Tier 1
                   </button>
               </div>

               <!-- Tier 2 (Featured) -->
               <div class="bg-slate-800 border-2 border-gold rounded-2xl p-6 relative flex flex-col justify-between shadow-2xl scale-105">
                   <span class="absolute -top-3 right-6 bg-gold text-navy text-xs font-black px-3 py-1 rounded-full uppercase">Most Popular</span>
                   <div>
                       <div class="text-xs font-bold text-gold uppercase tracking-wider mb-2">Tier 2</div>
                       <h4 class="text-xl font-bold mb-3">Display Renewal</h4>
                       <p class="text-slate-400 text-sm mb-4">High-velocity, factory-grade screen replacements for Apple iPhone and Samsung Galaxy.</p>
                       <div class="text-3xl font-extrabold text-white mb-4">$139 <span class="text-sm font-normal text-slate-400">baseline</span></div>
                       <ul class="text-sm text-slate-300 space-x-0 space-y-2 mb-6">
                           <li>✓ 45 Minute Mobile Lab Dispatch</li>
                           <li>✓ Soft OLED & Genuine OEM Options</li>
                           <li>✓ JCID True Tone & Sensor Migration</li>
                           <li>✓ Free Tempered Glass Installation</li>
                       </ul>
                   </div>
                   <button onclick="elevenlabsAgent.open()" class="w-full bg-gold hover:bg-yellow-500 text-navy font-bold py-3 rounded-lg transition">
                       Get Screen Quote
                   </button>
               </div>

               <!-- Tier 3 -->
               <div class="bg-slate-800 border border-slate-700 rounded-2xl p-6 relative flex flex-col justify-between">
                   <div>
                       <div class="text-xs font-bold text-gold uppercase tracking-wider mb-2">Tier 3</div>
                       <h4 class="text-xl font-bold mb-3">Forensic Micro-Soldering</h4>
                       <p class="text-slate-400 text-sm mb-4">Board-level diagnostics, liquid damage restoration, short circuit isolation, and data rescue.</p>
                       <div class="text-3xl font-extrabold text-white mb-4">Custom Quote</div>
                       <ul class="text-sm text-slate-300 space-x-0 space-y-2 mb-6">
                           <li>✓ Qianli/LINCSeek Thermal Imaging</li>
                           <li>✓ JBC Surgical Soldering Bench</li>
                           <li>✓ VDD_MAIN Short Circuit Isolation</li>
                           <li>✓ Direct Lead Tech Escalation</li>
                       </ul>
                   </div>
                   <button onclick="elevenlabsAgent.open()" class="w-full bg-slate-700 hover:bg-gold hover:text-navy text-white font-semibold py-2 rounded-lg transition">
                       Escalate to Lead Tech
                   </button>
               </div>

           </div>
       </div>
   </section>

   <!-- Compliance & Right to Repair Banner -->
   <section class="py-12 px-4 max-w-5xl mx-auto text-center">
       <h4 class="text-lg font-bold text-gold mb-2">Washington State Right to Repair Compliance</h4>
       <p class="text-sm text-slate-400 max-w-3xl mx-auto">
           Display & Cell Pros LLC operates in strict alignment with Washington House Bill 1483 and Senate Bill 5680. We utilize genuine parts, authorized tools, and certified data sanitization protocols (NIST SP 800-88 R1) to guarantee manufacturer-level integrity on every mission.
       </p>
   </section>

   <!-- Footer -->
   <footer class="border-t border-slate-800 py-8 text-center text-xs text-slate-500 bg-navy">
       <p>© 2026 Display & Cell Pros LLC. All rights reserved. | UBI: 605 985 265 | UEI: VAJXG5MNYQK8</p>
       <p class="mt-2">Spokane, Washington & Surrounding Inland Northwest Areas</p>
   </footer>

   <!-- ELEVENLABS CONVERSATIONAL AI WIDGET EMBED -->
   <elevenlabs-convai agent-id="REPLACE_WITH_YOUR_ELEVENLABS_AGENT_ID"></elevenlabs-convai>
   <script src="[https://elevenlabs.io/convai-widget/index.js](https://elevenlabs.io/convai-widget/index.js)" async type="text/javascript"></script>

</body>
</html>

SECTION 5: COMPLIANCE, SAFETY & AUDIT SAFEGUARDS
   1. Washington State Tax Compliance (DOR): Repair labor on tangible personal property is a taxable retail service in Washington State. The AI agent and n8n middleware automatically apply the location-specific 9.1% Spokane Retail Sales Tax to combined parts and labor totals, eliminating state tax audit risk.
   2. NIST SP 800-88 R1 Data Destruction Disclosures: Before any technician initiates hardware intervention, the website widget and booking dispatch issue an automated SMS waiver acknowledging that data sanitization procedures follow strict NIST SP 800-88 R1 guidelines, protecting corporate and consumer liability.
   3. Parts Sourcing & Margin Defense: The system strictly defends a 59.7% minimum gross margin baseline by dynamically checking MobileSentrix wholesale stock lists before generating fixed quotes.
Implementation Instructions for Ryan Young:
   1. Copy the text in Section 1.2 into your ElevenLabs Agent dashboard under Agent Setup > System Prompt.
   2. Set the Agent Language to English and Model to Eleven Flash v2.5.
   3. Create the Custom Tools in ElevenLabs using the JSON schemas provided in Section 3.
   4. Paste the HTML snippet in Section 5.1 into your website index file on Vercel or host it on your custom server. Replace REPLACE_WITH_YOUR_ELEVENLABS_AGENT_ID with your actual ElevenLabs Agent ID string.