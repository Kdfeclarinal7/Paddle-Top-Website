import React, { useState, useMemo } from 'react';
import { ReceiptText, Search } from 'lucide-react';
import { AdminTransaction, TransactionType } from '../../../types/admin';
import { adminService, formatCurrencyPHP } from '../../../services/adminService';

interface AdminTransactionsViewProps {
  onRefreshAll: () => void;
}

export const AdminTransactionsView: React.FC<AdminTransactionsViewProps> = () => {
  const [transactions] = useState<AdminTransaction[]>(() => adminService.getTransactions());
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTxn, setSelectedTxn] = useState<AdminTransaction | null>(null);

  // Filtered
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchCode = t.transactionCode.toLowerCase().includes(q);
        const matchName = t.customerName.toLowerCase().includes(q);
        const matchDesc = t.description.toLowerCase().includes(q);
        if (!matchCode && !matchName && !matchDesc) return false;
      }

      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (statusFilter !== 'all' && t.paymentStatus !== statusFilter) return false;

      return true;
    });
  }, [transactions, searchQuery, typeFilter, statusFilter]);

  // Aggregate sums
  const totalAmount = filtered
    .filter(t => t.paymentStatus === 'paid')
    .reduce((sum, t) => sum + t.amountPHP, 0);

  const gcashAmount = filtered
    .filter(t => t.paymentStatus === 'paid' && (t.paymentMethod === 'GCASH' || t.paymentMethod === 'GCASH_MOCK'))
    .reduce((sum, t) => sum + t.amountPHP, 0);

  const cashAmount = filtered
    .filter(t => t.paymentStatus === 'paid' && (t.paymentMethod === 'CASH' || t.paymentMethod === 'VENUE_COUNTER'))
    .reduce((sum, t) => sum + t.amountPHP, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#0A1220] border border-neutral-200 dark:border-white/5 shadow-sm">
        <div className="flex items-center gap-2">
          <ReceiptText size={20} strokeWidth={1.75} className="text-[#84CC16]" />
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            Financial Ledger & Transactions (Demo)
          </h2>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-white/10">
            Local Demo Data
          </span>
        </div>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Chronological demonstration stream of court bookings, walk-in counter receipts, session extensions, and paddle sales
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0A1220] border border-neutral-200 dark:border-white/5 shadow-sm space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Total Ledger Volume
          </span>
          <div className="text-2xl font-mono font-extrabold text-[#65A30D] dark:text-[#A3E635]">
            {formatCurrencyPHP(totalAmount)}
          </div>
          <span className="text-xs text-neutral-500 font-medium">
            {filtered.length} recorded transaction{filtered.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0A1220] border border-neutral-200 dark:border-white/5 shadow-sm space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            GCash QR Collections
          </span>
          <div className="text-2xl font-mono font-extrabold text-blue-600 dark:text-blue-400">
            {formatCurrencyPHP(gcashAmount)}
          </div>
          <span className="text-xs text-neutral-500 font-medium">
            Mobile wallet transactions
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0A1220] border border-neutral-200 dark:border-white/5 shadow-sm space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Cash At Counter
          </span>
          <div className="text-2xl font-mono font-extrabold text-neutral-900 dark:text-white">
            {formatCurrencyPHP(cashAmount)}
          </div>
          <span className="text-xs text-neutral-500 font-medium">
            Front desk cash drawer
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0A1220] border border-neutral-200 dark:border-white/5 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search size={14} strokeWidth={1.75} className="absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by code, customer, or item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/[0.02] text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#84CC16]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0A1220] text-xs font-medium text-neutral-700 dark:text-neutral-300"
            >
              <option value="all">All Types</option>
              <option value="court_booking">Online Court Booking</option>
              <option value="walk_in">Walk-In Court Session</option>
              <option value="court_extension">Session Extension</option>
              <option value="paddle_sale">Paddle Order</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0A1220] text-xs font-medium text-neutral-700 dark:text-neutral-300"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-[#0A1220] rounded-2xl border border-neutral-200 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-white/5 bg-neutral-50 dark:bg-white/[0.02] text-neutral-500 dark:text-neutral-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Txn Code</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4 font-mono">Amount</th>
                <th className="py-3.5 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-neutral-50/70 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-neutral-900 dark:text-white">
                    {t.transactionCode}
                  </td>
                  <td className="py-3.5 px-4 text-neutral-500 dark:text-neutral-400 font-mono text-[11px]">
                    {new Date(t.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}{' '}
                    {new Date(t.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-neutral-100 dark:bg-white/5 text-neutral-700 dark:text-neutral-300">
                      {t.typeLabel}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-neutral-800 dark:text-neutral-200">
                    {t.description}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-neutral-900 dark:text-white">
                      {t.customerName}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-500">
                    {t.paymentMethod.replace('_MOCK', '')}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#65A30D] dark:text-[#A3E635]">
                    {formatCurrencyPHP(t.amountPHP)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedTxn(t)}
                      className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-white/10 hover:border-neutral-400 text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-white dark:bg-[#0B1528] rounded-2xl border border-neutral-200 dark:border-white/10 shadow-2xl p-6 space-y-4">
            <div className="text-center pb-3 border-b border-neutral-200 dark:border-white/5">
              <span className="text-xs font-mono font-bold tracking-widest text-[#84CC16] uppercase">
                PADDLE TOP RECEIPT
              </span>
              <h3 className="text-lg font-mono font-extrabold text-neutral-900 dark:text-white mt-1">
                {selectedTxn.transactionCode}
              </h3>
              <p className="text-xs text-neutral-400 font-mono">
                {new Date(selectedTxn.timestamp).toLocaleString()}
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Customer:</span>
                <span className="font-semibold text-neutral-900 dark:text-white">{selectedTxn.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Item / Service:</span>
                <span className="font-semibold text-neutral-900 dark:text-white text-right max-w-[200px] truncate">{selectedTxn.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Payment Channel:</span>
                <span className="font-mono text-neutral-900 dark:text-white">{selectedTxn.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Payment Status:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">{selectedTxn.paymentStatus}</span>
              </div>
              {selectedTxn.relatedReference && (
                <div className="flex justify-between">
                  <span className="text-neutral-400">Ref Code:</span>
                  <span className="font-mono text-neutral-900 dark:text-white">{selectedTxn.relatedReference}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-neutral-200 dark:border-white/5 flex items-center justify-between">
              <span className="text-sm font-bold text-neutral-900 dark:text-white">Total Amount</span>
              <span className="text-xl font-mono font-extrabold text-[#65A30D] dark:text-[#A3E635]">
                {formatCurrencyPHP(selectedTxn.amountPHP)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setSelectedTxn(null)}
              className="w-full py-2.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold text-xs"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
