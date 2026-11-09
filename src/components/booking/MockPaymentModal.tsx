import React, { useState } from 'react';
import type { BookingHold, ConfirmedBooking } from '../../types/booking';
import { createConfirmedMockBooking } from '../../services/legacyMockBookingService';
import { X, CreditCard, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface MockPaymentModalProps {
  hold: BookingHold;
  onPaymentSuccess: (confirmed: ConfirmedBooking) => void;
  onClose: () => void;
}

export const MockPaymentModal: React.FC<MockPaymentModalProps> = ({
  hold,
  onPaymentSuccess,
  onClose,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'gcash' | 'maya'>('gcash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSimulateSuccess = () => {
    setIsProcessing(true);
    setErrorMessage(null);
    setTimeout(() => {
      setIsProcessing(false);
      const confirmed = createConfirmedMockBooking(hold, selectedMethod.toUpperCase());
      onPaymentSuccess(confirmed);
    }, 700);
  };

  const handleSimulateFailure = () => {
    setIsProcessing(true);
    setErrorMessage(null);
    setTimeout(() => {
      setIsProcessing(false);
      setErrorMessage(
        'Simulated payment authorization failed. Your 10-minute court hold remains active—you may retry or choose another payment method while time remains.'
      );
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#0E172A] border border-neutral-200 dark:border-white/10 rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative space-y-5">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#3F6212] dark:text-[#A3E635] font-bold uppercase">
            <span>Payment Simulation</span>
            <span>·</span>
            <span>PayMongo Gateway Mock</span>
          </div>
          <h3 className="text-xl font-bold font-display text-neutral-900 dark:text-white">
            Complete Reservation
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Booking Status: <strong className="text-amber-600 font-mono">HELD</strong> · Payment Status: <strong className="text-neutral-600 dark:text-neutral-300 font-mono">PENDING</strong>
          </p>
        </div>

        {/* Order Summary */}
        <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200/80 dark:border-white/10 flex items-center justify-between text-sm">
          <div>
            <span className="font-bold text-neutral-900 dark:text-white block font-display">
              {hold.draft.courtName} ({hold.draft.selectedHours} {hold.draft.selectedHours === 1 ? 'hr' : 'hrs'})
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              {hold.draft.displayTimeWindow}
            </span>
          </div>
          <div className="text-right">
            <span className="text-base font-bold font-mono text-[#2A4408] dark:text-[#A3E635]">
              ₱{hold.draft.priceEstimatePhp}
            </span>
            <span className="text-[10px] text-neutral-400 block font-mono">PHP</span>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
            Select Mock Payment Method
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'gcash', label: 'GCash', desc: 'E-Wallet' },
              { id: 'maya', label: 'Maya', desc: 'E-Wallet' },
              { id: 'card', label: 'Card', desc: 'Debit / Credit' },
            ].map((method) => {
              const isSelected = selectedMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => {
                    setSelectedMethod(method.id as any);
                    setErrorMessage(null);
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#84CC16] bg-[#84CC16]/15 text-[#2A4408] dark:text-[#BEF264] font-bold shadow-xs'
                      : 'border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <div className="text-sm font-semibold">{method.label}</div>
                  <div className="text-[10px] text-neutral-400">{method.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error Notice */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleSimulateSuccess}
            className="w-full py-3 px-4 rounded-xl text-sm font-bold text-[#0A1120] bg-[#84CC16] hover:bg-[#A3E635] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isProcessing ? 'Processing Mock...' : `Simulate Pay ₱${hold.draft.priceEstimatePhp}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleSimulateFailure}
            className="w-full py-2 px-3 rounded-xl text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            Test Payment Failure (Hold Remains Active)
          </button>
        </div>

        <div className="text-[11px] text-neutral-400 text-center leading-normal">
          Frontend demonstration only. No real charges or payment credentials processed.
        </div>
      </div>
    </div>
  );
};
