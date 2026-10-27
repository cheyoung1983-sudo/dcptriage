'use client';

import React from 'react';
import { Hero } from './Hero';
import { ServiceEstimator } from './ServiceEstimator';
import { MailInLogistics } from './MailInLogistics';
import { Catalog } from './Catalog';

export function NewHome() {
  const openBookingModal = (title: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-booking-modal', {
          detail: { title },
        })
      );
    }
  };

  const selectHeroMode = (mode: 'onsite' | 'mailin') => {
    if (mode === 'onsite') document.getElementById('spokane-coverage')?.scrollIntoView({ behavior: 'smooth' });
    else document.getElementById('mailin-architecture')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100">
      <Hero selectHeroMode={selectHeroMode} openBookingModal={openBookingModal} />
      <ServiceEstimator openBookingModal={openBookingModal} />
      <MailInLogistics />
      <Catalog />
    </div>
  );
}
