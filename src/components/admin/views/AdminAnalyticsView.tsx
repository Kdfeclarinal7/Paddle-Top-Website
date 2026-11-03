import React, { useState } from 'react';
import { ChartNoAxesCombined } from 'lucide-react';
import { adminService, formatCurrencyPHP } from '../../../services/adminService';

interface AdminAnalyticsViewProps {
  onRefreshAll: () => void;
}

export const AdminAnalyticsView: React.FC<AdminAnalyticsViewProps> = () => {
  const [range, setRange] = useState<'today' | '7days' | '30days'>('today');

  const analytics = adminService.getAnalytics(range);

  return (
    <div className="space-y-6">
      {/* Header with Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#0A1220] border border-neutral-200 dark:border-white/5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <ChartNoAxesCombined size={20} strokeWidth={1.75} className="text-[#84CC16]" />
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              Venue Performance & Operational Analytics
            </h2>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Sample Metrics
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Demonstration utilization rates, hourly peak demand patterns, and revenue estimates based on local demo data
          </p>
        </div>

        {/* Range Segment */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-100 dark:bg-white/5 self-start sm:self-auto">
          {[
            { id: 'today', label: 'Today' },
            { id: '7days', label: 'Last 7 Days' },
            { id: '30days', label: 'Last 30 Days' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setRange(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                range === tab.id
                  ? 'bg-white dark:bg-[#0B1528] text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI 4-Card Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0A1220] border border-neutral-200 dark:border-white/5 shadow-sm space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Total Revenue ({range})
          </span>
          <div className="text-2xl font-mono font-extrabold text-[#65A30D] dark:text-[#A3E635]">
            {formatCurrencyPHP(analytics.totalRevenuePHP)}
          </div>
          <span className="text-[11px] text-neutral-500 font-medium">
            Court bookings + paddle sales
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0A1220] border border-neutral-200 dark:border-white/5 shadow-sm space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Court Booking Revenue
          </span>
          <div className="text-2xl font-mono font-extrabold text-blue-600 dark:text-blue-400">
            {formatCurrencyPHP(analytics.courtRevenuePHP)}
          </div>
          <span className="text-[11px] text-neutral-500 font-medium">
            Hourly court rentals & walk-ins
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0A1220] border border-neutral-200 dark:border-white/5 shadow-sm space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Paddle Sales Revenue
          </span>
          <div className="text-2xl font-mono font-extrabold text-neutral-900 dark:text-white">
            {formatCurrencyPHP(analytics.paddleRevenuePHP)}
          </div>
          <span className="text-[11px] text-neutral-500 font-medium">
            Equipment shop orders
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0A1220] border border-neutral-200 dark:border-white/5 shadow-sm space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Facility Utilization
          </span>
          <div className="text-2xl font-mono font-extrabold text-[#65A30D] dark:text-[#A3E635]">
            {analytics.averageCourtUtilization}%
          </div>
          <span className="text-[11px] text-neutral-500 font-medium">
            Average across all 4 courts
          </span>
        </div>
      </div>

      {/* 2-Column: Court Breakdown & Hourly Peak Demand */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Court by Court Breakdown */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0A1220] border border-neutral-200 dark:border-white/5 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Individual Court Utilization (Today)
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Hours booked vs total 17 operating hours per court
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {analytics.courtUtilization.map((c) => (
              <div key={c.courtId} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">
                    {c.courtName}
                  </span>
                  <div className="font-mono text-neutral-600 dark:text-neutral-400">
                    <span className="font-bold text-neutral-900 dark:text-white">{c.hoursPlayed} hrs</span> / {c.totalCapacityHours} hrs ({c.percentage}%)
                  </div>
                </div>
                <div className="w-full h-2.5 rounded-full bg-neutral-100 dark:bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#84CC16] transition-all"
                    style={{ width: `${c.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly Peak Demand Histogram */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0A1220] border border-neutral-200 dark:border-white/5 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Today's Peak Hours
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Simultaneous active court sessions across the day
            </p>
          </div>

          <div className="pt-4 h-48 flex items-end gap-1.5 overflow-x-auto pb-2">
            {analytics.hourlyDistribution.map((h) => {
              const heightPct = Math.max(12, (h.count / 4) * 100);
              const isPeak = h.count >= 3;

              return (
                <div key={h.hour} className="flex-1 flex flex-col items-center gap-1.5 min-w-[20px] group">
                  <span className="text-[10px] font-mono font-bold text-neutral-600 dark:text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {h.count}
                  </span>
                  <div
                    className={`w-full rounded-t-md transition-all ${
                      isPeak
                        ? 'bg-[#84CC16]'
                        : h.count > 0
                        ? 'bg-blue-500'
                        : 'bg-neutral-200 dark:bg-white/10'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[9px] font-mono text-neutral-400 leading-none">
                    {h.hour.slice(0, 2)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 border-t border-neutral-100 dark:border-white/5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#84CC16]" /> Prime Peak (3–4 Courts)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Active Session
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
