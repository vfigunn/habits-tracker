import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useHabitTracker } from "./hooks/useHabitTracker";
import { formatLocalDate } from "./utils";
import CalendarGrid from "./components/CalendarGrid";
import DayDetails from "./components/DayDetails";
import TaskTemplateConfig from "./components/TaskTemplateConfig";
import StatsPanel from "./components/StatsPanel";
import BackupRestore from "./components/BackupRestore";
import MobileDrawer from "./components/MobileDrawer";
import PerformanceChart from "./components/PerformanceChart";
import { useMediaQuery } from "./hooks/useMediaQuery";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calendar as CalendarIcon,
  HelpCircle,
  Clock,
  X,
  Sun,
  Moon,
} from "lucide-react";

export default function App() {
  const { t, i18n } = useTranslation();
  const {
    state,
    currentYear,
    currentMonth,
    slideDirection,
    selectedDateStr,
    showHowItWorks,
    isDarkMode,
    currentStreak,
    maxStreak,
    setSelectedDateStr,
    setShowHowItWorks,
    setIsDarkMode,
    handlePrevMonth,
    handleNextMonth,
    handleSelectToday,
    handleUpdateLog,
    handleToggleDayCompleted,
    handleAddTemplate,
    handleUpdateTemplate,
    handleDeleteTemplate,
    handleImportState,
    handleResetAllData,
  } = useHabitTracker();

  // Real-time clock
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isViewingCurrentMonth = currentMonth === now.getMonth() && currentYear === now.getFullYear();

  // Mobile drawer state
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0a0a0a] text-black dark:text-white pb-16 transition-colors duration-300">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Navigation / Brand Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-4 border-black dark:border-white pb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 border-2 border-black dark:border-white bg-yellow-300 flex items-center justify-center text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
              <CalendarIcon className="w-6 h-6 stroke-[3] text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-black font-display text-black dark:text-white tracking-tight uppercase">
                {t("app.title")}
              </h1>
              <p className="text-[10px] font-black text-gray-500 dark:text-neutral-400 uppercase tracking-widest mt-0.5">
                {t("app.subtitle")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              id="theme-toggle-btn"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex items-center justify-center p-2 sm:p-3 bg-white dark:bg-neutral-900 text-black dark:text-white border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
              title={isDarkMode ? t("app.lightMode") : t("app.darkMode")}
              aria-pressed={isDarkMode}
            >
              {isDarkMode ? (
                <Sun className="w-4.5 h-4.5 text-yellow-300 stroke-[3]" />
              ) : (
                <Moon className="w-4.5 h-4.5 text-black stroke-[3]" />
              )}
            </button>
            <button
              id="how-it-works-btn"
              onClick={() => setShowHowItWorks(!showHowItWorks)}
              className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider bg-white dark:bg-neutral-900 text-black dark:text-white border-2 border-black dark:border-white px-3 sm:px-4 py-2.5 sm:py-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:dark:shadow-[1px_1px_0px_0px_rgba(255,255,255,1)] transition-all cursor-pointer"
              aria-expanded={showHowItWorks}
            >
              <HelpCircle className="w-4 h-4 text-black dark:text-white stroke-[3]" />
              <span className="hidden sm:inline">{t("app.howItWorks")}</span>
            </button>
            <button
              id="goto-today-btn"
              onClick={handleSelectToday}
              className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider bg-yellow-300 text-black border-2 border-black dark:border-white px-3 sm:px-4 py-2.5 sm:py-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:dark:shadow-[1px_1px_0px_0px_rgba(255,255,255,1)] transition-all cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-black stroke-[3]" />
              <span className="hidden sm:inline">{t("app.goToToday")}</span>
            </button>
          </div>
        </header>

        {/* Explain Card */}
        {showHowItWorks && (
          <div className="bg-yellow-50 dark:bg-yellow-950/20 border-2 border-black dark:border-white rounded-none p-6 text-xs text-black dark:text-white space-y-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] relative">
            <button
              onClick={() => setShowHowItWorks(false)}
              className="absolute top-4 right-4 border-2 border-black dark:border-white bg-white dark:bg-neutral-800 text-black dark:text-white p-1 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>
            <div className="flex items-center gap-2 font-black text-black dark:text-white uppercase tracking-wider text-sm">
              <Sparkles className="w-5 h-5 text-black dark:text-white" />
              <span>{t("app.welcomeTitle")}</span>
            </div>
            <p className="leading-relaxed font-bold uppercase text-gray-700 dark:text-neutral-300">
              {t("app.welcomeDesc")}
            </p>
            <ol className="list-decimal pl-5 space-y-2 font-black uppercase text-black dark:text-white">
              <li>
                <strong>{t("app.welcomeMethod1")}</strong>{" "}
                {t("app.welcomeMethod1Desc")}
              </li>
              <li>
                <strong>{t("app.welcomeMethod2")}</strong>{" "}
                {t("app.welcomeMethod2Desc")}
              </li>
            </ol>
            <p className="text-[10px] font-black text-black dark:text-white uppercase bg-white dark:bg-neutral-900 border border-black dark:border-white p-2 inline-block">
              {t("app.welcomePrivacy")}
            </p>
          </div>
        )}

        {/* Statistics Dashboard Bento Grid */}
        <StatsPanel
          logs={state.logs}
          currentStreak={currentStreak}
          maxStreak={maxStreak}
          year={currentYear}
          month={currentMonth}
        />

        {/* Calendar and Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Calendar View (Col-span 2) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Calendar Controls */}
            <div className="flex items-center justify-between bg-white dark:bg-[#111] rounded-none border-2 border-black dark:border-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
              <div className="flex items-center gap-1.5">
                <button
                  id="prev-month-btn"
                  onClick={handlePrevMonth}
                  className="p-2 border-2 border-black dark:border-white bg-white dark:bg-neutral-800 text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-colors cursor-pointer"
                  title={t("app.prevMonth")}
                >
                  <ChevronLeft className="w-5 h-5 stroke-[3]" />
                </button>
                <button
                  id="next-month-btn"
                  onClick={handleNextMonth}
                  className="p-2 border-2 border-black dark:border-white bg-white dark:bg-neutral-800 text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-colors cursor-pointer"
                  title={t("app.nextMonth")}
                >
                  <ChevronRight className="w-5 h-5 stroke-[3]" />
                </button>
              </div>

              <h2 className="text-base font-black text-black dark:text-white font-display uppercase tracking-wider flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-black dark:text-white flex-shrink-0" />
                <span className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                  <span>
                    {isViewingCurrentMonth 
                      ? now.toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-ES', { weekday: 'long', month: 'long', year: 'numeric' })
                      : `${t(`utils.months.${currentMonth}`)} ${currentYear}`
                    }
                  </span>
                  <span className="text-sm font-mono text-gray-500 dark:text-neutral-400 normal-case tracking-tight">
                    {now.toLocaleTimeString(i18n.language === 'en' ? 'en-US' : 'es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </span>
              </h2>

              <div className="text-[10px] font-black text-white dark:text-black bg-black dark:bg-white px-3 py-1.5 border border-black dark:border-white uppercase tracking-widest">
                {t("app.mondayToSunday")}
              </div>
            </div>

            {/* Calendar Grid component */}
            <CalendarGrid
              year={currentYear}
              month={currentMonth}
              logs={state.logs}
              templatesCount={state.templates.length}
              selectedDateStr={selectedDateStr}
              slideDirection={slideDirection}
              onSelectDay={(dateStr) => {
                setSelectedDateStr(dateStr);
                setIsDrawerOpen(true);
              }}
              onToggleDayCompleted={handleToggleDayCompleted}
            />
          </div>

          {/* Sidebar Panels (Col-span 1) */}
          <div className="hidden lg:block lg:col-span-1 lg:sticky lg:top-8">
            {/* Day Details panel (Desktop) */}
            <DayDetails
              dateStr={selectedDateStr}
              log={state.logs[selectedDateStr]}
              allLogs={state.logs}
              templates={state.templates}
              onUpdateLog={handleUpdateLog}
              onClose={() => setSelectedDateStr(formatLocalDate(new Date()))}
            />
          </div>

          {/* Mobile Drawer (DayDetails for mobile view) */}
          {isMobile && (
            <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
              <div className="pt-2">
                <DayDetails
                  dateStr={selectedDateStr}
                  log={state.logs[selectedDateStr]}
                  allLogs={state.logs}
                  templates={state.templates}
                  onUpdateLog={handleUpdateLog}
                  onClose={() => setIsDrawerOpen(false)}
                />
              </div>
            </MobileDrawer>
          )}
        </div>

        {/* Performance Chart Section */}
        <div className="pt-8 border-t-2 border-black dark:border-white">
          <PerformanceChart logs={state.logs} />
        </div>

        {/* Bottom Configuration & Utility Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t-2 border-black dark:border-white">
          {/* Left Column: Data & Backups (BackupRestore) */}
          <div className="self-start">
            <BackupRestore
              state={state}
              onImportState={handleImportState}
              onResetAllData={handleResetAllData}
            />
          </div>

          {/* Right Column: Habit templates config (TaskTemplateConfig) */}
          <div className="h-full">
            <TaskTemplateConfig
              templates={state.templates}
              onAddTemplate={handleAddTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              onUpdateTemplate={handleUpdateTemplate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
