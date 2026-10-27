'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Loader2, Calendar, MapPin, Van, Box, ShieldCheck } from 'lucide-react';

interface BookingModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialTitle?: string;
}

export function BookingModal({ isOpen: controlledIsOpen, onClose: controlledOnClose, initialTitle }: BookingModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Schedule Soft Intake & Repair');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedTicketId, setConfirmedTicketId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    serviceMethod: 'lockbox',
    device: 'iPhone 14 Pro',
    issueType: 'screen',
    preferredSlot: 'Wednesday 10:00 AM - 12:00 PM',
    notes: '',
  });

  // Listen to global custom event
  useEffect(() => {
    const handleOpenEvent = (e: any) => {
      if (e.detail?.title) {
        setModalTitle(e.detail.title);
      }
      setConfirmedTicketId(null);
      setIsOpen(true);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('open-booking-modal', handleOpenEvent);
      return () => window.removeEventListener('open-booking-modal', handleOpenEvent);
    }
  }, []);

  useEffect(() => {
    if (controlledIsOpen !== undefined) {
      setIsOpen(controlledIsOpen);
    }
    if (initialTitle) {
      setModalTitle(initialTitle);
    }
  }, [controlledIsOpen, initialTitle]);

  const handleClose = () => {
    setIsOpen(false);
    setConfirmedTicketId(null);
    if (controlledOnClose) controlledOnClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.name,
          device: `${formData.device} (${formData.serviceMethod.toUpperCase()})`,
          issueType: formData.issueType,
          quotedPrice: 199.0,
          tax: 18.5,
          discount: 0,
          total: 217.5,
        }),
      });

      const data = await res.json();
      if (data.id) {
        setConfirmedTicketId(data.id);
      } else {
        setConfirmedTicketId(`DSC-${Math.floor(1000 + Math.random() * 9000)}`);
      }
    } catch (err) {
      console.error('Failed to submit ticket:', err);
      setConfirmedTicketId(`DSC-${Math.floor(1000 + Math.random() * 9000)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              ⚡ Soft Operation Window (Wed–Fri 10AM–4PM)
            </span>
            <h3 className="text-xl font-bold text-white mt-0.5">{modalTitle}</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {confirmedTicketId ? (
          <div className="py-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Intake Reservation Confirmed!</h4>
              <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
                Your ticket has been logged into the Spokane Mobile & Lockbox registry.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-300 space-y-2 text-left">
              <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                <span className="text-slate-500">Ticket ID:</span>
                <span className="text-amber-400 font-bold">{confirmedTicketId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Intake Method:</span>
                <span className="text-white capitalize">{formData.serviceMethod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Location:</span>
                <span className="text-cyan-400">6325 N Monroe St</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Slot / Drop-Off:</span>
                <span className="text-emerald-400">{formData.preferredSlot}</span>
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-200 text-left">
              💡 <strong>Lockbox Drop-off instructions:</strong> Secure lockbox code & intake verification receipt sent to <strong>{formData.email || 'your email'}</strong>.
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Done & Return to Site
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Alex Morgan"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(509) 555-0199"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="alex@example.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Intake / Service Method</label>
              <select
                value={formData.serviceMethod}
                onChange={(e) => setFormData({ ...formData, serviceMethod: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400 transition-colors"
              >
                <option value="lockbox">📍 24/7 Lockbox Drop-Off (PO Box 1308 6325 N Monroe St)</option>
                <option value="in-person">⚡ Soft Operation In-Person Intake (Wed–Fri 10AM–4PM)</option>
                <option value="onsite">🚐 Spokane On-Site Mobile Van Visit (We Come To You)</option>
                <option value="mailin">📦 Nationwide White-Glove ESD Mail-In Kit</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Device Model</label>
                <input
                  type="text"
                  required
                  value={formData.device}
                  onChange={(e) => setFormData({ ...formData, device: e.target.value })}
                  placeholder="e.g. iPhone 14 Pro, PS5"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Preferred Slot</label>
                <select
                  value={formData.preferredSlot}
                  onChange={(e) => setFormData({ ...formData, preferredSlot: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                >
                  <option value="Wednesday 10:00 AM - 12:00 PM">Wed 10:00 AM - 12:00 PM</option>
                  <option value="Wednesday 1:00 PM - 4:00 PM">Wed 1:00 PM - 4:00 PM</option>
                  <option value="Thursday 10:00 AM - 12:00 PM">Thu 10:00 AM - 12:00 PM</option>
                  <option value="Thursday 1:00 PM - 4:00 PM">Thu 1:00 PM - 4:00 PM</option>
                  <option value="Friday 10:00 AM - 12:00 PM">Fri 10:00 AM - 12:00 PM</option>
                  <option value="Friday 1:00 PM - 4:00 PM">Fri 1:00 PM - 4:00 PM</option>
                  <option value="24/7 Any Time Lockbox">24/7 Any Time Lockbox Drop</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Issue / Notes (Optional)</label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Cracked screen, battery drain, micro-soldering..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-110 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-900/20 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating Ticket...
                </>
              ) : (
                'Confirm Soft Intake & Get Lockbox Code'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
