# Deployment Preparation: Final Manual Steps

The project build is currently stabilized after major dependency upgrades and configuration fixes. The following manual steps are required to resolve the remaining 3 TypeScript errors before successful deployment.

## 1. Fix Component Imports [DONE]
The components were failing to import constants because they were attempting to import from `src/lib/constants` (a file that does not exist or has no exports) instead of `src/lib/constants.tsx` or `src/lib/ui-constants`.

- **Action Taken:** Updated imports in `www.displaycellpros.com-refractored` to use the correct paths.

## 2. Resolve Vercel Auth OIDC Import [IN PROGRESS]
The build was failing because `createSigner` is not found on `@vercel/functions/oidc`.

- **Action:** Review the `@vercel/functions` library documentation to verify the correct import path and usage for the `createSigner` function in the currently installed version (`^3.7.6`). Update the import in line 25 accordingly. Note: For AWS OIDC, use `@vercel/oidc-aws-credentials-provider`.

## 3. Resolve Prisma Client Generation [DONE]
The build failed with `Type error: Module '"@prisma/client"' has no exported member 'PrismaClient'`.

- **Action Taken:** Restored `url = env("DATABASE_URL")` to `prisma/schema.prisma` and updated `prisma.config.ts` to explicitly map the datasource. This ensures the Prisma CLI can correctly identify the provider and generate the types during the build phase.
- **Action Taken:** Added `prisma generate` to the `build` script in `package.json`.

## 4. Final Deployment
Once the above steps are completed:
1. Run `npx tsc --noEmit` to verify 0 errors.
2. Run `npm run build` to verify production build success.
3. Deploy to Vercel:
   ```bash
   npx vercel --prod
   ```
