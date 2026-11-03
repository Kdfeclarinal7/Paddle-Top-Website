import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, ShieldCheck, MapPin, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { PaddleProduct } from '../../types/paddle';
import { PaddleGraphic } from './PaddleGraphic';

interface PaddleDetailModalProps {
  product: PaddleProduct | null;
  onClose: () => void;
  onProceedToOrder: (product: PaddleProduct, quantity: number) => void;
}

export const PaddleDetailModal: React.FC<PaddleDetailModalProps> = ({
  product,
  onClose,
  onProceedToOrder,
}) => {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
  }, [product]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const isSoldOut = product.stockStatus === 'SOLD_OUT';
  const maxStock = product.stockQuantity;

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    if (quantity < maxStock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const totalPrice = product.pricePHP * quantity;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-paddle-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-neutral-950/75 backdrop-blur-xs animate-in fade-in"
    >
      <div
        className="relative w-full max-w-3xl bg-white dark:bg-[#0C1424] border border-neutral-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-white/10">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            <span>{product.series}</span>
            <span>·</span>
            <span>Demo Showcase</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Visual Column */}
            <div className="md:col-span-5 flex flex-col items-center justify-center bg-neutral-50 dark:bg-white/[0.02] p-6 rounded-2xl border border-neutral-100 dark:border-white/5">
              <PaddleGraphic product={product} size="lg" className="w-full" />
              
              <div className="mt-4 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                <ShieldCheck className="w-4 h-4 text-[#84CC16]" />
                <span>Venue Pickup (Provisional)</span>
              </div>
            </div>

            {/* Information Column */}
            <div className="md:col-span-7 space-y-6">
              <div>
                {/* Stock Tag */}
                <div className="mb-2">
                  {isSoldOut ? (
                    <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">
                      Currently unavailable (Demo)
                    </span>
                  ) : product.stockStatus === 'LOW_STOCK' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Low stock demo: {product.stockQuantity} remaining
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#3F6212] dark:text-[#A3E635]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Available for venue pickup ({product.stockQuantity} demo units)
                    </span>
                  )}
                </div>

                <h2 id="modal-paddle-title" className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white leading-tight">
                  {product.name}
                </h2>

                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Technical Specifications Matrix */}
              <div className="pt-2 border-t border-neutral-100 dark:border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    Specifications (Provisional)
                  </h4>
                  <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
                    TBD on confirmed stock
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                  <div>
                    <span className="text-neutral-400 dark:text-neutral-500 block font-mono text-[11px]">Weight</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">{product.specifications.weight}</span>
                  </div>

                  <div>
                    <span className="text-neutral-400 dark:text-neutral-500 block font-mono text-[11px]">Core</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">{product.specifications.core}</span>
                  </div>

                  <div>
                    <span className="text-neutral-400 dark:text-neutral-500 block font-mono text-[11px]">Surface</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">{product.specifications.surface}</span>
                  </div>

                  <div>
                    <span className="text-neutral-400 dark:text-neutral-500 block font-mono text-[11px]">Grip</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">{product.specifications.gripSize}</span>
                  </div>

                  <div>
                    <span className="text-neutral-400 dark:text-neutral-500 block font-mono text-[11px]">Paddle Shape</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">{product.specifications.shape}</span>
                  </div>

                  <div>
                    <span className="text-neutral-400 dark:text-neutral-500 block font-mono text-[11px]">Balance</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">{product.specifications.balancePoint || 'TBD'}</span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-neutral-400 dark:text-neutral-500 block font-mono text-[11px]">Play Style Focus</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">{product.specifications.playStyle}</span>
                  </div>
                </div>
              </div>

              {/* Venue Pickup Notice */}
              <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-white/5 text-xs text-neutral-600 dark:text-neutral-300 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#84CC16] shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-neutral-900 dark:text-white">Venue Pickup</strong>
                  <p className="mt-0.5 text-neutral-500 dark:text-neutral-400">
                    Pickup details will be confirmed with your order. Fulfillment arrangements are provisional.
                  </p>
                </div>
              </div>

              {/* Quantity Selector & Action Strip */}
              <div className="pt-4 border-t border-neutral-100 dark:border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                {/* Quantity Control */}
                {!isSoldOut && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                      Qty
                    </span>
                    <div className="inline-flex items-center rounded-lg border border-neutral-200 dark:border-white/15 bg-white dark:bg-black/30 p-1">
                      <button
                        type="button"
                        onClick={handleDecrease}
                        disabled={quantity <= 1}
                        className="p-1 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/10 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-neutral-900 dark:text-white font-mono">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={handleIncrease}
                        disabled={quantity >= maxStock}
                        className="p-1 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/10 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Subtotal & Buy Action */}
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase text-neutral-400 dark:text-neutral-500 block">
                      Estimated Total ({quantity} {quantity > 1 ? 'items' : 'item'})
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
                      ₱{totalPrice.toLocaleString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={isSoldOut}
                    onClick={() => onProceedToOrder(product, quantity)}
                    className={`px-5 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isSoldOut
                        ? 'bg-neutral-200 dark:bg-white/5 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
                        : 'bg-[#84CC16] hover:bg-[#A3E635] text-[#0A1120] active:scale-[0.98] shadow-md'
                    }`}
                  >
                    <span>{isSoldOut ? 'Sold Out' : 'Buy Now'}</span>
                    {!isSoldOut && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
