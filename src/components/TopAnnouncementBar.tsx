'use client';

import React from 'react';
import { Zap, MapPin, Lock, Navigation, Calendar, CalendarCheck } from 'lucide-react';

interface TopAnnouncementBarProps {
  onScheduleClick?: () => void;
}

export function TopAnnouncementBar({ onScheduleClick }: TopAnnouncementBarProps) {
  const handleSchedule = () => {
    if (onScheduleClick) {
      onScheduleClick();
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-booking-modal', {
          detail: { title: 'Schedule Soft Intake (Wed–Fri 10AM–4PM)' },
        })
      );
    }
  };

  const gpsUrl = 'https://www.google.com/maps/search/?api=1&query=6325+N+Monroe+St+Spokane+WA+99208';
  const calendarUrl =
    'https://calendar.google.com/calendar/render?action=TEMPLATE&text=DisplayCellPros+Soft+Intake+Drop-Off&details=Drop-off+or+intake+at+Display+%26+Cell+Pros+Spokane+Lab.+PO+Box+1308+6325+N+Monroe+St.+Spokane,+WA+99208.+Soft+Ops+Hours:+Wed-Fri+10:00+AM-4:00+PM+PST.+24/7+Lockbox+Drop-Off+Active.&location=6325+N+Monroe+St,+Spokane,+WA+99208';

  return (
    <div className="w-full bg-slate-950/95 border-b border-amber-500/20 text-slate-200 text-xs py-2 px-3 sm:px-6 relative z-50 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-2.5 sm:gap-3">
        {/* Left Information Items */}
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 text-center sm:text-left leading-relaxed">
          {/* Status Badge */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold tracking-tight text-[11px] shadow-sm whitespace-nowrap">
            <Zap size={12} className="text-amber-400 animate-pulse shrink-0" />
            SOFT OPERATION ACTIVE (Wed–Fri | 10:00 AM – 4:00 PM PST)
          </span>

          <span className="text-slate-600 hidden sm:inline" aria-hidden="true">•</span>

          {/* Location */}
          <a
            href={gpsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors group whitespace-nowrap"
            title="Open in Google Maps"
          >
            <MapPin size={12} className="text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />
            <span className="font-medium underline decoration-slate-600 underline-offset-2 group-hover:decoration-cyan-400">
              PO Box 1308 6325 N Monroe St. Spokane, WA 99208
            </span>
          </a>

          <span className="text-slate-600 hidden md:inline" aria-hidden="true">•</span>

          {/* Lockbox Notice */}
          <span className="inline-flex items-center gap-1.5 text-emerald-300/90 font-medium whitespace-nowrap">
            <Lock size={11} className="text-emerald-400 shrink-0" />
            24/7 Lockbox Drop-Off Active
          </span>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2 shrink-0">
          {/* GPS Check */}
          <a
            href={gpsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-all flex items-center gap-1"
          >
            <Navigation size={11} className="text-cyan-400" />
            GPS Check
          </a>

          {/* Schedule Soft Intake */}
          <button
            onClick={handleSchedule}
            className="px-3 py-1 rounded-lg text-[11px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-sm transition-all flex items-center gap-1 active:scale-95"
          >
            <CalendarCheck size={11} />
            Schedule Soft Intake
          </button>

          {/* Google Calendar */}
          <a
            href={calendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all flex items-center gap-1"
            title="Add reminder to Google Calendar"
          >
            <Calendar size={11} className="text-amber-400" />
            <span className="hidden sm:inline">Google Calendar</span>
            <span className="sm:hidden">Calendar</span>
          </a>
        </div>
      </div>
    </div>
  );
}
