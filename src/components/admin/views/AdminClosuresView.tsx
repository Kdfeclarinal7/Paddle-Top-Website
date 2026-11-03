import React, { useState } from 'react';
import { Ban, Plus, CircleCheckBig, X } from 'lucide-react';
import { CourtClosure } from '../../../types/admin';
import { adminService, formatTimeDisplay } from '../../../services/adminService';
import { ClosureModal } from '../modals/ClosureModal';

interface AdminClosuresViewProps {
  onRefreshAll: () => void;
}

export const AdminClosuresView: React.FC<AdminClosuresViewProps> = ({ onRefreshAll }) => {
  const [closures, setClosures] = useState<CourtClosure[]>(() => adminService.getClosures());
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const refresh = () => {
    setClosures(adminService.getClosures());
    onRefreshAll();
  };

  const handleReopen = (closureId: string) => {
    adminService.reopenCourt(closureId);
    setToastMsg('Court has been reopened and returned to availability rotation.');
    setTimeout(() => setToastMsg(null), 4000);
    refresh();
  };

  const activeClosures = closures.filter(c => c.active);
  const pastClosures = closures.filter(c => !c.active);

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#0A1220] border border-neutral-200 dark:border-white/5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Ban size={20} strokeWidth={1.75} className="text-amber-500" />
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              Court Closures & Maintenance
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Manage weather suspensions, surface maintenance, deep cleaning, or private venue buyouts
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98] flex items-center gap-1.5"
        >
          <Plus size={16} strokeWidth={2} />
          <span>Add Court Closure</span>
        </button>
      </div>

      {toastMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <CircleCheckBig size={16} strokeWidth={1.75} className="text-emerald-600 dark:text-emerald-400" />
            <span>{toastMsg}</span>
          </span>
          <button type="button" onClick={() => setToastMsg(null)} className="text-emerald-500 hover:text-emerald-700">
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Active Closures Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 px-1 flex items-center gap-2">
          <span>Active Closures & Offline Windows</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono">
            {activeClosures.length}
          </span>
        </h3>

        {activeClosures.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-[#0A1220] border border-neutral-200 dark:border-white/5 text-center text-neutral-500 dark:text-neutral-400 space-y-1">
            <CircleCheckBig size={32} strokeWidth={1.75} className="mx-auto text-emerald-500" />
            <div className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm">All 4 Courts Are Operational</div>
            <p className="text-xs">No active maintenance or weather closures are currently in place.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeClosures.map((closure) => (
              <div
                key={closure.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#0B1528] border border-amber-300 dark:border-amber-700/50 shadow-sm space-y-3 relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40">
                      {closure.reason}
                    </span>
                    <h4 className="text-base font-extrabold text-neutral-900 dark:text-white mt-2">
                      {closure.courtName}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleReopen(closure.id)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
                  >
                    Reopen Court
                  </button>
                </div>

                <div className="text-xs text-neutral-600 dark:text-neutral-300 space-y-1 font-mono">
                  <div>
                    <span className="text-neutral-400">Window:</span> {closure.startDate} ({formatTimeDisplay(closure.startTime)}) → {closure.endDate} ({formatTimeDisplay(closure.endTime)})
                  </div>
                  {closure.customNote && (
                    <div className="font-sans text-neutral-500 dark:text-neutral-400 text-[11px] pt-1">
                      Note: "{closure.customNote}"
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Closures History */}
      {pastClosures.length > 0 && (
        <div className="space-y-3 pt-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 px-1">
            Resolved / Historical Closures
          </h3>
          <div className="bg-white dark:bg-[#0A1220] rounded-2xl border border-neutral-200 dark:border-white/5 divide-y divide-neutral-100 dark:divide-white/5 overflow-hidden">
            {pastClosures.map((c) => (
              <div key={c.id} className="p-4 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                <div className="space-y-0.5">
                  <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {c.courtName} · <span className="font-normal">{c.reason}</span>
                  </div>
                  <div className="font-mono text-[11px]">
                    {c.startDate} {formatTimeDisplay(c.startTime)} – {formatTimeDisplay(c.endTime)}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] bg-neutral-100 dark:bg-white/5 text-neutral-500">
                  Resolved / Reopened
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Closure Modal */}
      {showAddModal && (
        <ClosureModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={(_c, count) => {
            setShowAddModal(false);
            if (count > 0) {
              setToastMsg(`Closure active. Notice: ${count} existing booking(s) overlap with this window.`);
            } else {
              setToastMsg('Court closure successfully activated.');
            }
            setTimeout(() => setToastMsg(null), 5000);
            refresh();
          }}
        />
      )}
    </div>
  );
};
