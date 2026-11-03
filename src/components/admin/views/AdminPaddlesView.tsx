import React, { useState } from 'react';
import { Package, Plus, CircleCheckBig, PencilLine, X } from 'lucide-react';
import { PaddleProduct, PaddleOrder, OrderStatus } from '../../../types/paddle';
import { adminService, formatCurrencyPHP } from '../../../services/adminService';
import { PaddleEditModal } from '../modals/PaddleEditModal';
import { PaddleGraphic } from '../../paddles/PaddleGraphic';

interface AdminPaddlesViewProps {
  onRefreshAll: () => void;
}

export const AdminPaddlesView: React.FC<AdminPaddlesViewProps> = ({ onRefreshAll }) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory');
  const [paddles, setPaddles] = useState<PaddleProduct[]>(() => adminService.getPaddleInventory());
  const [orders, setOrders] = useState<PaddleOrder[]>(() => adminService.getPaddleOrders());

  const [editPaddle, setEditPaddle] = useState<PaddleProduct | null | undefined>(undefined); // undefined=closed, null=create new
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const refresh = () => {
    setPaddles(adminService.getPaddleInventory());
    setOrders(adminService.getPaddleOrders());
    onRefreshAll();
  };

  const handleStockAdjust = (paddleId: string, currentStock: number, delta: number) => {
    const updated = adminService.updatePaddleStock(paddleId, currentStock + delta);
    if (updated) {
      if (updated.stockQuantity === 0) {
        setToastMsg(`${updated.name} stock reached 0 and is now marked as SOLD OUT.`);
      } else {
        setToastMsg(`${updated.name} stock updated to ${updated.stockQuantity} units.`);
      }
      setTimeout(() => setToastMsg(null), 3000);
      refresh();
    }
  };

  const handleOrderStatusUpdate = (orderId: string, status: OrderStatus) => {
    adminService.updatePaddleOrderStatus(orderId, status);
    setToastMsg(`Order status updated to "${status}".`);
    setTimeout(() => setToastMsg(null), 3000);
    refresh();
  };

  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">Pending</span>;
      case 'Confirmed':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">Confirmed</span>;
      case 'Ready for Pickup':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#84CC16]/20 text-[#65A30D] dark:text-[#A3E635] border border-[#84CC16]/30">Ready for Pickup</span>;
      case 'Completed':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-neutral-200 dark:bg-white/10 text-neutral-700 dark:text-neutral-300">Completed</span>;
      case 'Cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-red-500/10 text-red-600 dark:text-red-400">Cancelled</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#0A1220] border border-neutral-200 dark:border-white/5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Package size={20} strokeWidth={1.75} className="text-[#84CC16]" />
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              Paddle Equipment & Sales Desk
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Manage paddle stock quantities, catalog models, and customer venue pickup orders
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'inventory' && (
            <button
              type="button"
              onClick={() => setEditPaddle(null)}
              className="px-4 py-2.5 rounded-xl bg-[#84CC16] hover:bg-[#65A30D] text-neutral-950 font-bold text-xs shadow-md transition-all active:scale-[0.98] flex items-center gap-1.5"
            >
              <Plus size={16} strokeWidth={2} />
              <span>Add Paddle Model</span>
            </button>
          )}
        </div>
      </div>

      {toastMsg && (
        <div className="p-4 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-xs font-semibold flex items-center justify-between shadow-lg">
          <span className="flex items-center gap-1.5">
            <CircleCheckBig size={16} strokeWidth={1.75} className="text-[#84CC16]" />
            <span>{toastMsg}</span>
          </span>
          <button type="button" onClick={() => setToastMsg(null)} className="opacity-60 hover:opacity-100">
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-white/5 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'inventory'
              ? 'bg-[#84CC16] text-neutral-950 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Paddle Inventory ({paddles.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'orders'
              ? 'bg-[#84CC16] text-neutral-950 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Customer Pickup Orders ({orders.length})
        </button>
      </div>

      {/* Tab 1: Inventory Management */}
      {activeTab === 'inventory' && (
        <div className="bg-white dark:bg-[#0A1220] rounded-2xl border border-neutral-200 dark:border-white/5 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-white/5 bg-neutral-50 dark:bg-white/[0.02] text-neutral-500 dark:text-neutral-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Model & Visual</th>
                  <th className="py-3.5 px-4">Series</th>
                  <th className="py-3.5 px-4">Provisional Price</th>
                  <th className="py-3.5 px-4">Stock Level</th>
                  <th className="py-3.5 px-4">Quick Adjust</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
                {paddles.map((p) => {
                  const isSoldOut = p.stockQuantity === 0;
                  const isLow = p.stockQuantity > 0 && p.stockQuantity <= 4;

                  return (
                    <tr key={p.id} className="hover:bg-neutral-50/70 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-12 flex items-center justify-center bg-neutral-100 dark:bg-white/5 rounded-lg p-0.5 shrink-0 overflow-hidden">
                            <PaddleGraphic product={p} size="sm" className="!h-10 !w-8 transform scale-75" />
                          </div>
                          <div>
                            <div className="font-bold text-neutral-900 dark:text-white">
                              {p.name}
                            </div>
                            <div className="text-[11px] text-neutral-400">
                              {p.tagline}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-neutral-700 dark:text-neutral-300">
                          {p.series}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-neutral-900 dark:text-white">
                        {formatCurrencyPHP(p.pricePHP)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-mono font-extrabold text-sm ${isSoldOut ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-neutral-900 dark:text-white'}`}>
                          {p.stockQuantity} units
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={p.stockQuantity <= 0}
                            onClick={() => handleStockAdjust(p.id, p.stockQuantity, -1)}
                            className="w-7 h-7 rounded-lg border border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none text-xs font-bold flex items-center justify-center transition-colors"
                            title="Decrease stock by 1"
                          >
                            -1
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStockAdjust(p.id, p.stockQuantity, +1)}
                            className="w-7 h-7 rounded-lg border border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 text-xs font-bold flex items-center justify-center transition-colors"
                            title="Increase stock by 1"
                          >
                            +1
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {isSoldOut ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                            Sold Out
                          </span>
                        ) : isLow ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setEditPaddle(p)}
                          className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-white/10 hover:border-neutral-400 dark:hover:border-white/30 text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition-colors inline-flex items-center gap-1.5"
                        >
                          <PencilLine size={12} strokeWidth={1.75} />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Pickup Orders */}
      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-[#0A1220] rounded-2xl border border-neutral-200 dark:border-white/5 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-white/5 bg-neutral-50 dark:bg-white/[0.02] text-neutral-500 dark:text-neutral-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Order Code</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Paddle Item</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Fulfillment Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-neutral-50/70 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-neutral-900 dark:text-white">
                      {o.orderCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-neutral-900 dark:text-white">
                        {o.customer.fullName}
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        {o.customer.mobile}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {o.quantity}x {o.productName}
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        {o.productSeries}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-neutral-900 dark:text-white">
                      {formatCurrencyPHP(o.totalPricePHP)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-neutral-800 dark:text-neutral-200">
                        {o.paymentMethod.replace('_', ' ')}
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        {o.paymentStatus}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {getOrderStatusBadge(o.orderStatus)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {o.orderStatus === 'Confirmed' && (
                          <button
                            type="button"
                            onClick={() => handleOrderStatusUpdate(o.id, 'Ready for Pickup')}
                            className="px-2.5 py-1.5 rounded-lg bg-[#84CC16] hover:bg-[#65A30D] text-neutral-950 text-xs font-bold shadow-sm"
                          >
                            Mark Ready
                          </button>
                        )}
                        {o.orderStatus === 'Ready for Pickup' && (
                          <button
                            type="button"
                            onClick={() => handleOrderStatusUpdate(o.id, 'Completed')}
                            className="px-2.5 py-1.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold shadow-sm"
                          >
                            Mark Picked Up
                          </button>
                        )}
                        {o.orderStatus === 'Completed' && (
                          <span className="text-[11px] text-neutral-400 italic">Fulfilled</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit / Add Modal */}
      {editPaddle !== undefined && (
        <PaddleEditModal
          isOpen={editPaddle !== undefined}
          onClose={() => setEditPaddle(undefined)}
          onSuccess={refresh}
          paddle={editPaddle}
        />
      )}
    </div>
  );
};
