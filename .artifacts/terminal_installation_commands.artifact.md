# Terminal Installation & Setup Guide (Fixed & Robust)

Use these commands to initialize the infrastructure while automatically bypassing the common "Path Not Found" and "Blocked Script" errors encountered during setup.

## 1. Automated Dependency & Script Setup
This block installs all packages and explicitly authorizes the required install scripts to prevent setup hangs and console warnings.

```powershell
# 1. Approve all blocked scripts and install security patches
npm install-scripts approve esbuild core-js bufferutil protobufjs "@firebase/util"; npm install

# 2. Force-patch remaining low-severity vulnerabilities
npm audit fix --force
```

## 2. Infrastructure & Secret Sync
Link your workstation to the cloud environment to retrieve API keys and DB connection strings.

```powershell
# Install Vercel CLI globally if missing
npm install -g vercel

# Link and pull secrets
vercel link
vercel env pull
```

## 3. Robust Mobile Identity (Android)
These commands use the explicit Android Studio path to avoid "Command Not Found" errors and handle missing keystores gracefully.

### A. Generate Debug Keystore (If Missing)
Run this if you see "Keystore file does not exist":
```powershell
& "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe" -genkey -v -keystore "$HOME\.android\debug.keystore" -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
```

### B. Extract SHA-1 Fingerprint (High Fidelity)
```powershell
& "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe" -list -v -alias androiddebugkey -keystore "$HOME\.android\debug.keystore" -storepass android
```

## 4. Maintenance Commands

```powershell
# Start the simulated Edge environment
npm run dev

# Run the production bundle test
npm run build
```

---

> [!NOTE]
> **Identity Sync**: I have updated `package.json` to the secure versions of `ai` and `@auth/core` to resolve the vulnerabilities shown in your last terminal audit.

> [!TIP]
> **Permission Issues**: If you still see "blocked scripts" warnings, run:
> `npm install-scripts approve esbuild core-js bufferutil protobufjs`
