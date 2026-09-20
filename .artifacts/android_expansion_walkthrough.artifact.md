# Specific Walkthrough: Android Expansion & Identity Bridging

This guide provides the exact technical steps required to bridge the **Display & Cell Pros Diagnostic Hub** from a Vercel-native web application into a verified, self-signed Android ecosystem.

## Phase 1: Security & Signing (The Foundation)

Before any native code is written, you must establish "Mobile Readiness" in your Firebase infrastructure to authorize your Android builds.

### 1. Generate Your Identity Fingerprints
You need to extract the unique SHA-1 codes from your Java Keystore. This is how Google verifies that the incoming request is actually coming from *your* app.

*   **Action**: Run the following in your local Windows terminal:
    ```bash
    keytool -list -v -alias androiddebugkey -keystore %USERPROFILE%\.android\debug.keystore
    ```
*   **Result**: Copy the `SHA1` value (e.g., `DA:39:A3:EE...`).
*   **Compliance**: Navigate to the [Lab Portal](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/src/components/OAuthDocumentationPanel.tsx) and paste this into the **SHA-1 (DEBUG)** field for internal tracking.

### 2. Lock the Production Certificate
When you're ready for the Play Store, you'll use your `production.jks` file.
*   **Command**:
    ```bash
    keytool -list -v -alias <your-key-name> -keystore <path-to-production-keystore>
    ```
*   **Result**: Paste the production SHA-1 into the **SHA-1 (RELEASE)** field in the Lab.

## Phase 2: Firebase Project Alignment

### 1. Register the Android Client
1.  Go to **Project Settings** in your [Firebase Console](https://console.firebase.google.com/project/displaycellpros-com).
2.  Click **Add app > Android**.
3.  **Package Name**: Use `com.displaycellpros.app`.
4.  **SHA-1**: Paste the fingerprint from Phase 1.
5.  **Download**: Save `google-services.json` to your secure infrastructure folder.

### 2. Enable Google SSO for Mobile
> [!IMPORTANT]
> Google Sign-In on Android will **FAIL** with a `12500` error if the SHA-1 Release fingerprint is missing from the console. This is the most common cause of mobile auth failure.

## Phase 3: Hybrid Identity Bridge

Our architecture uses a "Hybrid" model to maintain high performance and cross-platform flexibility.

| Feature | Web (Active) | Android (Expansion) |
| :--- | :--- | :--- |
| **Identity** | Auth.js (GitHub/Email) | Firebase SDK (Google/Email Link) |
| **Logic** | [Vercel Edge](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/api/triage.ts) | Firebase Functions / Vercel API |
| **Database** | [AWS RDS (Postgres)](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/api/lib/db.ts) | [Neon (Vercel Storage)](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/api/lib/db.ts) |

### 1. Token Exchange Flow
To allow the Android app to talk to your Vercel serverless functions:
1.  The Android app authenticates via Firebase.
2.  It retrieves a `JWT` (ID Token).
3.  The app sends this token in the `Authorization: Bearer <token>` header to your `/api` routes.
4.  Your [middleware.ts](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/middleware.ts) validates the token using the Firebase Admin logic.

## Phase 4: Bot Protection (reCAPTCHA Enterprise)

### 1. Register Android Key
1.  In the Google Cloud Console, create a new reCAPTCHA Enterprise key specifically for **Android**.
2.  Add your package name (`com.displaycellpros.app`) to the allowed list.
3.  **Sync**: Update your [.env](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/.env) with the Android-specific site key when deploying the mobile shell.

> [!TIP]
> Use the **"Active Pair Locked"** indicator in your Lab Portal to verify that your reCAPTCHA secrets are synchronized across platforms.

---

**Expansion Status**: **Mobile Signal READY**. All structural requirements for Phase 1 and 2 are currently implemented in your web backend.
