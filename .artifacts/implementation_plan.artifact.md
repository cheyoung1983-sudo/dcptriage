# Fix Build Errors and Align with Professional Standards

The project is currently failing to build on Vercel due to module resolution errors. Additionally, there are violations of the established professional standards (use of `any` types, improper import patterns).

## User Review Required

> [!IMPORTANT]
> I am proposing to rename `src/lib/constants.tsx` to `src/lib/ui-constants.tsx` to resolve a name conflict with `src/lib/constants.ts`. This will require updating all references to this file.

> [!WARNING]
> There are duplicate `components` and `lib` directories in both the root and `src/`. I will prioritize using the files in `src/` as they are aligned with the Next.js App Router structure.

## Proposed Changes

### [Cleanup & Resolution]

#### [RENAME] [constants.tsx](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/src/lib/constants.tsx) -> [ui-constants.tsx](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/src/lib/ui-constants.tsx)
Renaming to avoid conflict with `constants.ts` (which contains auth tokens).

#### [MODIFY] [ServicesView.tsx](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/src/components/ServicesView.tsx)
- Update import from `@/lib/constants.tsx` to `@/lib/ui-constants`.
- Remove any potential `any` types.

#### [MODIFY] [StoreView.tsx](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/src/components/StoreView.tsx)
- Update import from `@/lib/constants.tsx` to `@/lib/ui-constants`.

#### [MODIFY] [page.tsx](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/src/app/auth/signin/page.tsx)
- Verify and fix `SignInButton` import resolution.

#### [MODIFY] [page.tsx](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/src/app/comments/page.tsx)
- Fix `@/lib/db` import resolution.
- Define `Comment` interface and remove `any`.

#### [MODIFY] [db.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/src/lib/db.ts)
- Remove `any` from `signerOptions` and `query` arguments.
- Define proper types for DB configuration.

## Verification Plan

### Automated Tests
- Run `npm run lint` (which triggers `tsc --noEmit`) to verify type safety and resolution.
- Run `next build` locally (if possible) to simulate the Vercel build.

### Manual Verification
- Verify that the Services and Store pages still render correctly with the renamed constants file.
