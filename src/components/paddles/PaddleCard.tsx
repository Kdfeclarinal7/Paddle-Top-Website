import React from 'react';
import { ArrowRight, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { PaddleProduct } from '../../types/paddle';
import { PaddleGraphic } from './PaddleGraphic';

interface PaddleCardProps {
  product: PaddleProduct;
  onViewDetails: (product: PaddleProduct) => void;
  onQuickOrder: (product: PaddleProduct) => void;
}

export const PaddleCard: React.FC<PaddleCardProps> = ({
  product,
  onViewDetails,
  onQuickOrder,
}) => {
  const isSoldOut = product.stockStatus === 'SOLD_OUT';
  const isLowStock = product.stockStatus === 'LOW_STOCK';

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border transition-all duration-200 bg-white dark:bg-[#0B1324] ${
        isSoldOut
          ? 'border-neutral-200 dark:border-white/5 opacity-80'
          : 'border-neutral-200/90 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20 hover:shadow-lg'
      }`}
    >
      {/* Top Header & Visual */}
      <div className="p-5 sm:p-6 pb-2">
        {/* Subtle Series & Status Row (Unboxed, Zero-Pill) */}
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider mb-3">
          <span className="text-neutral-500 dark:text-neutral-400 font-semibold">
            {product.series}
          </span>

          {/* Status Indicator */}
          {isSoldOut ? (
            <span className="inline-flex items-center gap-1.5 text-neutral-400 dark:text-neutral-500 font-medium normal-case font-sans">
              <XCircle className="w-3.5 h-3.5" />
              <span>Sold out</span>
            </span>
          ) : isLowStock ? (
            <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium normal-case font-sans">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Only {product.stockQuantity} left</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[#3F6212] dark:text-[#A3E635] font-medium normal-case font-sans">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>In stock</span>
            </span>
          )}
        </div>

        {/* Product Visual */}
        <div
          onClick={() => onViewDetails(product)}
          className="cursor-pointer py-2 flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.02]"
        >
          <PaddleGraphic product={product} size="md" />
        </div>

        {/* Name and Tagline */}
        <div className="mt-4">
          <h3
            onClick={() => onViewDetails(product)}
            className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white cursor-pointer hover:text-[#4D7C0F] dark:hover:text-[#A3E635] transition-colors leading-snug"
          >
            {product.name}
          </h3>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1">
            {product.tagline}
          </p>
        </div>

        {/* Concise Unboxed Specs Grid */}
        <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-white/5 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="block text-[11px] text-neutral-400 dark:text-neutral-500 uppercase font-mono">
              Core
            </span>
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              {product.specifications.core || 'TBD'}
            </span>
          </div>
          <div>
            <span className="block text-[11px] text-neutral-400 dark:text-neutral-500 uppercase font-mono">
              Weight
            </span>
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              {product.specifications.weight || 'TBD'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Pricing & Direct Actions */}
      <div className="p-5 sm:p-6 pt-3 mt-2 border-t border-neutral-100 dark:border-white/5 bg-neutral-50/50 dark:bg-white/[0.02] rounded-b-2xl">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <span className="text-[11px] text-neutral-400 dark:text-neutral-500 block uppercase font-mono">
              Estimated Price
            </span>
            <span className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
              ₱{product.pricePHP.toLocaleString()}
            </span>
          </div>
          <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-mono">
            Provisional PHP
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onViewDetails(product)}
            className="px-3 py-2.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 bg-neutral-100 hover:bg-neutral-200 dark:bg-white/10 dark:hover:bg-white/15 rounded-lg transition-colors cursor-pointer text-center"
          >
            Specs & Details
          </button>

          <button
            type="button"
            disabled={isSoldOut}
            onClick={() => onQuickOrder(product)}
            className={`px-3 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              isSoldOut
                ? 'bg-neutral-200 dark:bg-white/5 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
                : 'bg-[#84CC16] hover:bg-[#A3E635] text-[#0A1120] active:scale-[0.98] shadow-xs'
            }`}
          >
            <span>{isSoldOut ? 'Sold Out' : 'Buy Now'}</span>
            {!isSoldOut && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
