# Customer estimates: server quote adapter

## Stack / review order

This branch is based on PR #8 (`feat/pricing-quote`, 096c820) and targets that
branch while #8 is open. It must not be merged ahead of #8. After #8 merges,
retarget this PR to `main` and rerun checks (resolve any squash-base conflicts
normally; no force push). PR #7 supplies the secret guard and CI workflow; merge
it first when separately authorized. The scanner included here is an unchanged
copy from #7 so the existing pre-commit hook also works on this stacked branch.
No existing PR, deployment, DNS, credential, or live agent configuration is changed.

## Behavior

- Both `IntakeForm` and `RepairEstimateCalculator` request the same browser route,
  `POST /api/pricing/customer-quote`, using an explicit repair type, device model,
  selected service tier, and mobile-service choice. No guessed battery/screen
  substitution is made from a broad tier.
- The browser adapter calls #8's `quoteTool` directly. It does not call the
  protected agent HTTP endpoint or read/forward the ElevenLabs webhook secret.
  `POST /api/pricing/quote` authentication and its contract are unchanged.
- Confirmed Shopify cost uses the existing V4 engine: `ceil(cost * 1.8 + 75)`.
  Mobile service adds the separate $25 trip fee. The public adapter whitelists
  repair price, trip fee, total, currency, tax exclusion, availability, and ticket
  identifier. Wholesale values, cost metadata, and tool instructions are omitted.
- The legacy UI formula, model surcharges, hard-coded parts/labor breakdown,
  automatic rush/data-recovery fees, and ZIP-based estimated tax are removed from
  these two screens. Tax is explicitly excluded, not replaced with a new tax rule.
  Rush service needs technician confirmation; data recovery remains Tier 3.
- Tier 3, a reported board short, and Tier 3/unknown symptom classification receive
  manual review without an amount. This is a manual-review state, **not** an
  automatic Slack escalation or scheduled callback. The authenticated escalation
  tool remains unchanged.
- The shared hook debounces 400 ms, aborts superseded requests, ignores late
  responses, and clears obsolete amounts when inputs change. Errors and missing
  prices have no numeric fallback. Drafts preserve the selected repair/mobile
  choice; old local-history fabricated totals are no longer displayed.

## Security / operational requirements

The browser route requires an exact matching `Origin`, rejects cross-site fetch
metadata and non-JSON bodies, strictly validates fields, limits body size to 16
KiB, and returns no-store responses. Same-origin is a browser isolation measure,
not authentication against scripts that can forge headers.

Redis-backed limits are 10 requests per client per 60-second fixed window and
120 requests aggregate per window. Missing Redis configuration or Redis errors
fail closed. Client keys use the existing trusted-proxy/IP helper; deploy behind
Vercel's trusted forwarding headers (or equivalent sanitized proxy headers).
Existing fixed-window boundary bursts remain possible. No credentials are added.

Flow must supply the existing Shopify Admin and Upstash configuration before live
quotes work. The canonical service persists a quote ticket for each completed
lookup (including unconfirmed prices), so debounced customer lookups incur Redis
traffic and ticket storage; limits bound but do not eliminate this traffic.

`/api/intake/sync` is referenced by the existing form but is not implemented in
this checkout. This PR does not add checkout/order submission, public automatic
escalation, an SMS flow, or repair other pre-existing endpoints. Estimates must
not be interpreted as a completed booking or invoice.

## Verification

- `npm test -- --runInBand`: existing pricing/auth tests plus browser-route and
  real-screen/shared-hook regression tests; Shopify/Redis/agent calls mocked.
- `npm run lint`: TypeScript (`tsc --noEmit`).
- `npm run build`: Prisma generation and Next production build.
- `node scripts/check-secrets.mjs` and `--staged`: scan values without printing them.

Tests cover rounding via the existing engine suite, mobile/non-mobile agreement
with the protected agent route, Tier 3/unknown/short safety, invalid fields and
oversized bodies, origin/content-type checks, both rate limits, configuration
fail-closed behavior, auth isolation, sanitized errors, public-field whitelisting,
loading/failure/manual states, stale responses, and both actual estimate screens.
Real live Shopify/Redis integrations and visual browser/device QA are not exercised.
