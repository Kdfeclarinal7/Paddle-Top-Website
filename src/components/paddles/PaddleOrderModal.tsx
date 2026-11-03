import React, { useState } from 'react';
import { X, Check, ArrowRight, ShieldCheck, MapPin, CreditCard, Banknote, Smartphone, Copy, CheckCheck } from 'lucide-react';
import { PaddleProduct, PaddleOrder, PaymentMethod, OrderStatus, PaymentStatus } from '../../types/paddle';
import { generateOrderCode, savePaddleOrder } from '../../data/paddleProducts';

interface PaddleOrderModalProps {
  product: PaddleProduct;
  quantity: number;
  onClose: () => void;
  onOrderCompleted: (order: PaddleOrder) => void;
  onNavigateHome: () => void;
}

export const PaddleOrderModal: React.FC<PaddleOrderModalProps> = ({
  product,
  quantity,
  onClose,
  onOrderCompleted,
  onNavigateHome,
}) => {
  const [step, setStep] = useState<'DETAILS' | 'PAYMENT' | 'CONFIRMATION'>('DETAILS');
  const [copiedCode, setCopiedCode] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('VENUE_COUNTER');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Completed order state
  const [completedOrder, setCompletedOrder] = useState<PaddleOrder | null>(null);

  const unitPrice = product.pricePHP;
  const totalPrice = unitPrice * quantity;

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Full name is required';
    if (!mobile.trim()) {
      errs.mobile = 'Mobile number is required';
    } else if (mobile.trim().length < 10) {
      errs.mobile = 'Please enter a valid 10-11 digit mobile number';
    }
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!email.includes('@')) {
      errs.email = 'Please enter a valid email address';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep('PAYMENT');
    }
  };

  const handleConfirmOrder = () => {
    const orderCode = generateOrderCode();
    const orderStatus: OrderStatus = 'Confirmed';
    const paymentStatus: PaymentStatus = paymentMethod === 'VENUE_COUNTER' ? 'Pending' : 'Paid';

    const newOrder: PaddleOrder = {
      id: `ord_${Date.now()}`,
      orderCode,
      productId: product.id,
      productName: product.name,
      productSeries: product.series,
      quantity,
      unitPricePHP: unitPrice,
      totalPricePHP: totalPrice,
      customer: {
        fullName: fullName.trim(),
        mobile: mobile.trim(),
        email: email.trim(),
        notes: notes.trim() || undefined,
      },
      orderStatus,
      paymentStatus,
      paymentMethod,
      fulfillmentType: 'VENUE_PICKUP',
      pickupLocation: 'Venue Pickup · Details confirmed with order',
      createdAt: new Date().toISOString(),
    };

    savePaddleOrder(newOrder);
    setCompletedOrder(newOrder);
    onOrderCompleted(newOrder);
    setStep('CONFIRMATION');
  };

  const handleCopyCode = () => {
    if (completedOrder) {
      navigator.clipboard.writeText(completedOrder.orderCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-neutral-950/80 backdrop-blur-xs animate-in fade-in"
    >
      <div
        className="relative w-full max-w-xl bg-white dark:bg-[#0C1424] border border-neutral-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-white/10">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              {step === 'CONFIRMATION' ? 'Order Summary' : 'Venue Pickup Order (Demo)'}
            </span>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              {step === 'DETAILS' && 'Step 1 of 2: Customer Contact'}
              {step === 'PAYMENT' && 'Step 2 of 2: Payment Option (Mock)'}
              {step === 'CONFIRMATION' && 'Order Reference & Status'}
            </h3>
          </div>

          {step !== 'CONFIRMATION' && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
          {/* STEP 1: CUSTOMER CONTACT DETAILS */}
          {step === 'DETAILS' && (
            <form onSubmit={handleProceedToPayment} className="space-y-6">
              {/* Item summary banner */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-100 dark:border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                    {product.name}
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {quantity} × ₱{unitPrice.toLocaleString()} · Venue Pickup (Provisional)
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-base sm:text-lg font-black text-neutral-900 dark:text-white">
                    ₱{totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Input Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Maria Santos"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-black/20 text-neutral-900 dark:text-white text-sm focus:outline-hidden focus:border-[#84CC16] focus:ring-1 focus:ring-[#84CC16]"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-rose-500">{errors.fullName}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="0917 123 4567"
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-black/20 text-neutral-900 dark:text-white text-sm focus:outline-hidden focus:border-[#84CC16] focus:ring-1 focus:ring-[#84CC16]"
                    />
                    {errors.mobile && (
                      <p className="mt-1 text-xs text-rose-500">{errors.mobile}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="maria@example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-black/20 text-neutral-900 dark:text-white text-sm focus:outline-hidden focus:border-[#84CC16] focus:ring-1 focus:ring-[#84CC16]"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-rose-500">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                    Player Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Picking up during 5pm session on Court 2"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-black/20 text-neutral-900 dark:text-white text-sm focus:outline-hidden focus:border-[#84CC16] focus:ring-1 focus:ring-[#84CC16]"
                  />
                </div>
              </div>

              {/* Pickup Note */}
              <div className="flex items-start gap-2.5 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-white/[0.02] p-3 rounded-xl">
                <MapPin className="w-4 h-4 text-[#84CC16] shrink-0 mt-0.5" />
                <span>
                  Venue Pickup: Pickup details will be confirmed with your order. Fulfillment arrangements are provisional.
                </span>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-[#0A1120] bg-[#84CC16] hover:bg-[#A3E635] rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: PAYMENT METHOD & REVIEW */}
          {step === 'PAYMENT' && (
            <div className="space-y-6">
              {/* Order breakdown */}
              <div className="space-y-2 p-4 rounded-2xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-100 dark:border-white/5 text-xs">
                <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                  <span>Product</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">{product.name}</span>
                </div>
                <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                  <span>Quantity</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">{quantity} units</span>
                </div>
                <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                  <span>Customer</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">{fullName} ({mobile})</span>
                </div>
                <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                  <span>Fulfillment</span>
                  <span className="font-semibold text-[#3F6212] dark:text-[#A3E635]">Venue Pickup (Details confirmed with order)</span>
                </div>
                <div className="pt-2 border-t border-neutral-200 dark:border-white/10 flex justify-between items-baseline text-sm">
                  <span className="font-bold text-neutral-900 dark:text-white">Estimated Total</span>
                  <span className="text-lg font-black text-neutral-900 dark:text-white">₱{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
                  Select Payment Option (Mock / Prototype)
                </label>

                <div className="space-y-3">
                  {/* Option 1: Mock Option: Pay upon Venue Pickup */}
                  <label
                    onClick={() => setPaymentMethod('VENUE_COUNTER')}
                    className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'VENUE_COUNTER'
                        ? 'border-[#84CC16] bg-[#84CC16]/5 dark:bg-[#84CC16]/10 ring-1 ring-[#84CC16]'
                        : 'border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-[#84CC16] shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-neutral-900 dark:text-white">
                          Mock Option: Pay upon Venue Pickup
                        </span>
                        <span className="text-[11px] font-mono uppercase text-neutral-400">
                          Demo Flow
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                        Simulated pay-upon-pickup flow. Order Status will be Confirmed and Payment Status will be set to Pending. Final payment methods will be determined during backend integration.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Mock E-Wallet */}
                  <label
                    onClick={() => setPaymentMethod('GCASH_MOCK')}
                    className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'GCASH_MOCK'
                        ? 'border-[#84CC16] bg-[#84CC16]/5 dark:bg-[#84CC16]/10 ring-1 ring-[#84CC16]'
                        : 'border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-sm font-bold text-neutral-900 dark:text-white">
                        Mock Option: Simulated E-Wallet
                      </span>
                      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                        Simulated electronic settlement. Sets Payment Status to Paid for demonstration.
                      </p>
                    </div>
                  </label>

                  {/* Option 3: Mock Credit/Debit Card */}
                  <label
                    onClick={() => setPaymentMethod('CARD_MOCK')}
                    className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'CARD_MOCK'
                        ? 'border-[#84CC16] bg-[#84CC16]/5 dark:bg-[#84CC16]/10 ring-1 ring-[#84CC16]'
                        : 'border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-sm font-bold text-neutral-900 dark:text-white">
                        Mock Option: Simulated Card
                      </span>
                      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                        Simulated credit or debit card transaction. Sets Payment Status to Paid for demonstration.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Status Explanation Strip */}
              <div className="p-3 bg-neutral-100 dark:bg-white/5 rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-neutral-800 dark:text-neutral-200">
                  <ShieldCheck className="w-4 h-4 text-[#84CC16]" />
                  <span>Order & Payment Separation (Demo)</span>
                </div>
                <p className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                  Order Status will be recorded as <strong className="text-neutral-900 dark:text-white">Confirmed</strong>. Payment Status will be{' '}
                  <strong className="text-neutral-900 dark:text-white">
                    {paymentMethod === 'VENUE_COUNTER' ? 'Pending (Pay upon collection)' : 'Paid (Simulated)'}
                  </strong>.
                </p>
              </div>

              {/* Payment Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep('DETAILS')}
                  className="px-4 py-2.5 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                >
                  Back to Details
                </button>

                <button
                  type="button"
                  onClick={handleConfirmOrder}
                  className="px-6 py-2.5 text-xs font-bold text-[#0A1120] bg-[#84CC16] hover:bg-[#A3E635] rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
                >
                  <span>Order Paddle</span>
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ORDER CONFIRMATION */}
          {step === 'CONFIRMATION' && completedOrder && (
            <div className="space-y-6 text-center py-2 animate-in zoom-in-95">
              {/* Success Badge */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#84CC16]/20 text-[#84CC16] mb-1">
                <Check className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#3F6212] dark:text-[#A3E635] font-bold">
                  Order Successfully Placed (Demo)
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white mt-1">
                  Order Confirmed
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mt-2">
                  Thank you, <strong className="text-neutral-900 dark:text-white">{completedOrder.customer.fullName}</strong>. Your paddle order has been recorded in the local demo system.
                </p>
              </div>

              {/* Reference Code Box */}
              <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/10 max-w-md mx-auto">
                <span className="text-[11px] font-mono uppercase text-neutral-400 dark:text-neutral-500 block mb-1">
                  Your Pickup Reference Code
                </span>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl sm:text-3xl font-mono font-black text-neutral-900 dark:text-white tracking-wider">
                    {completedOrder.orderCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-neutral-200 dark:hover:bg-white/10 transition-colors"
                    title="Copy code"
                  >
                    {copiedCode ? (
                      <CheckCheck className="w-5 h-5 text-[#84CC16]" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {copiedCode && (
                  <span className="text-[11px] text-[#4D7C0F] dark:text-[#A3E635] font-medium block mt-1">
                    Copied to clipboard!
                  </span>
                )}
              </div>

              {/* Status & Summary Matrix */}
              <div className="max-w-md mx-auto text-left p-4 rounded-xl border border-neutral-100 dark:border-white/5 space-y-2 text-xs bg-white dark:bg-black/20">
                <div className="flex justify-between">
                  <span className="text-neutral-400 font-mono text-[11px]">Item</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {completedOrder.productName} ({completedOrder.quantity}x)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400 font-mono text-[11px]">Estimated Due</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    ₱{completedOrder.totalPricePHP.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400 font-mono text-[11px]">Order Status</span>
                  <span className="font-semibold text-[#4D7C0F] dark:text-[#A3E635]">
                    {completedOrder.orderStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400 font-mono text-[11px]">Payment Status</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {completedOrder.paymentStatus} ({completedOrder.paymentMethod === 'VENUE_COUNTER' ? 'Pending (Pay upon collection)' : 'Paid (Simulated)'})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400 font-mono text-[11px]">Fulfillment</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    Venue Pickup
                  </span>
                </div>
              </div>

              {/* Pickup Note */}
              <div className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
                Pickup details will be confirmed with your order. Keep your reference code <code className="font-mono text-neutral-900 dark:text-white font-bold">{completedOrder.orderCode}</code> for identification.
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-neutral-700 dark:text-neutral-200 bg-neutral-100 hover:bg-neutral-200 dark:bg-white/10 dark:hover:bg-white/15 rounded-xl transition-colors cursor-pointer"
                >
                  Browse More Equipment
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateHome();
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-[#0A1120] bg-[#84CC16] hover:bg-[#A3E635] rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Return to Home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
