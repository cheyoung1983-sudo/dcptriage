'use client';

import React from 'react';
import { useTelemetry } from '@/lib/TelemetryContext';

export default function DiagnosticPortMonitor() {
  const { currentVoltage, currentAmps, currentPower, internalTemp, pdProfile } = useTelemetry();
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-4">
      <h3 className="text-lg font-bold">Advanced WebUSB Hardware Inspector</h3>
      <p className="text-xs text-slate-400">Current Profile: {pdProfile} | Voltage: {currentVoltage}V | Current: {currentAmps}A | Power: {currentPower}W | Temp: {internalTemp}°C</p>
    </div>
  );
}
