'use client';
import React from 'react';
export function HardwareDiagnosticLogs({ deviceDetails }: { deviceDetails?: any }) {
  return <div className="bg-slate-900 p-4 rounded-xl text-xs text-slate-300">Diagnostic Logs for {deviceDetails?.productName || 'Device'}</div>;
}
