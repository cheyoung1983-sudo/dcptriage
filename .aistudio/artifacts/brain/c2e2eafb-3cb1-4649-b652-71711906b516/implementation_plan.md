# Implementation Plan: Bulk Diagnostics, Web Audio Feedback, & Diagnostic History

This plan outlines adding a 'Bulk Diagnostics' toggle in the Lab Portal header, Web Audio API synthesized sound effects for step completions and warnings in `HardwareDeepScan`, and a 'Diagnostic History' tab in `HardwareDiagnosticLogs` to track the last 10 local reports.

## User Review & Critical Decisions

> [!IMPORTANT]
> - **Bulk Diagnostics Toggle**: Added to the Lab Portal header to sequence the deep scan across multiple connected USB devices (`navigator.usb.getDevices()`).
> - **Web Audio API Feedback**: Synthesized audio chimes on step success and warning tones on failure without external audio files.
> - **Diagnostic History Tab**: Added to `HardwareDiagnosticLogs` to review previous diagnostic reports saved in `localStorage`.

---

## 1. Overview & Core Enhancements

- **Bulk Diagnostics**: Iterates through all authorized USB devices returned by `getDevices()`, running the sequential deep scan for each.
- **Web Audio Sound Utility**: Helper functions using `AudioContext` oscillators for pleasant success chimes and low warning tones.
- **Diagnostic History**: Stores completed report snapshots in `localStorage` (`dcp_diagnostic_history`) and displays the last 10 entries in a tabbed view.

---

## 2. Technical Implementation Steps

1. **Audio Utility (`src/lib/audio.ts`)**: Implement Web Audio API tone generator.
2. **Bulk Diagnostics Toggle**: Add state and header toggle in `src/app/lab/page.tsx`.
3. **HardwareDeepScan Audio Integration**: Trigger success chime on step completion, with a simulated 5% chance of a test warning/retry to demonstrate warning tones.
4. **HardwareDiagnosticLogs History Tab**: Update `src/components/HardwareDiagnosticLogs.tsx` with a tabbed interface for Live Report vs Diagnostic History.
5. **Verification**: Compile applet to verify build correctness.
