import React, { useState } from 'react';
import { X } from 'lucide-react';
import { PaddleProduct } from '../../../types/paddle';
import { adminService } from '../../../services/adminService';

interface PaddleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  paddle?: PaddleProduct | null; // if null, create new
}

export const PaddleEditModal: React.FC<PaddleEditModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  paddle
}) => {
  const isEditing = Boolean(paddle);

  const [name, setName] = useState<string>(paddle?.name || '');
  const [series, setSeries] = useState<PaddleProduct['series']>(paddle?.series || 'Pro Series');
  const [tagline, setTagline] = useState<string>(paddle?.tagline || 'Provisional model description');
  const [description, setDescription] = useState<string>(paddle?.description || 'Provisional mock paddle profile for equipment showcase.');
  const [pricePHP, setPricePHP] = useState<number>(paddle?.pricePHP || 6500);
  const [stockQuantity, setStockQuantity] = useState<number>(paddle?.stockQuantity ?? 10);
  const [featured, setFeatured] = useState<boolean>(paddle?.featured ?? true);
  const [visible, setVisible] = useState<boolean>(paddle?.visible ?? true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const stock = Math.max(0, stockQuantity);
    const stockStatus = stock === 0 ? 'SOLD_OUT' : stock <= 4 ? 'LOW_STOCK' : 'IN_STOCK';

    const item: PaddleProduct = {
      id: paddle?.id || `pdl-${Date.now()}`,
      slug: paddle?.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: name.trim(),
      series,
      tagline: tagline.trim(),
      shortDescription: tagline.trim(),
      description: description.trim(),
      pricePHP: Number(pricePHP),
      stockQuantity: stock,
      stockStatus,
      visible,
      featured,
      specifications: paddle?.specifications || {
        weight: 'TBD',
        surface: 'TBD',
        core: 'TBD',
        coreThickness: 'TBD',
        gripSize: 'TBD',
        shape: 'Standard (TBD)',
        balancePoint: 'TBD',
        playStyle: 'All-Around (TBD)'
      },
      themeColor: paddle?.themeColor || {
        face: '#0A1120',
        bezel: '#84CC16',
        accent: '#A3E635'
      }
    };

    adminService.savePaddleProduct(item);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0B1528] rounded-2xl border border-neutral-200 dark:border-white/10 shadow-2xl overflow-hidden my-8">
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-white/10 flex items-center justify-between bg-neutral-50/50 dark:bg-white/[0.02]">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              {isEditing ? 'Edit Paddle Model' : 'Add New Paddle Model'}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Manage inventory details, price, and showcase visibility
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
              Model Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. PT Sample Paddle Apex"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-[#070D18] text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#84CC16]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                Series
              </label>
              <select
                value={series}
                onChange={(e) => setSeries(e.target.value as PaddleProduct['series'])}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-[#070D18] text-sm text-neutral-900 dark:text-white"
              >
                <option value="Pro Series">Pro Series</option>
                <option value="Velocity Series">Velocity Series</option>
                <option value="Tour Series">Tour Series</option>
                <option value="Club Series">Club Series</option>
                <option value="Limited Edition">Limited Edition</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                Provisional Price (PHP)
              </label>
              <input
                type="number"
                min={0}
                step={100}
                value={pricePHP}
                onChange={(e) => setPricePHP(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-[#070D18] text-sm text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                Stock Quantity (Units)
              </label>
              <input
                type="number"
                min={0}
                value={stockQuantity}
                onChange={(e) => setStockQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-[#070D18] text-sm text-neutral-900 dark:text-white"
              />
              <span className="text-[11px] text-neutral-400 mt-1 block">
                {stockQuantity === 0 ? '⚠️ Stock 0 marks as SOLD OUT' : `${stockQuantity} units available`}
              </span>
            </div>

            <div className="flex flex-col justify-center space-y-2 pt-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-700 dark:text-neutral-300">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded text-[#84CC16] focus:ring-[#84CC16]"
                />
                <span>Featured Showcase</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-700 dark:text-neutral-300">
                <input
                  type="checkbox"
                  checked={visible}
                  onChange={(e) => setVisible(e.target.checked)}
                  className="rounded text-[#84CC16] focus:ring-[#84CC16]"
                />
                <span>Visible in Public Shop</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
              Tagline / Subtitle
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-[#070D18] text-sm text-neutral-900 dark:text-white"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#84CC16] hover:bg-[#65A30D] text-neutral-950 font-bold text-sm shadow-md transition-all active:scale-[0.98]"
            >
              {isEditing ? 'Save Changes' : 'Create Paddle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
