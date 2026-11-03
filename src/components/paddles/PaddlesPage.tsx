import React, { useState, useMemo } from 'react';
import { Search, Sparkles, ShieldCheck, MapPin, RefreshCw, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { BlurFade } from '../ui/MotionPrimitives';
import { INITIAL_PADDLES } from '../../data/paddleProducts';
import { PaddleProduct, PaddleOrder } from '../../types/paddle';
import { PaddleCard } from './PaddleCard';
import { PaddleDetailModal } from './PaddleDetailModal';
import { PaddleOrderModal } from './PaddleOrderModal';

interface PaddlesPageProps {
  onNavigateHome: () => void;
  onNavigateBooking: () => void;
}

type FilterCategory = 'ALL' | 'Pro Series' | 'Velocity Series' | 'Tour Series' | 'Club Series' | 'LOW_STOCK';

export const PaddlesPage: React.FC<PaddlesPageProps> = ({
  onNavigateHome,
  onNavigateBooking,
}) => {
  // Products source: Filter out any items with visible: false (e.g. prototype lab models)
  const [products] = useState<PaddleProduct[]>(() =>
    INITIAL_PADDLES.filter((p) => p.visible && p.stockStatus !== 'HIDDEN')
  );

  const [activeCategory, setActiveCategory] = useState<FilterCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Modal states
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<PaddleProduct | null>(null);
  const [selectedProductForOrder, setSelectedProductForOrder] = useState<{
    product: PaddleProduct;
    quantity: number;
  } | null>(null);

  // Filter logic
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // Category filter
      if (activeCategory === 'LOW_STOCK') {
        if (item.stockStatus !== 'LOW_STOCK') return false;
      } else if (activeCategory !== 'ALL') {
        if (item.series !== activeCategory) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesTagline = item.tagline.toLowerCase().includes(query);
        const matchesCore = item.specifications.core.toLowerCase().includes(query);
        const matchesSurface = item.specifications.surface.toLowerCase().includes(query);
        const matchesPlayStyle = item.specifications.playStyle.toLowerCase().includes(query);
        if (!matchesName && !matchesTagline && !matchesCore && !matchesSurface && !matchesPlayStyle) {
          return false;
        }
      }

      return true;
    });
  }, [products, activeCategory, searchQuery]);

  const handleSimulateReload = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  };

  const handleOpenQuickOrder = (product: PaddleProduct) => {
    setSelectedProductForOrder({
      product,
      quantity: 1,
    });
  };

  const handleProceedFromDetail = (product: PaddleProduct, quantity: number) => {
    setSelectedProductForDetail(null);
    setSelectedProductForOrder({
      product,
      quantity,
    });
  };

  return (
    <div className="flex-1 pt-24 pb-20">
      {/* Breadcrumb / Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center justify-between text-xs font-medium text-neutral-500 dark:text-neutral-400">
          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-1.5 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-2">
            <span>Home</span>
            <span>/</span>
            <span className="text-neutral-900 dark:text-neutral-100 font-bold">Equipment Showcase</span>
          </div>
        </div>
      </div>

      {/* Hero Banner Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <BlurFade yOffset={16} duration={0.4} once={true}>
          <div className="relative rounded-3xl bg-gradient-to-br from-[#060B14] via-[#0A1220] to-[#121E36] text-white p-8 sm:p-12 border border-white/10 overflow-hidden shadow-2xl">
            {/* Background athletic accent glow */}
            <div
              aria-hidden="true"
              className="absolute -top-12 -right-12 w-96 h-96 bg-[#84CC16]/12 blur-[110px] rounded-full pointer-events-none"
            />

            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#84CC16]/15 text-[#A3E635] text-xs font-mono font-bold tracking-wider uppercase mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>PADDLE TOP Equipment Showcase (Demo)</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight font-display">
                Paddle Showcase & Equipment
              </h1>

              <p className="mt-4 text-base sm:text-lg text-neutral-300 leading-relaxed max-w-2xl">
                Explore paddle models and equipment concepts. All items, specifications, and pricing shown here are provisional demonstration data. Pickup details will be confirmed with your order.
              </p>

              {/* Venue Pickup Highlights (Zero-Pill, Unboxed) */}
              <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-neutral-300">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#84CC16] shrink-0" />
                  <span>Venue Pickup (Provisional)</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#84CC16] shrink-0" />
                  <span>Pickup details confirmed with order</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#84CC16] shrink-0" />
                  <span>Provisional pricing & sample inventory</span>
                </div>
              </div>
            </div>
          </div>
        </BlurFade>
      </section>

      {/* Main Catalog Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Controls Bar: Search + Category Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-white/10 mb-8">
          {/* Category Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveCategory('ALL')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeCategory === 'ALL'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-white/5'
              }`}
            >
              All Available ({products.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('Pro Series')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeCategory === 'Pro Series'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-white/5'
              }`}
            >
              Pro Series
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('Velocity Series')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeCategory === 'Velocity Series'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-white/5'
              }`}
            >
              Velocity Series
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('Tour Series')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeCategory === 'Tour Series'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-white/5'
              }`}
            >
              Tour Series
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('Club Series')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeCategory === 'Club Series'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-white/5'
              }`}
            >
              Club Series
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('LOW_STOCK')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeCategory === 'LOW_STOCK'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-white/5'
              }`}
            >
              Low Stock Alert
            </button>
          </div>

          {/* Search Box + Refresh */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search paddles or specs..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-black/20 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-hidden focus:border-[#84CC16] focus:ring-1 focus:ring-[#84CC16]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleSimulateReload}
              title="Refresh catalog list"
              className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white border border-neutral-200 dark:border-white/10 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Catalog Grid or Empty/Loading States */}
        {isLoading ? (
          /* Skeleton Loading Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-2xl border border-neutral-200 dark:border-white/5 p-6 space-y-4 animate-pulse bg-white dark:bg-[#0B1324]"
              >
                <div className="h-4 bg-neutral-200 dark:bg-white/5 rounded w-1/3" />
                <div className="h-48 bg-neutral-100 dark:bg-white/5 rounded-xl" />
                <div className="h-6 bg-neutral-200 dark:bg-white/5 rounded w-2/3" />
                <div className="h-4 bg-neutral-100 dark:bg-white/5 rounded w-1/2" />
                <div className="h-10 bg-neutral-200 dark:bg-white/5 rounded-xl pt-4" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty State */
          <div className="py-16 text-center rounded-3xl border border-dashed border-neutral-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02]">
            <SlidersHorizontal className="w-10 h-10 mx-auto text-neutral-400 mb-3" />
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              No matching equipment found
            </h3>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
              We couldn't find any paddles matching your filter or query. Try adjusting your search term or view all available models.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('ALL');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 text-xs font-bold text-[#0A1120] bg-[#84CC16] hover:bg-[#A3E635] rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Real Products Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <PaddleCard
                key={product.id}
                product={product}
                onViewDetails={(prod) => setSelectedProductForDetail(prod)}
                onQuickOrder={handleOpenQuickOrder}
              />
            ))}
          </div>
        )}

        {/* Bottom Booking Cross-link Section */}
        <div className="mt-16 p-8 rounded-3xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-lg font-bold text-neutral-900 dark:text-white">
              Want to test equipment during court play?
            </h4>
            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400 max-w-xl leading-relaxed">
              Book any of our 4 courts. Demo equipment availability and pickup procedures will be confirmed upon arrival.
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateBooking}
            className="shrink-0 px-6 py-3 text-xs font-bold text-[#0A1120] bg-[#84CC16] hover:bg-[#A3E635] active:scale-[0.98] rounded-xl transition-all shadow-sm cursor-pointer"
          >
            Book a Court
          </button>
        </div>
      </section>

      {/* Product Detail Modal */}
      {selectedProductForDetail && (
        <PaddleDetailModal
          product={selectedProductForDetail}
          onClose={() => setSelectedProductForDetail(null)}
          onProceedToOrder={handleProceedFromDetail}
        />
      )}

      {/* Direct Order / Checkout Modal */}
      {selectedProductForOrder && (
        <PaddleOrderModal
          product={selectedProductForOrder.product}
          quantity={selectedProductForOrder.quantity}
          onClose={() => setSelectedProductForOrder(null)}
          onOrderCompleted={(_order: PaddleOrder) => {
            // Can be expanded if needed
          }}
          onNavigateHome={onNavigateHome}
        />
      )}
    </div>
  );
};
