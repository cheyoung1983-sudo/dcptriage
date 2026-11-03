# WebUSB & Android ADB Interface Connection Fix

Resolve WebUSB hardware connection failures when Android Debug Bridge (ADB) is enabled on Windows. The fix incorporates permission policy declarations, Android ADB interface descriptor negotiation, automated ADB daemon exclusive lock detection, and bench technician troubleshooting tools.

## User Review & Critical Decisions

> [!IMPORTANT]
> Based on your Phase 1 selections, the following design and architectural choices have been locked in:
> - **ADB Conflict Handling Strategy**: Direct WebUSB access with automated conflict detection. When Windows ADB daemon (`adb.exe`) holds an exclusive WinUSB interface lock, the workstation will detect the `SecurityError` / `Access Denied` exception and provide immediate interactive instructions to run `adb kill-server`.
> - **Host Environment**: Windows with WinUSB / Google USB Driver stack.
> - **Runtime Context**: Direct browser tab at full URL, with fallback iframe permission support (`"usb"` added to `metadata.json`).

---

## 1. Overview & Core Concept

- **Root Cause Analysis**:
  1. **Exclusive Interface Lock**: On Windows, when the background ADB daemon (`adb.exe` on port 5037) is running, Windows assigns the composite device's ADB interface (`Class: 0xFF`, `Subclass: 0x42`, `Protocol: 0x01`) exclusively to the ADB service. When Chrome requests `device.open()` or `device.claimInterface()`, the operating system denies access with a `SecurityError` or `LIBUSB_ERROR_BUSY`.
  2. **Incomplete WebUSB Claim Pipeline**: `useWebUsb.ts` previously attempted `device.open()` and `selectConfiguration()` but never identified or claimed the specific ADB interface (`claimInterface`) or negotiated bulk transfer endpoints.
  3. **Silent Error Swallowing**: `useWebUsb.ts` silenced `openErr` with `console.warn` without surfacing actionable diagnostic feedback or error classification to the UI.
  4. **Permissions Policy**: `metadata.json` lacked the explicit `"usb"` permission in `requestFramePermissions`, which restricts WebUSB when viewed inside frames.
  5. **Banned `window.alert`**: `useWebUsb.ts` used `alert()`, which fails inside sandboxed environments.
- **Key Value**: Provides reliable, one-click Android WebUSB pairing, automated detection of host ADB daemon locks, clear technician recovery steps (`adb kill-server`), and complete hardware descriptor inspection.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Device Connection Attempt**: Technician connects an Android device via USB and clicks "🔌 Connect USB Prober".
2. **Device Picker & Descriptor Inspection**: Chrome prompts with filtered Android ADB device options (Google, Samsung, Qualcomm, Xiaomi, etc.) or generic USB devices.
3. **ADB Conflict Detection & Modal HUD**:
   - If the ADB daemon is locking the interface (`SecurityError: Access denied`), the workstation intercepts the error, flags `ADB_LOCK_DETECTED`, and displays a diagnostic banner with a quick copy command: `adb kill-server`.
   - Once the technician executes `adb kill-server`, clicking "Retry Connection" immediately re-attaches and claims the interface.
4. **Successful Pairing**: When claimed, the status pill shifts to `USB Online (ADB Claimed)`, displaying Manufacturer, Product Name, Serial Number, VID/PID, and live endpoint count.
5. **Port Monitor Tab**: The "Advanced Port Monitor" displays active interface descriptors, alternate settings, endpoint packet sizes, and live connection logs.

### Visual Identity & Theme
- **Obsidian Dark Diagnostic Palette**: Consistent with the laboratory aesthetic (`#020617` / `#0B0F19` with `border-slate-800`).
- **Conflict Warning Banner**: Amber-toned diagnostic card with quick-copy command button (`adb kill-server`), terminal snippet, and status feedback.
- **Hardware Descriptors**: Tabular monospace notation (`font-mono text-xs tabular-nums`) showing Hex VID/PID (e.g. `0x18D1:0x4EE7`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Direct WebUSB with Conflict Detection vs. Custom Local Proxy**
  - *Chosen Approach*: Direct WebUSB access with automated detection of Windows ADB daemon locks and guided `adb kill-server` execution.
  - *Why*: Eliminates dependencies on external local WebSocket bridge proxies, preserving clean browser-native hardware diagnostics.
- **Decision 2: Universal Android ADB Filters with Fallback**
  - *Chosen Approach*: Supply explicit Android ADB filters (`classCode: 255, subclassCode: 66, protocolCode: 1`) alongside standard vendor IDs (Google `0x18d1`, Samsung `0x04e8`, etc.) while retaining an empty filter fallback for non-standard test equipment.
  - *Why*: Prevents user confusion by prioritizing relevant ADB devices in Chrome's native device picker.
- **Decision 3: Non-Blocking Toast & UI Modals vs. `window.alert`**
  - *Chosen Approach*: Replace all `alert()` calls with the app's existing `ToastProvider` and inline diagnostic cards.
  - *Why*: Adheres to platform sandbox constraints and prevents browser execution freezing.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        User Physical Workstation                       │
│  [Android Device (USB)] <─── Locked by ───> [Windows adb.exe (5037)]  │
│                                                   ▲                    │
│                                                   │ adb kill-server    │
└───────────────────────────────────┬───────────────┴────────────────────┘
                                    │ WebUSB WinUSB Driver
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          Web Browser (Chrome)                          │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ navigator.usb.requestDevice({ filters: [ADB_FILTERS] })            │ │
│ └─────────────────────────────────┬──────────────────────────────────┘ │
│                                   │ device.open() & claimInterface()   │
│                                   ▼                                    │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ useWebUsb Hook                                                     │ │
│ │ - Error Interception (SecurityError -> ADB_LOCK_DETECTED)          │ │
│ │ - Interface Claiming (Class 0xFF / SubClass 0x42 / Protocol 0x01)  │ │
│ │ - Endpoint Discovery (Bulk IN / Bulk OUT)                          │ │
│ └─────────────────────────────────┬──────────────────────────────────┘ │
│                                   │ State: usbDeviceDetails, adbStatus │
│                                   ▼                                    │
│ ┌─────────────────────────────────┴──────────────────────────────────┐ │
│ │ DiagnosticsWorkstation UI                                          │ │
│ │ - TelemetryHeader: USB Live Status & Reconnect Button              │ │
│ │ - ADBConflictBanner: One-click "adb kill-server" copy & guide      │ │
│ │ - DiagnosticPortMonitor: Raw Descriptors & Packet Inspector        │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### Component & State Plan
- **`metadata.json`**: Add `"usb"` to `requestFramePermissions`.
- **`src/types.ts`**: Extend `UsbDeviceDetails` with `adbClaimed: boolean`, `interfaceNumber?: number`, `endpointsCount?: number`, and `adbConflictDetected?: boolean`.
- **`src/hooks/useWebUsb.ts`**:
  - Implement structured Android ADB device filters (`classCode: 0xFF`, `subclassCode: 0x42`, `protocolCode: 0x01`).
  - Add interface scanning: iterate `device.configuration.interfaces` to locate and claim the ADB interface.
  - Catch and classify `SecurityError`, `NetworkError`, and `NotFoundError` with specific state flags (`isAdbLocked`, `errorMessage`).
- **`src/components/TelemetryHeader.tsx` & `src/components/DiagnosticPortMonitor.tsx`**:
  - Display the interactive ADB Conflict Banner with command snippet and retry action when an ADB lock is detected.
