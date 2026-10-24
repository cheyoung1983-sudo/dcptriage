'use client';

import React from 'react';
import { Smartphone, Gamepad, Laptop } from 'lucide-react';

export function Catalog() {
  const items = [
    { name: 'Galaxy S22 Ultra Screen', price: '$283.98', cat: 'screen', icon: Smartphone },
    { name: 'PS5 HDMI Port', price: '$66.18', cat: 'console', icon: Gamepad },
    { name: 'PC Tune-Up', price: '$79.98', cat: 'pc', icon: Laptop },
  ];

  return (
    <section id="catalog-grid" className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl font-bold text-white mb-12">Featured Repairs</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div key={i} className="bg-slate-900 p-6 rounded-2xl border border-slate-700">
              <item.icon className="text-cyan-400 mb-4" />
              <h3 className="text-white font-bold">{item.name}</h3>
              <p className="text-xl font-bold text-white mt-2">{item.price}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
