'use client';
import React from 'react';
export default function QrScannerModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; onScanSuccess?: (code: string) => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80">
      <div className="bg-slate-900 p-6 rounded-2xl text-white">
        <h3>Bench Barcode & QR Scanner</h3>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg">Close</button>
      </div>
    </div>
  );
}
