'use client';

import React, { useState } from 'react';

export function HardwareTriageIntake({ onTicketCreated }: { onTicketCreated?: (id: string) => void }) {
  const [ticketId] = useState('DSC-1050');
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4">
      <h3 className="text-lg font-bold">Hardware Triage Intake & Manifest</h3>
      <p className="text-xs text-slate-400">Statutory RCW 19.415 & NIST SP 800-88 Compliant</p>
      <button
        onClick={() => onTicketCreated?.(ticketId)}
        className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-xs font-bold"
      >
        Generate Ticket
      </button>
    </div>
  );
}
