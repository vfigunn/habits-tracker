import React from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import { DayLog } from "../types";
import { generateCalendarGrid, formatLocalDate, getDaysShort } from "../utils";
import { Check } from "lucide-react";

interface CalendarGridProps {
  year: number;
  month: number;
  logs: Record<string, DayLog>;
  templatesCount: number;
  selectedDateStr: string | null;
  slideDirection: number;
  onSelectDay: (dateStr: string) => void;
  onToggleDayCompleted: (dateStr: string, e?: React.MouseEvent) => void;
}

export default function CalendarGrid({
  year,
  month,
  logs,
  templatesCount,
  selectedDateStr,
  slideDirection,
  onSelectDay,
  onToggleDayCompleted,
}: CalendarGridProps) {
  const { t } = useTranslation();
  const gridDates = generateCalendarGrid(year, month);
  const todayStr = formatLocalDate(new Date());
  const daysShort = getDaysShort(t);

  // Animation variants for the hand-drawn-style bold cross "✕"
  const line1Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 0.9,
      transition: { duration: 0.2, ease: "easeInOut" as const },
    },
  };

  const line2Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 0.9,
      transition: { delay: 0.1, duration: 0.2, ease: "easeInOut" as const },
    },
  };

  const gridVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.015 },
    },
    exit: { opacity: 0, transition: { duration: 0.1 } },
  };

  const cellVariants = {
    hidden: (direction: number) => ({ x: direction * 20, opacity: 0 }),
    show: {
      x: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 300, damping: 25 },
    },
    exit: (direction: number) => ({ x: direction * -20, opacity: 0 }),
  };

  return (
    <div className="w-full neo-card overflow-hidden">
      {/* Week Days Header */}
      <div className="grid grid-cols-7 border-b-2 neo-border bg-gray-100 dark:bg-neutral-800 divide-x neo-divide">
        {daysShort.map((day) => (
          <div
            key={day}
            className="py-2 sm:py-3 text-center text-[9px] sm:text-xs font-black uppercase tracking-widest text-black dark:text-white"
          >
            {/* Show first letter on very small screens, short name on sm+ */}
            <span className="sm:hidden">{day[0]}</span>
            <span className="hidden sm:inline">{day}</span>
          </div>
        ))}
      </div>

      {/* Grid Cells Container with AnimatePresence */}
      <AnimatePresence mode="wait" custom={slideDirection}>
        <motion.div
          key={`${year}-${month}`}
          className="grid grid-cols-7 grid-rows-6 divide-x divide-y neo-divide border-b neo-border"
          variants={gridVariants}
          initial="hidden"
          animate="show"
          exit="exit"
          custom={slideDirection}
        >
          {gridDates.map((date, idx) => {
            const dateStr = formatLocalDate(date);
            const isCurrentMonth = date.getMonth() === month;
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDateStr;
            const log = logs[dateStr];
            const isCompleted = log?.completed || false;

            // Calculate completed tasks for progress indicator
            const hasLogTasks = log?.tasks !== undefined;
            const dayTasks = log?.tasks || [];
            const totalTasks = hasLogTasks ? dayTasks.length : templatesCount;
            const completedTasksCount = dayTasks.filter((t) => t.completed).length;
            const hasTasks = totalTasks > 0;

            return (
              <motion.div
                key={dateStr}
                custom={slideDirection}
                variants={cellVariants}
                id={`day-cell-${dateStr}`}
                onClick={() => onSelectDay(dateStr)}
              className={`relative min-h-[60px] sm:min-h-[80px] md:min-h-[100px] p-1 sm:p-2 md:p-2.5 transition-all duration-150 cursor-pointer group flex flex-col justify-between select-none
                ${isCurrentMonth ? "bg-white text-black dark:bg-[#1a1a1a] dark:text-white" : "bg-gray-100/50 text-gray-300 dark:bg-neutral-800/30 dark:text-neutral-600 opacity-40"}
                ${isSelected ? "bg-yellow-100 dark:bg-yellow-950/40 ring-2 ring-inset ring-black dark:ring-white z-10" : "hover:bg-gray-50 dark:hover:bg-neutral-800/60"}
                border-r border-b neo-border
              `}
              style={{
                // Prevent double border glitch since grid handles outer borders
                borderRightWidth: (idx + 1) % 7 === 0 ? "0px" : "1px",
                borderBottomWidth: idx >= 35 ? "0px" : "1px",
              }}
            >
              {/* Day Number and Quick Complete Toggle */}
              <div className="flex items-start justify-between">
                <span
                  className={`text-[11px] sm:text-sm font-black font-display flex items-center justify-center w-5 h-5 sm:w-7 sm:h-7 transition-colors
                    ${isToday ? "bg-black text-white dark:bg-white dark:text-black" : "text-black dark:text-white"}
                  `}
                >
                  {String(date.getDate()).padStart(2, "0")}
                </span>

                {/* Quick Toggle Cross Button: always visible on mobile, hover on desktop */}
                <button
                  id={`quick-toggle-${dateStr}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleDayCompleted(dateStr, e);
                  }}
                  className={`opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100 transition-opacity p-0.5 sm:p-1 border neo-border hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black bg-white dark:bg-[#1a1a1a] text-black dark:text-white cursor-pointer`}
                  title={isCompleted ? t("calendar.removeCross") : t("calendar.markCross")}
                >
                  <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                </button>
              </div>

              {/* Task Progress Mini-Indicator — hidden on very small screens */}
              {isCurrentMonth && hasTasks && !isCompleted && (
                <div className="mt-1 sm:mt-2 w-full hidden sm:block">
                  <div className="flex justify-between items-center text-[9px] text-gray-500 dark:text-neutral-400 font-mono font-bold uppercase tracking-tight mb-1">
                    <span>{t("calendar.tasks")}</span>
                    <span>
                      {completedTasksCount}/{totalTasks}
                    </span>
                  </div>
                  <div className="w-full bg-white dark:bg-neutral-800 border neo-border h-2.5 overflow-hidden p-0.5">
                    <div
                      className="bg-black dark:bg-yellow-300 h-full transition-all duration-200"
                      style={{
                        width: `${(completedTasksCount / totalTasks) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Compact progress bar for mobile: just a thin colored bar */}
              {isCurrentMonth && hasTasks && !isCompleted && (
                <div className="mt-0.5 sm:hidden w-full">
                  <div className="w-full bg-white dark:bg-neutral-800 border neo-border h-1.5 overflow-hidden p-0.5">
                    <div
                      className="bg-black dark:bg-yellow-300 h-full transition-all duration-200"
                      style={{
                        width: `${(completedTasksCount / totalTasks) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Day Label indicator — smaller on mobile */}
              {isToday && !isCompleted && (
                <div className="text-[7px] sm:text-[8px] font-black uppercase tracking-wider text-black dark:text-white mt-0.5 sm:mt-1">
                  {t("calendar.today")}
                </div>
              )}

              {/* Beautiful animated cross overlay if completed */}
              <AnimatePresence>
                {isCompleted && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-1.5 sm:p-2.5 z-20">
                    <svg
                      viewBox="0 0 100 100"
                      className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 text-red-500"
                      style={{ transform: "rotate(-2deg)" }}
                    >
                      {/* First line of the bold cross */}
                      <motion.path
                        d="M15,15 L85,85"
                        stroke="currentColor"
                        strokeWidth="14"
                        strokeLinecap="square"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={line1Variants}
                      />
                      {/* Second line of the bold cross */}
                      <motion.path
                        d="M85,15 L15,85"
                        stroke="currentColor"
                        strokeWidth="14"
                        strokeLinecap="square"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={line2Variants}
                      />
                    </svg>
                  </div>
                )}
              </AnimatePresence>

                {/* Note indicator icon */}
                {(log?.note || (log?.events && log.events.length > 0)) && (
                  <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 flex items-center pointer-events-none">
                    <span
                      className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-yellow-300 dark:bg-yellow-400 border neo-border"
                      title={t("calendar.hasNotes")}
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
