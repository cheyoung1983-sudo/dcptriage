# Remote Pull and Clean Rebuild Plan

A structured workflow to initialize git in the workspace, connect to `cheyoung1983-sudo/dcptriage`, pull and merge remote source updates while preserving local Next.js 15 stability patches, and execute a clean rebuild.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following parameters were confirmed during the interactive clarification phase:

- **Confirmed Decision 1**: Target remote source is `cheyoung1983-sudo/dcptriage`.
- **Confirmed Decision 2**: Merge remote changes into the workspace while keeping local Next.js 15 compatibility fixes (error boundaries, webpack configuration, and `patch-next.cjs`).
- **Confirmed Decision 3**: Full clean rebuild execution pipeline: clear cached artifacts, run Prisma generation, apply patch script, and compile Next.js production build (`npm run build`).

---

## 1. Overview & Core Concept

- **What It Does**: Establishes local git tracking for `https://github.com/cheyoung1983-sudo/dcptriage.git`, fetches and integrates incoming commits/files from the remote branch, protects local App Router error boundary and Webpack devtools fixes from being overwritten, and runs a comprehensive compilation and lint check.
- **Target Audience**: Development operations and production triage workstation.
- **Key Value**: Synchronizes latest upstream source logic from the GitHub repository into the AI Studio environment without breaking build stability.

---

## 2. User Experience & Visual Design

- **Status Feedback**: Build and pull results will be logged clearly with commit hashes, updated files, and build verification status.
- **Workstation UI Continuity**: Preserves dark tactical UI styling (`bg-slate-950`, high-contrast telemetry headers, diagnostics console).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Git Remote Initialization & Auth Strategy**
  - *Chosen Approach*: Initialize `.git` in `/app/applet`, configure safe directory, set remote origin to `cheyoung1983-sudo/dcptriage`, configure credentials using the configured GitHub access token, and fetch remote branches.
  - *Why*: Allows proper version control synchronization and avoids authentication failures on private repositories.

- **Decision 2: Merge with Local Patch Preservation**
  - *Chosen Approach*: Fetch remote branches into a tracking branch, diff/merge changes into workspace, ensuring local fixes in `scripts/patch-next.cjs`, `next.config.js`, `tsconfig.json`, `src/app/global-error.tsx`, `src/app/error.tsx`, and `src/app/not-found.tsx` remain intact.
  - *Why*: Direct unmerged overwrite would reintroduce the Next.js 15 `__webpack_modules__[moduleId] is not a function` error and static generation build failures.

- **Decision 3: Full Clean Rebuild**
  - *Chosen Approach*: Execute `rm -rf .next && npx prisma generate && node scripts/patch-next.cjs && npm run build`.
  - *Why*: Guarantees fresh Prisma client generation and clean route manifests without stale webpack cache artifacts.

---

## 4. Technical Architecture & Execution Sequence

```
┌────────────────────────────────────────────────────────┐
│               1. Git Remote Setup & Auth               │
│  - Init git in /app/applet                             │
│  - Set remote origin cheyoung1983-sudo/dcptriage       │
│  - Configure auth & fetch remote branch                │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│            2. Merge Remote Source Changes              │
│  - Integrate remote updates                            │
│  - Verify/preserve Next.js 15 patches & boundaries     │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             3. Clean Build & Verification              │
│  - Clear stale .next cache                             │
│  - Run Prisma client generation                        │
│  - Execute node scripts/patch-next.cjs                 │
│  - Run compile_applet (npm run build) & lint_applet    │
│  - Restart dev server                                  │
└────────────────────────────────────────────────────────┘
```

- **Execution Steps**:
  1. Initialize git repository in workspace and link remote `origin`.
  2. Fetch remote `main` branch from `cheyoung1983-sudo/dcptriage`.
  3. Merge remote changes, confirming critical patch files are intact.
  4. Run clean build and verification (`lint_applet` and `compile_applet`).
  5. Restart dev server to serve the refreshed application.
