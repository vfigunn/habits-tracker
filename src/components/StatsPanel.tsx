import { useTranslation } from "react-i18next";
import { DayLog } from "../types";
import { Flame, Trophy } from "lucide-react";

interface StatsPanelProps {
  logs: Record<string, DayLog>;
  currentStreak: number;
  maxStreak: number;
  year: number;
  month: number;
}

export default function StatsPanel({
  logs,
  currentStreak,
  maxStreak,
  year,
  month,
}: StatsPanelProps) {
  const { t, i18n } = useTranslation();

  // Get days in the specific month
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  // Filter logs for this specific month
  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const completedDaysInMonth = Object.values(logs).filter(
    (log) => log.date.startsWith(monthPrefix) && log.completed
  ).length;

  // Monthly percentage
  const monthlyPercentage =
    totalDaysInMonth > 0
      ? Math.round((completedDaysInMonth / totalDaysInMonth) * 100)
      : 0;

  // Motivational message via i18n
  let feedbackTitleKey = "stats.feedback.start_title";
  let feedbackDescKey = "stats.feedback.start_desc";
  
  if (monthlyPercentage > 85) {
    feedbackTitleKey = "stats.feedback.extraordinary_title";
    feedbackDescKey = "stats.feedback.extraordinary_desc";
  } else if (monthlyPercentage > 50) {
    feedbackTitleKey = "stats.feedback.consistency_title";
    feedbackDescKey = "stats.feedback.consistency_desc";
  } else if (monthlyPercentage > 20) {
    feedbackTitleKey = "stats.feedback.progress_title";
    feedbackDescKey = "stats.feedback.progress_desc";
  } else if (completedDaysInMonth > 0) {
    feedbackTitleKey = "stats.feedback.goodStart_title";
    feedbackDescKey = "stats.feedback.goodStart_desc";
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
      {/* Monthly Progress Circle Card */}
      <div className="neo-card p-6 flex flex-col sm:flex-row items-center gap-6 col-span-1 md:col-span-2">
        <div className="relative flex-shrink-0 w-24 h-24 border-2 border-black dark:border-white bg-slate-50 dark:bg-neutral-800 p-1">
          {/* Radial progress circle */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-gray-200 dark:text-neutral-700"
              strokeWidth="4"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-black dark:text-yellow-300 transition-all duration-500"
              strokeDasharray={`${monthlyPercentage}, 100`}
              strokeWidth="4"
              strokeLinecap="square"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black font-display text-black dark:text-white leading-none">
              {monthlyPercentage}%
            </span>
            <span className="text-[9px] font-black text-black/60 dark:text-white/60 uppercase tracking-widest mt-1">
              {t("stats.achieved")}
            </span>
          </div>
        </div>
        
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-neutral-400">
            {t("stats.monthlyProgress")}
          </h4>
          <p className="text-lg font-black text-black dark:text-white mt-1 leading-tight uppercase font-display">
            {t(feedbackTitleKey)}
          </p>
          <p className="text-xs text-gray-600 dark:text-neutral-300 mt-1 font-medium leading-snug">
            {t(feedbackDescKey)}
          </p>
          
          <div className="mt-4 flex items-center justify-center sm:justify-start gap-2">
            <span className="text-xs font-bold text-gray-500 dark:text-neutral-400">{t("stats.completedDays")}</span>
            <span className="bg-black dark:bg-yellow-300 text-white dark:text-black text-xs font-mono font-bold px-2 py-0.5 border border-black dark:border-white">
              {completedDaysInMonth} / {totalDaysInMonth}
            </span>
          </div>
        </div>
      </div>

      {/* Current Streak */}
      <div className="neo-card p-6 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-gray-500 dark:text-neutral-400 uppercase tracking-widest">
            {t("stats.currentStreak")}
          </span>
          <div className="p-2 bg-yellow-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:bg-yellow-300 dark:border-white dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
            <Flame className="w-5 h-5 fill-current" />
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-4xl font-black font-display text-black dark:text-white leading-none">
            {currentStreak}{" "}
            <span className="text-xs font-bold tracking-widest uppercase text-gray-500 dark:text-neutral-400 block mt-1">
              {currentStreak === 1 ? t("stats.dayFollowed") : t("stats.daysFollowed")}
            </span>
          </h3>
          <p className="text-[11px] font-bold text-gray-400 dark:text-neutral-400 mt-3 leading-snug uppercase">
            {t("stats.streakAdvice")}
          </p>
        </div>
      </div>

      {/* Max Streak */}
      <div className="neo-card p-4 sm:p-6 flex flex-col justify-between h-full min-h-[140px]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-gray-500 dark:text-neutral-400 uppercase tracking-widest">
            {t("stats.historicalRecord")}
          </span>
          <div className="p-2 bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
            <Trophy className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-3xl sm:text-4xl font-black font-display text-black dark:text-white leading-none">
            {maxStreak}{" "}
            <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500 dark:text-neutral-400 block mt-1">
              {maxStreak === 1 ? t("stats.dayMax") : t("stats.daysMax")}
            </span>
          </h3>
        </div>
      </div>
    </div>
  );
}
