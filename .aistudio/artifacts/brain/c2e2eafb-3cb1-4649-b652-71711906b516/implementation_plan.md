# Implementation Plan: Hardware Diagnostic Suite & Real-Time USB Monitoring

This plan outlines adding real-time WebUSB connection status monitoring in the Lab Portal header, a `HardwareDiagnosticLogs` component with text file export, and a `HardwareDeepScan` modal featuring a simulated 5-step progress bar sequence upon device connection.

## User Review & Critical Decisions

> [!IMPORTANT]
> - **Header Status Pill**: Real-time USB connection indicator with alert/active icon placed in the top Lab Portal header banner.
> - **HardwareDiagnosticLogs Component**: Generates a formatted textual diagnostic report from USB descriptors and allows downloading as a local text file.
> - **HardwareDeepScan Modal**: Automatically opens upon device connection, running a simulated 5-step diagnostic sequence (Battery Health, Screen Digitizer, Port Integrity, Thermal Sensors, NAND Flash Integrity) with progress bars.

---

## 1. Overview & Components

- **Real-Time Connection Monitoring**: Listen to `navigator.usb.addEventListener('disconnect', ...)` and `connect` events to instantly update connection status.
- **`HardwareDiagnosticLogs`**: Formats hardware metadata and test outcomes into a downloadable `.txt` report.
- **`HardwareDeepScan` Modal**: Interactive overlay with progress indicators for each of the 5 diagnostic checks.

---

## 2. Technical Implementation Steps

1. **USB Disconnect / Connect Listeners**: Add event listeners for `connect` and `disconnect` in `src/app/lab/page.tsx`.
2. **Header Status Pill**: Add connection pill in the lab header banner.
3. **`HardwareDiagnosticLogs` Component**: Create `src/components/HardwareDiagnosticLogs.tsx` with export to text functionality.
4. **`HardwareDeepScan` Modal**: Create `src/components/HardwareDeepScan.tsx` managing the 5-step progress sequence.
5. **Integration**: Integrate both components into `src/app/lab/page.tsx` and trigger deep scan automatically on device connect.
6. **Verification**: Run `compile_applet` to ensure build correctness.
