import React, { useState } from 'react';
import type { BookingDraft } from '../../types/booking';
import { X, Lock, Mail, ArrowRight } from 'lucide-react';

interface MockAuthGateModalProps {
  draft: BookingDraft;
  onSuccess: (user: { name: string; email: string }) => void;
  onClose: () => void;
}

export const MockAuthGateModal: React.FC<MockAuthGateModalProps> = ({
  draft,
  onSuccess,
  onClose,
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleMock = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onSuccess({
        name: 'Alex Player',
        email: 'alex.player@gmail.com',
      });
    }, 400);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onSuccess({
        name: nameInput || 'PADDLE TOP Player',
        email: emailInput,
      });
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#0E172A] border border-neutral-200 dark:border-white/10 rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-2 mb-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#84CC16]/15 text-[#3F6212] dark:text-[#A3E635] text-xs font-mono font-bold uppercase">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure 10-Minute Hold</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold font-display text-neutral-900 dark:text-white">
            Sign In to Reserve
          </h3>

          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
            Please sign in to place a temporary 10-minute hold on <strong className="text-neutral-900 dark:text-white">{draft.courtName}</strong> for <span className="font-mono font-semibold">{draft.displayTimeWindow}</span> ({draft.selectedHours} {draft.selectedHours === 1 ? 'hour' : 'hours'}).
          </p>
        </div>

        {/* Mock Social / Google Auth */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleMock}
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl border border-neutral-200 dark:border-white/15 bg-neutral-50 dark:bg-white/5 hover:bg-neutral-100 dark:hover:bg-white/10 font-bold text-sm text-neutral-800 dark:text-neutral-100 transition-all flex items-center justify-center gap-3 cursor-pointer shadow-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-neutral-200 dark:border-white/10 w-full" />
            <span className="bg-white dark:bg-[#0E172A] px-3 text-[11px] text-neutral-400 uppercase tracking-widest font-mono shrink-0">
              or passwordless email
            </span>
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <div>
              <label htmlFor="name-input" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Your Name
              </label>
              <input
                id="name-input"
                type="text"
                placeholder="e.g. Maria Santos"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#84CC16]"
              />
            </div>

            <div>
              <label htmlFor="email-input" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Email Address
              </label>
              <input
                id="email-input"
                type="email"
                required
                placeholder="player@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#84CC16]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-[#0A1120] bg-[#84CC16] hover:bg-[#A3E635] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Mail className="w-4 h-4" />
              <span>Continue with Email</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-[11px] text-neutral-400 text-center">
            Mock sign-in demonstration. No actual credentials or passwords required.
          </div>
        </div>
      </div>
    </div>
  );
};
