import React, { useState, useMemo } from 'react';
import { UserPlus, Search, CalendarDays } from 'lucide-react';
import { CourtId } from '../../../types';
import { AdminReservation, ReservationStatus } from '../../../types/admin';
import { adminService, formatCurrencyPHP, getTodayDateString, getRelativeDateString } from '../../../services/adminService';
import { ReservationDetailModal } from '../modals/ReservationDetailModal';
import { WalkInModal } from '../modals/WalkInModal';

interface AdminReservationsViewProps {
  onRefreshAll: () => void;
}

export const AdminReservationsView: React.FC<AdminReservationsViewProps> = ({ onRefreshAll }) => {
  const [reservations, setReservations] = useState<AdminReservation[]>(() => adminService.getReservations());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<'today' | 'tomorrow' | 'upcoming' | 'past' | 'all'>('today');
  const [courtFilter, setCourtFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [selectedRes, setSelectedRes] = useState<AdminReservation | null>(null);
  const [showWalkIn, setShowWalkIn] = useState<boolean>(false);

  const refresh = () => {
    setReservations(adminService.getReservations());
    onRefreshAll();
  };

  const todayStr = getTodayDateString();
  const tomorrowStr = getRelativeDateString(1);

  // Filtered reservations
  const filtered = useMemo(() => {
    return reservations.filter((r) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = r.customerName.toLowerCase().includes(q);
        const matchPhone = (r.customerPhone || '').toLowerCase().includes(q);
        const matchRef = r.referenceCode.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchRef) return false;
      }

      // Date Filter
      if (dateFilter === 'today' && r.date !== todayStr) return false;
      if (dateFilter === 'tomorrow' && r.date !== tomorrowStr) return false;
      if (dateFilter === 'upcoming' && r.date < todayStr) return false;
      if (dateFilter === 'past' && r.date >= todayStr) return false;

      // Court Filter
      if (courtFilter !== 'all' && r.courtId !== courtFilter) return false;

      // Status Filter
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;

      return true;
    });
  }, [reservations, searchQuery, dateFilter, courtFilter, statusFilter, todayStr, tomorrowStr]);

  const getStatusBadge = (status: ReservationStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-[#84CC16]/20 text-[#65A30D] dark:text-[#A3E635] border border-[#84CC16]/30">
            Active Now
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            Confirmed
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium uppercase bg-neutral-200 dark:bg-white/10 text-neutral-700 dark:text-neutral-300">
            Completed
          </span>
        );
      case 'no_show':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            No-Show
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#0A1220] border border-neutral-200 dark:border-white/5 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            Court Reservations Desk
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Manage upcoming bookings, check-ins, sessions, and no-show logs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowWalkIn(true)}
            className="px-4 py-2.5 rounded-xl bg-[#84CC16] hover:bg-[#65A30D] text-neutral-950 font-bold text-xs shadow-md transition-all active:scale-[0.98] flex items-center gap-1.5"
          >
            <UserPlus size={16} strokeWidth={2} />
            <span>Register Walk-In</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0A1220] border border-neutral-200 dark:border-white/5 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search size={16} strokeWidth={1.75} className="absolute left-3.5 top-3.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search player name, phone, or code (e.g. PT-90412)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50/50 dark:bg-white/[0.02] text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#84CC16]"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Date Segment */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-100 dark:bg-white/5">
            {[
              { id: 'today', label: 'Today' },
              { id: 'tomorrow', label: 'Tomorrow' },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'past', label: 'Past' },
              { id: 'all', label: 'All Dates' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDateFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  dateFilter === tab.id
                    ? 'bg-white dark:bg-[#0B1528] text-neutral-900 dark:text-white shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Court Dropdown */}
            <select
              value={courtFilter}
              onChange={(e) => setCourtFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0A1220] text-xs font-medium text-neutral-700 dark:text-neutral-300"
            >
              <option value="all">All Courts</option>
              <option value="court-1">Court 1</option>
              <option value="court-2">Court 2</option>
              <option value="court-3">Court 3</option>
              <option value="court-4">Court 4</option>
            </select>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0A1220] text-xs font-medium text-neutral-700 dark:text-neutral-300"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Now</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="no_show">No-Show</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reservation List Table */}
      <div className="bg-white dark:bg-[#0A1220] rounded-2xl border border-neutral-200 dark:border-white/5 overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 dark:text-neutral-400 space-y-2">
            <CalendarDays size={32} strokeWidth={1.75} className="mx-auto text-neutral-400" />
            <div className="font-semibold text-neutral-800 dark:text-neutral-200">No reservations found</div>
            <p className="text-xs">Try selecting a different date range or clearing your search filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-white/5 bg-neutral-50 dark:bg-white/[0.02] text-neutral-500 dark:text-neutral-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Ref Code</th>
                  <th className="py-3.5 px-4">Court & Date</th>
                  <th className="py-3.5 px-4">Time Window</th>
                  <th className="py-3.5 px-4">Player / Lead</th>
                  <th className="py-3.5 px-4">Channel & Payment</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
                {filtered.map((res) => (
                  <tr
                    key={res.id}
                    className="hover:bg-neutral-50/70 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                    onClick={() => setSelectedRes(res)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-neutral-900 dark:text-white">
                      {res.referenceCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {res.courtName}
                      </div>
                      <div className="text-[11px] text-neutral-400 font-mono">
                        {res.date}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-neutral-900 dark:text-white">
                        {res.displayTimeWindow}
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        {res.hours} hour{res.hours > 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-neutral-900 dark:text-white">
                        {res.customerName}
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        {res.customerPhone || 'Counter Walk-in'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-neutral-800 dark:text-neutral-200">
                        {formatCurrencyPHP(res.amountPaidPHP)}
                      </div>
                      <div className="text-[11px] text-neutral-400 flex items-center gap-1">
                        <span>{res.paymentMethod}</span>
                        <span>·</span>
                        <span className="capitalize">{res.playerType}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(res.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setSelectedRes(res)}
                        className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-white/10 hover:border-neutral-400 dark:hover:border-white/30 text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition-colors"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected Reservation Detail Modal */}
      {selectedRes && (
        <ReservationDetailModal
          isOpen={Boolean(selectedRes)}
          onClose={() => setSelectedRes(null)}
          onRefresh={refresh}
          reservation={selectedRes}
        />
      )}

      {/* WalkIn Modal */}
      {showWalkIn && (
        <WalkInModal
          isOpen={showWalkIn}
          onClose={() => setShowWalkIn(false)}
          onSuccess={refresh}
        />
      )}
    </div>
  );
};
