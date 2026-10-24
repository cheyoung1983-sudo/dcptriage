'use client';

import React, { useState } from 'react';
import { Clock, Check } from 'lucide-react';

// Pricing Matrix
const pricingMatrix: any = {
    iphone14pro: { screen: { price: 283.98, time: '35-45 min' }, battery: { price: 87.76, time: '25 min' }, hdmi: { price: 94.98, time: '45 min' }, tuneup: { price: 79.98, time: '60 min' } },
    iphone13: { screen: { price: 175.98, time: '35-45 min' }, battery: { price: 76.98, time: '25 min' }, hdmi: { price: 82.38, time: '45 min' }, tuneup: { price: 79.98, time: '60 min' } },
    s22ultra: { screen: { price: 283.98, time: '45-60 min' }, battery: { price: 112.75, time: '35 min' }, hdmi: { price: 121.96, time: '45 min' }, tuneup: { price: 79.98, time: '60 min' } },
    s21ultra: { screen: { price: 199.36, time: '45-60 min' }, battery: { price: 103.96, time: '35 min' }, hdmi: { price: 118.31, time: '45 min' }, tuneup: { price: 79.98, time: '60 min' } },
    ps5: { screen: { price: 121.98, time: '45 min' }, battery: { price: 61.79, time: '30 min' }, hdmi: { price: 66.18, time: '45-60 min' }, tuneup: { price: 79.98, time: '60 min' } },
    xboxseriesx: { screen: { price: 127.38, time: '45 min' }, battery: { price: 61.79, time: '30 min' }, hdmi: { price: 67.98, time: '45-60 min' }, tuneup: { price: 79.98, time: '60 min' } },
    pctuneup: { screen: { price: 165.18, time: '60 min' }, battery: { price: 112.44, time: '45 min' }, hdmi: { price: 75.18, time: '45 min' }, tuneup: { price: 79.98, time: '45-60 min' } }
};

export function ServiceEstimator({ openBookingModal }: { openBookingModal: (title: string) => void }) {
    const [model, setModel] = useState('iphone14pro');
    const [repairType, setRepairType] = useState('screen');

    const data = pricingMatrix[model]?.[repairType] || { price: 199.36, time: '45-60 mins' };
    const [priceInt, priceDec] = data.price.toFixed(2).split('.');

    return (
        <section id="service-selector" className="py-20 bg-slate-950 border-y border-slate-800">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
                <div className="bg-slate-900 rounded-3xl p-8 border border-slate-700 shadow-2xl">
                    <h2 className="text-3xl font-bold text-white mb-8 text-center">Calculate Your Repair</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Selectors */}
                        <div className="space-y-6">
                            <select onChange={(e) => setModel(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white">
                                <option value="iphone14pro">iPhone 14 Pro</option>
                                <option value="iphone13">iPhone 13</option>
                                <option value="s22ultra">Samsung S22 Ultra</option>
                                <option value="ps5">PS5</option>
                            </select>
                            <div className="flex gap-2">
                                {['screen', 'battery', 'hdmi'].map(type => (
                                    <button key={type} onClick={() => setRepairType(type)} className={`p-3 rounded-lg text-xs ${repairType === type ? 'bg-cyan-600' : 'bg-slate-800'}`}>
                                        {type.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Display */}
                        <div className="bg-slate-950 p-6 rounded-2xl">
                            <div className="text-4xl font-bold text-white mb-2">${priceInt}.<span className="text-2xl text-slate-400">{priceDec}</span></div>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
                                <Clock size={14} className="text-cyan-400" /> Typical duration: {data.time}
                            </div>
                            <button onClick={() => openBookingModal('Booking')} className="w-full py-3 bg-cyan-600 text-white rounded-xl font-bold">Book Repair</button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
