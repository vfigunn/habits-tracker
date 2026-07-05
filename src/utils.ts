import { DayLog } from "./types";
import type { TFunction } from "i18next";

/**
 * Format Date to YYYY-MM-DD using local timezone to avoid off-by-one errors
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parses YYYY-MM-DD string back into a local Date object
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Generates dates for a 42-day calendar grid (6 rows of 7 days)
 * starting on Monday to align with Spanish-style calendar grids.
 */
export function generateCalendarGrid(year: number, month: number): Date[] {
  // First day of the month
  const firstDayOfMonth = new Date(year, month, 1);
  // Day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  let dayOfWeek = firstDayOfMonth.getDay();
  
  // Adjust day of week so Monday is 0, Sunday is 6
  let spacesBefore = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  const grid: Date[] = [];
  
  // Backfill previous month's days
  const startOfGrid = new Date(year, month, 1 - spacesBefore);
  
  for (let i = 0; i < 42; i++) {
    const d = new Date(startOfGrid);
    d.setDate(startOfGrid.getDate() + i);
    grid.push(d);
  }
  
  return grid;
}

/**
 * Calculates current and maximum streaks of completed days
 */
export function calculateStreaks(logs: Record<string, DayLog>): {
  currentStreak: number;
  maxStreak: number;
} {
  // Filter and sort completed dates
  const completedDates = Object.values(logs)
    .filter((log) => log.completed)
    .map((log) => log.date)
    .sort();

  if (completedDates.length === 0) {
    return { currentStreak: 0, maxStreak: 0 };
  }

  // Find unique dates
  const uniqueCompleted = Array.from(new Set(completedDates));
  
  // Helper to get day difference between two date strings
  const getDayDiff = (d1Str: string, d2Str: string) => {
    const d1 = parseLocalDate(d1Str);
    const d2 = parseLocalDate(d2Str);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  // Calculate Max Streak
  let maxStreak = 0;
  let currentTempStreak = 0;
  let lastDateStr: string | null = null;

  for (const dateStr of uniqueCompleted) {
    if (lastDateStr === null) {
      currentTempStreak = 1;
    } else {
      const diff = getDayDiff(lastDateStr, dateStr);
      if (diff === 1) {
        currentTempStreak += 1;
      } else if (diff > 1) {
        if (currentTempStreak > maxStreak) {
          maxStreak = currentTempStreak;
        }
        currentTempStreak = 1;
      }
    }
    lastDateStr = dateStr;
  }
  
  if (currentTempStreak > maxStreak) {
    maxStreak = currentTempStreak;
  }

  // Calculate Current Streak
  // We check today and yesterday
  const todayStr = formatLocalDate(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatLocalDate(yesterday);

  let currentStreak = 0;
  const completedSet = new Set(uniqueCompleted);

  // If today or yesterday is completed, the streak is alive
  const isTodayCompleted = completedSet.has(todayStr);
  const isYesterdayCompleted = completedSet.has(yesterdayStr);

  if (isTodayCompleted || isYesterdayCompleted) {
    let checkDate = isTodayCompleted ? new Date() : yesterday;
    let checkStr = formatLocalDate(checkDate);
    
    while (completedSet.has(checkStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
      checkStr = formatLocalDate(checkDate);
    }
  }

  return {
    currentStreak,
    maxStreak: Math.max(maxStreak, currentStreak),
  };
}

/**
 * Months in Spanish (legacy, kept for reference)
 */
export const MONTHS_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

/**
 * Days of week in Spanish (legacy, kept for reference)
 */
export const DAYS_ES = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

/**
 * Days of week in Spanish short (legacy, kept for reference)
 */
export const DAYS_SHORT_ES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

/**
 * Returns localized month names array using i18n
 */
export function getMonths(t: TFunction): string[] {
  return t("utils.months", { returnObjects: true }) as string[];
}

/**
 * Returns localized full day names array (Monday-first) using i18n
 */
export function getDays(t: TFunction): string[] {
  return t("utils.days", { returnObjects: true }) as string[];
}

/**
 * Returns localized short day names array (Monday-first) using i18n
 */
export function getDaysShort(t: TFunction): string[] {
  return t("utils.daysShort", { returnObjects: true }) as string[];
}
