# Integration Finalization Plan

This plan outlines the steps to finalize and secure the configured integrations for the application, based on the user's requirement to keep all current services.

## User Review & Critical Decisions

> [!IMPORTANT]
> The focus is on environment variable validation and ensuring all required services are properly connected via the server-side proxy or SDK initialization.

- **Confirm**: We will validate all integrations (Firebase, OpenAI, AWS RDS, AWS Cloudfront, reCAPTCHA, Edge Config).
- **Confirm**: We will ensure no secrets are exposed in client-side code, routing all sensitive calls through `/api/*` or server-side functions.

### 1. Overview & Core Concept

- **Goal**: Ensure all declared integrations are operational, secured, and properly configured for a production environment.
- **Scope**: Firebase, OpenAI (both SDKs), AWS RDS (Postgres), AWS CloudFront/IAM, reCAPTCHA, Vercel Edge Config.

### 2. Finalization Checklist

#### A. Firebase (Auth/Firestore)
- [ ] Verify `VITE_FIREBASE_...` variables are correctly mapped to client-side Firebase initialization.
- [ ] Ensure Firestore rules are deployed.

#### B. OpenAI (Dual SDKs)
- [ ] Ensure `OPENAI_API_KEY` is ONLY used in server-side routes (`/api/*`).
- [ ] Verify both `@openai/codex-sdk` and `@ai-sdk/openai` are scoped to their respective server-side handlers.

#### C. AWS RDS (Postgres)
- [ ] Validate `PGHOST`, `PGUSER`, `PGPASSWORD`, etc., are securely injected via environment variables and NOT hardcoded.
- [ ] Confirm Prisma client connects securely (SSL required).

#### D. AWS CloudFront / IAM OIDC
- [ ] Ensure `AWS_ROLE_ARN` and IAM configuration allow the app to authenticate with CloudFront.

#### E. Google reCAPTCHA Enterprise
- [ ] Validate both site key (client) and secret key (server) are correctly implemented.

#### F. Vercel Edge Config
- [ ] Verify `EDGE_CONFIG` is set and accessible via the `@vercel/edge-config` SDK.

### 3. Execution Plan

1.  **Environment Audit**: Create a comprehensive `.env.example` validation.
2.  **Server-Side Routing**: Audit all API routes to ensure they proxy sensitive requests correctly.
3.  **Client-Side Security**: Audit all client-side code to ensure `process.env.NEXT_PUBLIC_` is used appropriately and no server secrets are leaked.
4.  **Integration Health Checks**: Implement/verify health check routes for key services.
