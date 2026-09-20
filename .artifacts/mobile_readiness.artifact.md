# Mobile Readiness Strategy - Android & iOS

This document outlines the requirements and procedures for expanding the **Display & Cell Pros Diagnostic Hub** into native mobile environments.

## Native Application Signing (Android)

To link a native Android application (or a Trusted Web Activity) to our Firebase backend, the application must be "self-signed" with a valid certificate. This ensures that only authorized builds can access sensitive repair data.

> [!IMPORTANT]
> **Google Sign-In Requirement**: To enable Google Sign-In for your Android apps, you **must** provide the **SHA-1 release fingerprint** for each app in the Firebase Console (Project Settings > Your apps).

### 1. Generate SHA-1 Fingerprints
Use the Java `keytool` utility to extract the SHA-1 fingerprints from your keystore.

> [!TIP]
> **Troubleshooting 'keytool' not recognized**: If you get a "term 'keytool' is not recognized" error, you can use the version bundled with Android Studio by using the full path:
> `& "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe" -list -v ...`

> [!IMPORTANT]
> **Keystore Security**: Keep your `.jks` or `.keystore` files in a secure offline location. Never commit them to version control.

#### Release Fingerprint (Production)
```bash
keytool -list -v -alias <your-key-name> -keystore <path-to-production-keystore>
```

#### Debug Fingerprint (Development)
**Windows**:
```bash
SHA1: F8:EC:58:A4:D1:D4:AB:00:59:E6:93:45:44:1B:5A:CD:CD:86:64:0E
```
*Note: Generated on 2026-07-19.*

### 2. Register with Firebase
1. Open the [Firebase Console](https://console.firebase.google.com/project/displaycellpros-com/settings/general).
2. Under "Your apps," click **Add app** and select the **Android** platform.
3. Enter your package name (e.g., `com.displaycellpros.app`).
4. Paste the **SHA-1 fingerprint** generated above.
5. Download `google-services.json` and place it in your app's `app/` directory.

### 3. External Client ID Safelisting (Optional)
If you need to share authentication across different Firebase projects or external OAuth clients, you can safelist their client IDs:
1. Navigate to the **Authentication > Settings** section in your Firebase console.
2. Look for **Authorized domains** and **OAuth client ID safelisting**.
3. Add the client IDs from your external projects to allow them to authorize against your primary `displaycellpros-com` instance.

## Cross-Platform Identity Flow

| Feature | Web Implementation | Mobile Implementation |
| :--- | :--- | :--- |
| **Auth** | Auth.js (GitHub/Email) | Firebase SDK (Google/Email Link) |
| **Data** | Vercel API -> AWS RDS | Firebase SDK -> Firestore |
| **Triage** | Vercel AI SDK | OpenAI direct or Firebase Vertex |

## Redundancy & Failover
- **Primary**: Vercel-native serverless logic for real-time diagnostics.
- **Failover**: Firebase Auth and Firestore for persistent identity and legacy mobile app support.

> [!TIP]
> Establishing mobile readiness now ensures that when you're ready to launch a native app for your technicians in the field, the infrastructure is already verified and "Mobile Signal" compliant.
