import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { formatShortDate, formatDisplayDate, addDays, getTodayString } from '../../utils/dateUtils';

interface DateSelectorProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  const todayStr = getTodayString();
  const isSelectedToday = selectedDate === todayStr;

  // Generate 14 days starting from today
  const dates = Array.from({ length: 14 }).map((_, idx) => addDays(todayStr, idx));

  const handlePrevDay = () => {
    if (selectedDate > todayStr) {
      onSelectDate(addDays(selectedDate, -1));
    }
  };

  const handleNextDay = () => {
    onSelectDate(addDays(selectedDate, 1));
  };

  return (
    <div className="space-y-3">
      {/* Header bar with Month & Prev/Next */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <CalendarIcon className="w-5 h-5 text-[#4D7C0F] dark:text-[#A3E635]" />
          <span className="text-base sm:text-lg font-bold font-display text-neutral-900 dark:text-white">
            {formatDisplayDate(selectedDate)}
          </span>
          {isSelectedToday && (
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase bg-[#84CC16]/15 text-[#3F6212] dark:text-[#A3E635] px-2 py-0.5 rounded">
              Today
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {!isSelectedToday && (
            <button
              type="button"
              onClick={() => onSelectDate(todayStr)}
              className="text-xs font-semibold px-2.5 py-1 rounded-md text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              Today
            </button>
          )}

          <button
            type="button"
            onClick={handlePrevDay}
            disabled={selectedDate <= todayStr}
            aria-label="Previous Day"
            className="p-1.5 rounded-lg border border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleNextDay}
            aria-label="Next Day"
            className="p-1.5 rounded-lg border border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Date Cards */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {dates.map((dateStr) => {
          const { dayName, dayNumber, monthName, isToday } = formatShortDate(dateStr);
          const isSelected = dateStr === selectedDate;

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDate(dateStr)}
              aria-pressed={isSelected}
              className={`shrink-0 flex flex-col items-center justify-center min-w-[62px] sm:min-w-[68px] py-2.5 px-2 rounded-xl transition-all border cursor-pointer ${
                isSelected
                  ? 'bg-[#0A1120] text-white dark:bg-white dark:text-[#0A1120] border-[#0A1120] dark:border-white shadow-sm scale-[1.02]'
                  : 'bg-white dark:bg-[#0E172A] text-neutral-700 dark:text-neutral-300 border-neutral-200/80 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20 hover:bg-neutral-50 dark:hover:bg-white/5'
              }`}
            >
              <span className={`text-[11px] font-medium tracking-wide uppercase ${
                isSelected ? 'text-[#84CC16] dark:text-[#4D7C0F]' : 'text-neutral-500 dark:text-neutral-400'
              }`}>
                {isToday ? 'Today' : dayName}
              </span>
              <span className="text-lg font-bold font-display leading-tight my-0.5">
                {dayNumber}
              </span>
              <span className="text-[10px] text-neutral-400 dark:text-neutral-400">
                {monthName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
