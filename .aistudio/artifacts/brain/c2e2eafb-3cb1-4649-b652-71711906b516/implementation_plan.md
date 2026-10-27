# Restructure Top Header Bar for Soft Operation Hours & Drop-Off

Restructure the global top header announcement bar across all pages to communicate soft operational hours (Wednesday through Friday, 10:00 AM – 4:00 PM PST), 24/7 lockbox drop-off availability at the Spokane Monroe St location, and wire interactive action CTAs.

## User Review & Critical Decisions

> [!IMPORTANT]
> - **Confirmed Address**: `PO Box 1308 6325 N Monroe St. Spokane, WA 99208`
> - **Positioning**: Global persistent top announcement bar placed above the primary navigation across all pages (`LayoutWrapper.tsx`).
> - **Primary CTA Behavior**: The "Schedule Soft Intake" button will directly open the interactive repair intake booking modal.
> - **Secondary CTAs**:
>   - **GPS Check**: Direct link to Google Maps with the confirmed Monroe St location.
>   - **Google Calendar**: Direct link / event booking shortcut for the customer's intake slot.

---

## 1. Overview & Core Concept

- **What It Does**: Provides an unmissable, responsive top notification bar communicating the current temporary operational status ("Soft Operation Active"), operational window (Wed–Fri | 10:00 AM – 4:00 PM PST), 24/7 lockbox drop-off notice, and one-click actions.
- **Target Audience**: Spokane customers needing urgent drop-offs or mobile repairs who need immediate clarity on when the lab is open for in-person intake.
- **Key Value**: Sets accurate customer expectations, prevents missed drop-offs, and provides immediate paths to book soft intake or navigate to the Spokane facility.

---

## 2. User Experience & Visual Design

- **Visual Tone**: Technical amber warning status (`#F59E0B` / `bg-amber-500/10 border-amber-500/30 text-amber-300`) denoting soft operations without sounding alarmist or broken.
- **Layout Rhythm**:
  - Horizontal single-line strip on desktop (`h-10` or `py-2`) with subtle dot dividers (`·`).
  - Gracefully wraps or condenses on mobile viewports so it never pushes content off-screen.
- **Interactive Triggers**:
  - `Schedule Soft Intake`: Dispatches modal opening event to `AIAssistantModalManager` or the repair booking modal.
  - `GPS Check`: Direct link opening Google Maps pin for `6325 N Monroe St, Spokane, WA 99208`.
  - `Google Calendar`: Opens quick appointment addition / Google Calendar event template.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Standalone Reusable Component vs Inlined HTML**
  - *Chosen Approach*: Create a dedicated `TopAnnouncementBar.tsx` component in `src/components/` and render it inside `LayoutWrapper.tsx`.
  - *Why*: Ensures uniform appearance on every route (`/`, `/services`, `/store`, `/b2b`, `/lab`) with consistent event handling and no copy-paste duplication.
- **Decision 2: Mobile Viewport Optimization**
  - *Chosen Approach*: Priority truncation and stacked or scrollable micro-CTAs on screens under 640px to respect the 15% mobile sticky ceiling.
  - *Why*: Guarantees that mobile visitors can still see the hero headline and main booking buttons without being dominated by the top bar.

---

## 4. Technical Architecture & Component Flow

```
┌────────────────────────────────────────────────────────┐
│               TopAnnouncementBar                       │
│  [⚡ SOFT OPERATION ACTIVE] · [📍 6325 N Monroe St]    │
│  · [24/7 Lockbox Active]  [GPS] [Schedule] [Calendar]  │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│               Global Header / Navbar                   │
│   DisplayCellPros  ───  Nav Links  ───  Book Mission   │
└────────────────────────────────────────────────────────┘
```

- **Component Creation**: `src/components/TopAnnouncementBar.tsx`
  - Amber status badge with glowing pill indicator.
  - Truncatable address link with map pin.
  - Lockbox notice with secure lock icon.
  - Action buttons with clean hover transitions.
- **Integration**:
  - Mount inside `src/components/LayoutWrapper.tsx` at the top of the body tree.
  - Update `src/components/new_design/Header.tsx` or coordinate fixed offsets so the navigation floats smoothly beneath the announcement bar.
- **Verification**:
  - Test responsive layout at 1440px desktop and 375px mobile viewports.
  - Validate click handlers and compilation via `compile_applet`.
