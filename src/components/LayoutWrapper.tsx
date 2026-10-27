"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { TopAnnouncementBar } from './TopAnnouncementBar';
import { BookingModal } from './BookingModal';

const Navbar = dynamic(() => import('./Navbar').then(mod => mod.Navbar), { ssr: false });
const Footer = dynamic(() => import('./Footer').then(mod => mod.Footer), { ssr: false });
const AIAssistantModalManager = dynamic(() => import('./AIAssistantModalManager').then(mod => mod.AIAssistantModalManager), { ssr: false });

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingTitle, setBookingTitle] = useState('Schedule Soft Intake & Repair');

  const handleOpenBooking = (title?: string) => {
    if (title) setBookingTitle(title);
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-500/30 flex flex-col justify-between">
      <header className="sticky top-0 z-50 w-full shadow-lg">
        <TopAnnouncementBar onScheduleClick={() => handleOpenBooking('Schedule Soft Intake (Wed–Fri 10AM–4PM)')} />
        <Navbar onBookClick={() => handleOpenBooking('Book Service Mission')} />
      </header>

      <main className="flex-1">
        {children}
      </main>

      <Footer />

      <AIAssistantModalManager />
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        initialTitle={bookingTitle}
      />
    </div>
  );
}

