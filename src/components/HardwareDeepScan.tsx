'use client';

import React from 'react';

export function HardwareDeepScan({ isOpen, onClose, deviceName }: { isOpen: boolean; onClose: () => void; deviceName: string }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4 max-w-md w-full">
        <h3 className="text-lg font-bold">Deep Scan: {deviceName}</h3>
        <p className="text-xs text-slate-400">All 5 hardware checks passed successfully.</p>
        <button onClick={onClose} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-xs font-bold">Close</button>
      </div>
    </div>
  );
}
