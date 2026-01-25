import { startOfWeek, endOfWeek, addWeeks, format, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';

export function getWeekKey(date: Date): string {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  return format(start, 'yyyy-MM-dd');
}

export function getWeekDates(weekKey: string): Date[] {
  const start = new Date(weekKey);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function getWeekRange(weekKey: string): string {
  const start = new Date(weekKey);
  const end = addDays(start, 6);
  return `${format(start, 'd MMM', { locale: ru })} - ${format(end, 'd MMM', { locale: ru })}`;
}

export function navigateWeek(currentWeekKey: string, direction: 'prev' | 'next'): string {
  const currentStart = new Date(currentWeekKey);
  const newStart = addWeeks(currentStart, direction === 'next' ? 1 : -1);
  return format(newStart, 'yyyy-MM-dd');
}

export function getCurrentWeekKey(): string {
  return getWeekKey(new Date());
}
