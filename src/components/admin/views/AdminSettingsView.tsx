import React, { useState } from 'react';
import { Settings2, CircleCheckBig, TriangleAlert, X } from 'lucide-react';
import { AdminVenueSettings } from '../../../types/admin';
import { adminService, formatCurrencyPHP } from '../../../services/adminService';

interface AdminSettingsViewProps {
  onRefreshAll: () => void;
}

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({ onRefreshAll }) => {
  const [settings, setSettings] = useState<AdminVenueSettings>(() => adminService.getSettings());
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    adminService.updateSettings(settings);
    setToastMsg('Venue settings saved successfully.');
    setTimeout(() => setToastMsg(null), 3000);
    onRefreshAll();
  };

  const handleResetData = () => {
    adminService.resetAllDemoData();
    setConfirmReset(false);
    setSettings(adminService.getSettings());
    setToastMsg('All demo data has been reset to pristine initial state.');
    setTimeout(() => setToastMsg(null), 4000);
    onRefreshAll();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#0A1220] border border-neutral-200 dark:border-white/5 shadow-sm">
        <div className="flex items-center gap-2">
          <Settings2 size={20} strokeWidth={1.75} className="text-[#84CC16]" />
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            Club Operations & Venue Settings
          </h2>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Provisional Defaults
          </span>
        </div>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Configurable demonstration defaults for hourly pricing, operating schedule, and booking rules. All values represent editable operational placeholders.
        </p>
      </div>

      {toastMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-sm">
          <span className="flex items-center gap-1.5">
            <CircleCheckBig size={16} strokeWidth={1.75} className="text-emerald-600 dark:text-emerald-400" />
            <span>{toastMsg}</span>
          </span>
          <button type="button" onClick={() => setToastMsg(null)} className="text-emerald-500 hover:text-emerald-700">
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Pricing & Rates */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0A1220] border border-neutral-200 dark:border-white/5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Court Rates & Pricing
            </h3>
            <span className="text-[11px] text-neutral-400">Provisional Default: ₱1,200/hr</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                Standard Hourly Court Rate (PHP)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sm font-mono text-neutral-400">₱</span>
                <input
                  type="number"
                  min={500}
                  step={50}
                  value={settings.courtHourlyRatePHP}
                  onChange={(e) => setSettings({ ...settings, courtHourlyRatePHP: Number(e.target.value) })}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-neutral-300 dark:border-white/10 bg-neutral-50 dark:bg-[#070D18] text-sm font-mono font-bold text-neutral-900 dark:text-white"
                />
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                Applies to all 4 courts for both online booking and walk-in calculation.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                Online Temporary Hold Expiration
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={5}
                  max={30}
                  value={settings.holdDurationMinutes}
                  onChange={(e) => setSettings({ ...settings, holdDurationMinutes: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-white/10 bg-neutral-50 dark:bg-[#070D18] text-sm font-mono font-bold text-neutral-900 dark:text-white"
                />
                <span className="text-xs text-neutral-500 shrink-0">minutes</span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                Duration a provisional slot is locked while customer enters details.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Operating Schedule */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0A1220] border border-neutral-200 dark:border-white/5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Daily Operating Hours & Lead Time
            </h3>
            <span className="text-[11px] text-neutral-400">Provisional: 06:00 – 23:00</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                Daily Club Opening Time
              </label>
              <select
                value={settings.operatingHoursStart}
                onChange={(e) => setSettings({ ...settings, operatingHoursStart: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-white/10 bg-neutral-50 dark:bg-[#070D18] text-sm text-neutral-900 dark:text-white"
              >
                <option value="05:00">5:00 AM</option>
                <option value="06:00">6:00 AM (Default)</option>
                <option value="07:00">7:00 AM</option>
                <option value="08:00">8:00 AM</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                Daily Club Closing Time
              </label>
              <select
                value={settings.operatingHoursEnd}
                onChange={(e) => setSettings({ ...settings, operatingHoursEnd: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-white/10 bg-neutral-50 dark:bg-[#070D18] text-sm text-neutral-900 dark:text-white"
              >
                <option value="21:00">9:00 PM</option>
                <option value="22:00">10:00 PM</option>
                <option value="23:00">11:00 PM (Default)</option>
                <option value="00:00">12:00 AM (Midnight)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                Max Advance Booking Window
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={settings.maxBookingDaysAhead}
                  onChange={(e) => setSettings({ ...settings, maxBookingDaysAhead: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-white/10 bg-neutral-50 dark:bg-[#070D18] text-sm font-mono font-bold text-neutral-900 dark:text-white"
                />
                <span className="text-xs text-neutral-500 shrink-0">days</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                Minimum Lead Notice
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={12}
                  value={settings.minLeadTimeHours}
                  onChange={(e) => setSettings({ ...settings, minLeadTimeHours: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-white/10 bg-neutral-50 dark:bg-[#070D18] text-sm font-mono font-bold text-neutral-900 dark:text-white"
                />
                <span className="text-xs text-neutral-500 shrink-0">hour(s)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Venue Information & Policy */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0A1220] border border-neutral-200 dark:border-white/5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
            Venue Identity & Customer Contact
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                Facility Display Name
              </label>
              <input
                type="text"
                value={settings.venueName}
                onChange={(e) => setSettings({ ...settings, venueName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-white/10 bg-neutral-50 dark:bg-[#070D18] text-sm text-neutral-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                Contact Phone
              </label>
              <input
                type="text"
                value={settings.venuePhone}
                onChange={(e) => setSettings({ ...settings, venuePhone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-white/10 bg-neutral-50 dark:bg-[#070D18] text-sm text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
              Rain & Weather Policy Note
            </label>
            <textarea
              rows={2}
              value={settings.rainPolicyNote}
              onChange={(e) => setSettings({ ...settings, rainPolicyNote: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-white/10 bg-neutral-50 dark:bg-[#070D18] text-sm text-neutral-900 dark:text-white"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
          >
            Reset All Demo Data to Defaults...
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#84CC16] hover:bg-[#65A30D] text-neutral-950 font-bold text-sm shadow-md transition-all active:scale-[0.98]"
          >
            Save Venue Configuration
          </button>
        </div>
      </form>

      {/* Reset Confirmation Modal */}
      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-white dark:bg-[#0B1528] rounded-2xl border border-neutral-200 dark:border-white/10 shadow-2xl p-6 space-y-4">
            <div className="text-center">
              <TriangleAlert size={32} strokeWidth={1.75} className="mx-auto text-amber-500 mb-2" />
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Reset All Demo Data?
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                This will restore initial mock bookings, walk-ins, closures, and paddle inventory to their starting state.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="flex-1 py-2 rounded-xl border border-neutral-200 dark:border-white/10 text-xs font-semibold text-neutral-700 dark:text-neutral-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetData}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
