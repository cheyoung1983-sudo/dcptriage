# Implementation Plan: Diagnostics Hub Restoration & Global Cleanup

The goal is to restore the complete "Diagnostics Hub" (Triage AI) using Vercel best practices, remove all Google/Firebase dependencies, and clean up the repository of non-essential legacy files.

## User Review Required

> [!IMPORTANT]
> **Repository Cleanup:** I am deleting several legacy sub-directories (`ai-text-demo`, `cb001`, `functions`, etc.) and root executables to consolidate the project into a clean Next.js structure.
>
> **Domain Removal:** I am removing the `triage.displaycellpros.com` domain from Vercel as it is no longer required.
>
> **Secrets Update:** I will apply the provided OpenAI API key to your Vercel production environment.

## Proposed Changes

### [Vercel Configuration]

#### [MODIFY] [vercel.json](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/vercel.json)
- Fix the missing comma in the JSON structure (already fixed in buffer).
- Ensure `crons` and `redirects` are correctly defined for the Next.js framework.

#### [ACTION] Remove Redundant Domain
- Run `vercel domains rm triage.displaycellpros.com --yes`.

#### [ACTION] Update OpenAI Key
- Sync the provided OpenAI key (`sk-proj-...`) to Vercel production.

### [Diagnostics Hub Restoration]

#### [MODIFY] [src/app/lab/page.tsx](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/src/app/lab/page.tsx)
- Replace mock handlers with real logic for:
  - **AI Diagnostics:** Connecting to `/api/triage`.
  - **Tax Lookup:** Connecting to `/api/tax-lookup`.
  - **Quote Generation:** Integrating with `calculateQuoteInternal` and `/api/generate-quote`.
  - **WebUSB/Hardware Probing:** Restoring the physical scan logic for the driveway lab.

### [Global Repository Cleanup]

#### [DELETE] Legacy Folders & Files
- **Directories:** `ai-text-demo/`, `cb001/`, `cb7001/`, `cb7002/`, `dcp67/`, `dcpkode9/`, `dcp-static/`, `dcp-static-cb/`, `functions/`, `my-nextjs-project/`, `shopify-storefront/`.
- **Root Files:** `.env.vercel.refractored`, `pemhttpd.exe`, all `postgresql_*.exe`, `edb_*.exe`, `postgis_*.exe`.

## Verification Plan

### Automated Tests
- Run `npm run build` locally to ensure the project compiles without legacy baggage.
- Verify `npx tsc --noEmit` passes.

### Manual Verification
- Deploy to Vercel and verify the Lab Portal (`/lab`) is fully functional.
- Confirm the `triage` subdomain is no longer active.
