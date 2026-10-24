'use client';

import React, { useState } from 'react';
import { Header } from './Header';
import { Hero } from './Hero';
import { ServiceEstimator } from './ServiceEstimator';
import { MailInLogistics } from './MailInLogistics';
import { Catalog } from './Catalog';
import { Footer } from '../Footer';

export function NewHome() {
  const [bookingModal, setBookingModal] = useState<{ isOpen: boolean, title: string }>({ isOpen: false, title: '' });

  const openBookingModal = (title: string) => setBookingModal({ isOpen: true, title });
  const closeBookingModal = () => setBookingModal({ isOpen: false, title: '' });
  const toggleComparisonDrawer = () => alert('Comparison drawer functionality to be implemented');

  const selectHeroMode = (mode: 'onsite' | 'mailin') => {
    if (mode === 'onsite') document.getElementById('spokane-coverage')?.scrollIntoView({ behavior: 'smooth' });
    else document.getElementById('mailin-architecture')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100">
      <Header openBookingModal={openBookingModal} toggleComparisonDrawer={toggleComparisonDrawer} />
      <Hero selectHeroMode={selectHeroMode} openBookingModal={openBookingModal} />
      <ServiceEstimator openBookingModal={openBookingModal} />
      <MailInLogistics />
      <Catalog />
      <Footer />
      
      {/* Basic Booking Modal */}
      {bookingModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80">
          <div className="bg-slate-900 p-8 rounded-3xl max-w-lg w-full border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4">Book: {bookingModal.title}</h3>
            <button onClick={closeBookingModal} className="mt-4 bg-cyan-600 text-white px-4 py-2 rounded-lg">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
