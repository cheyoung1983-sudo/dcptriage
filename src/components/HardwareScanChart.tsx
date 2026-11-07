'use client';
import React from 'react';
export function HardwareScanChart({ deviceModel }: { deviceBrand?: string; deviceModel?: string; issueType?: string }) {
  return <div className="bg-slate-900 p-4 rounded-xl text-xs text-slate-300">Hardware Scan Chart for {deviceModel}</div>;
}
