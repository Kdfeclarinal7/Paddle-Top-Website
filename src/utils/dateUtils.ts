// Date utilities for PADDLE TOP booking flow

export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(dateStr: string, days: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatDateString(d);
}

export function formatDisplayDate(dateStr: string): string {
  const d = parseDate(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShortDate(dateStr: string): {
  dayName: string;
  dayNumber: number;
  monthName: string;
  isToday: boolean;
} {
  const d = parseDate(dateStr);
  const todayStr = getTodayString();
  return {
    dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
    dayNumber: d.getDate(),
    monthName: d.toLocaleDateString('en-US', { month: 'short' }),
    isToday: dateStr === todayStr,
  };
}

export function getDatesWindow(startDateStr: string, daysCount = 14): string[] {
  const dates: string[] = [];
  for (let i = 0; i < daysCount; i++) {
    dates.push(addDays(startDateStr, i));
  }
  return dates;
}
