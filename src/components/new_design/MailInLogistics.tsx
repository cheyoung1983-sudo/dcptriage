'use client';

import React from 'react';
import { Box, Code, Barcode, Microscope, Truck } from 'lucide-react';

export function MailInLogistics() {
  const steps = [
    { title: 'Intake & Order', desc: 'RMA generated automatically.', icon: Code },
    { title: 'Kit Dispatch', desc: 'ESD shielded box sent.', icon: Box },
    { title: 'POU Inbound', desc: 'Scan-based shipping.', icon: Barcode },
    { title: 'Depot Triage', desc: 'Micro-soldering QA.', icon: Microscope },
    { title: 'Express Return', desc: 'Real-time tracking.', icon: Truck },
  ];

  return (
    <section id="mailin-architecture" className="py-24 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl font-bold text-white mb-12">White-Glove Direct Mail-In</h2>
        <div className="grid md:grid-cols-5 gap-4">
          {steps.map((step, i) => (
            <div key={i} className="bg-slate-800 p-5 rounded-2xl">
              <step.icon className="text-cyan-400 mb-4" />
              <h4 className="text-sm font-bold text-white">{step.title}</h4>
              <p className="text-[11px] text-slate-400 mt-1.5">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
