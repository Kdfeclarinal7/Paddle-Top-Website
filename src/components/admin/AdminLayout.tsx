import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Ban,
  Package,
  ReceiptText,
  ChartNoAxesCombined,
  Settings2,
  UserPlus,
  ExternalLink,
  Sun,
  Moon
} from 'lucide-react';
import { AdminViewTab } from '../../types/admin';
import { Logo } from '../brand/Logo';
import { useTheme } from '../../context/ThemeContext';
import { adminService } from '../../services/adminService';
import { AdminTodayView } from './views/AdminTodayView';
import { AdminReservationsView } from './views/AdminReservationsView';
import { AdminClosuresView } from './views/AdminClosuresView';
import { AdminPaddlesView } from './views/AdminPaddlesView';
import { AdminTransactionsView } from './views/AdminTransactionsView';
import { AdminAnalyticsView } from './views/AdminAnalyticsView';
import { AdminSettingsView } from './views/AdminSettingsView';
import { WalkInModal } from './modals/WalkInModal';

interface AdminLayoutProps {
  onNavigateHome: () => void;
  onNavigateBooking: () => void;
  onNavigatePaddles: () => void;
}

const navTabs = [
  { id: 'today' as AdminViewTab, label: 'Today (Live Desk)', icon: LayoutDashboard },
  { id: 'reservations' as AdminViewTab, label: 'Reservations', icon: CalendarDays },
  { id: 'closures' as AdminViewTab, label: 'Closures', icon: Ban },
  { id: 'paddles' as AdminViewTab, label: 'Paddles & Orders', icon: Package },
  { id: 'transactions' as AdminViewTab, label: 'Transactions', icon: ReceiptText },
  { id: 'analytics' as AdminViewTab, label: 'Analytics', icon: ChartNoAxesCombined },
  { id: 'settings' as AdminViewTab, label: 'Settings', icon: Settings2 }
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  onNavigateHome,
  onNavigateBooking,
  onNavigatePaddles
}) => {
  const { theme, toggleTheme } = useTheme();

  // Tab State
  const [activeTab, setActiveTab] = useState<AdminViewTab>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as AdminViewTab | null;
      if (tabParam && ['today', 'reservations', 'closures', 'paddles', 'transactions', 'analytics', 'settings'].includes(tabParam)) {
        return tabParam;
      }
    }
    return 'today';
  });

  const [quickWalkInOpen, setQuickWalkInOpen] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Live Manila Time clock
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          timeZone: 'Asia/Manila',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTabChange = (tab: AdminViewTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.pushState({}, '', url.toString());
    }
  };

  const handleRefreshAll = () => {
    setRefreshKey((k) => k + 1);
  };

  const courts = adminService.getCourtsStatusToday();
  const activeCourtsCount = courts.filter((c) => c.status === 'active' || c.status === 'ending_soon').length;
  const closedCourtsCount = courts.filter((c) => c.status === 'closed').length;

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-[#070D18] text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Operations Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0A1220]/95 backdrop-blur-md border-b border-neutral-200 dark:border-white/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            {/* Left: Brand + Badge */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onNavigateHome}
                className="hover:opacity-80 transition-opacity"
                title="Return to Public Homepage"
              >
                <Logo size="sm" />
              </button>
              <div className="hidden sm:block h-6 w-px bg-neutral-200 dark:bg-white/10" />
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase bg-[#84CC16]/20 text-[#65A30D] dark:text-[#A3E635] border border-[#84CC16]/30">
                  OWNER DESK
                </span>
                <span className="hidden md:inline text-xs text-neutral-400 font-medium">
                  Operations & Court Manager
                </span>
              </div>
            </div>

            {/* Center: Live Clock & Court Status Pill */}
            <div className="hidden lg:flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/5">
                <span className="w-2 h-2 rounded-full bg-[#84CC16] animate-pulse" />
                <span className="text-neutral-500 dark:text-neutral-400">Club Time:</span>
                <span className="font-mono font-bold text-neutral-900 dark:text-white">
                  {currentTime || 'Loading...'} (UTC+8)
                </span>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/5 text-neutral-600 dark:text-neutral-400">
                <span className="font-bold text-neutral-900 dark:text-white">{activeCourtsCount}</span> Active Match{activeCourtsCount !== 1 ? 'es' : ''} ·{' '}
                <span className="font-bold text-neutral-900 dark:text-white">{4 - closedCourtsCount}</span>/4 Courts Open
              </div>
            </div>

            {/* Right: Quick Walk-in + Theme Toggle + Public Link */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setQuickWalkInOpen(true)}
                className="px-3 sm:px-4 py-2 rounded-xl bg-[#84CC16] hover:bg-[#65A30D] text-neutral-950 font-bold text-xs shadow-sm transition-all active:scale-[0.98] flex items-center gap-1.5"
              >
                <UserPlus size={16} strokeWidth={2} />
                <span className="hidden xs:inline">Walk-In</span>
              </button>

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                className="p-2 rounded-xl border border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-600 dark:text-neutral-300 transition-colors"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? (
                  <Sun size={16} strokeWidth={1.75} />
                ) : (
                  <Moon size={16} strokeWidth={1.75} />
                )}
              </button>

              {/* Exit to Public Website */}
              <button
                type="button"
                onClick={onNavigateHome}
                className="px-3 py-2 rounded-xl border border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-1.5"
              >
                <span className="hidden sm:inline">View Public Site</span>
                <ExternalLink size={14} strokeWidth={1.75} />
              </button>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto py-2 -mx-4 px-4 sm:mx-0 sm:px-0 border-t border-neutral-100 dark:border-white/5 no-scrollbar">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-sm font-bold'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/60 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon
                    size={16}
                    strokeWidth={isActive ? 2 : 1.75}
                    className={isActive ? 'text-[#84CC16]' : 'text-neutral-400 dark:text-neutral-500'}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" key={refreshKey}>
        {activeTab === 'today' && <AdminTodayView onRefreshAll={handleRefreshAll} />}
        {activeTab === 'reservations' && <AdminReservationsView onRefreshAll={handleRefreshAll} />}
        {activeTab === 'closures' && <AdminClosuresView onRefreshAll={handleRefreshAll} />}
        {activeTab === 'paddles' && <AdminPaddlesView onRefreshAll={handleRefreshAll} />}
        {activeTab === 'transactions' && <AdminTransactionsView onRefreshAll={handleRefreshAll} />}
        {activeTab === 'analytics' && <AdminAnalyticsView onRefreshAll={handleRefreshAll} />}
        {activeTab === 'settings' && <AdminSettingsView onRefreshAll={handleRefreshAll} />}
      </main>

      {/* Global Quick WalkIn Modal */}
      {quickWalkInOpen && (
        <WalkInModal
          isOpen={quickWalkInOpen}
          onClose={() => setQuickWalkInOpen(false)}
          onSuccess={handleRefreshAll}
        />
      )}
    </div>
  );
};
