import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DayLog, TaskTemplate, TaskProgress, EventCategory, DailyEvent } from "../types";
import { parseLocalDate, formatLocalDate } from "../utils";
import { motion } from "framer-motion";
import { Check, X, FileText, Calendar, Award, RotateCcw, Pencil, Trash2, Plus, Clock } from "lucide-react";
import TimeBlockModal from "./TimeBlockModal";

interface DayDetailsProps {
  dateStr: string;
  log: DayLog | undefined;
  allLogs: Record<string, DayLog>;
  templates: TaskTemplate[];
  onUpdateLog: (dateStr: string, updatedLog: Partial<DayLog>) => void;
  onClose: () => void;
}

export default function DayDetails({
  dateStr,
  log,
  allLogs,
  templates,
  onUpdateLog,
  onClose,
}: DayDetailsProps) {
  const { t, i18n } = useTranslation();
  const date = parseLocalDate(dateStr);
  
  // Calculate yesterday's date string
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatLocalDate(yesterday);
  const yesterdayLog = allLogs[yesterdayStr];

  const [noteText, setNoteText] = useState(log?.note || "");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskText, setEditTaskText] = useState("");
  
  // Event Journal state
  const [showYesterdayEvents, setShowYesterdayEvents] = useState(false);
  const [newEventText, setNewEventText] = useState("");
  const [newEventCategory, setNewEventCategory] = useState<EventCategory>("learning");
  
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editEventText, setEditEventText] = useState("");

  const [showTimeBlockModal, setShowTimeBlockModal] = useState(false);

  // Update notes local state when dateStr or log changes
  useEffect(() => {
    setNoteText(log?.note || "");
    setEditingTaskId(null);
    setEditTaskText("");
    setShowYesterdayEvents(false);
  }, [dateStr, log]);

  // Format header date using Intl with the active locale
  const locale = i18n.language === "en" ? "en-US" : "es-ES";
  const dateParts = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  // Capitalize first letter (weekday in Spanish/English)
  const parts = dateParts.formatToParts(date);
  const getPart = (type: string) => parts.find((p) => p.type === type)?.value || "";
  const weekday = getPart("weekday");
  const formattedHeaderDate = `${
    weekday.charAt(0).toUpperCase() + weekday.slice(1)
  }, ${getPart("day")} ${getPart("literal")}${getPart("month")}${getPart(
    "literal",
  )} ${getPart("year")}`.replace(/\s+/g, " ");

  // Ensure tasks are initialized
  const currentTasks: TaskProgress[] = React.useMemo(() => {
    // If tasks array exists (even if empty), use it. It means the user might have deleted all tasks.
    if (log && log.tasks !== undefined) {
      return log.tasks;
    }
    // Only fallback to templates if tasks is undefined (day not initialized)
    return templates.map((t) => ({
      id: t.id,
      text: t.text,
      completed: false,
    }));
  }, [log, templates]);

  const isCompleted = log?.completed || false;
  const totalTasks = currentTasks.length;
  const completedTasksCount = currentTasks.filter((t) => t.completed).length;
  const allTasksChecked = totalTasks > 0 && completedTasksCount === totalTasks;

  // Toggle individual task
  const handleToggleTask = (taskId: string) => {
    const updatedTasks = currentTasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t,
    );

    // Check if the update results in all tasks being completed
    const nowAllChecked = updatedTasks.every((t) => t.completed);

    onUpdateLog(dateStr, {
      tasks: updatedTasks,
      // Auto-complete the day if all tasks are checked
      completed: nowAllChecked ? true : isCompleted,
    });
  };

  // Edit individual task text for this day
  const handleSaveTaskEdit = (taskId: string) => {
    const trimmed = editTaskText.trim();
    if (!trimmed) return;
    const updatedTasks = currentTasks.map((t) =>
      t.id === taskId ? { ...t, text: trimmed } : t,
    );
    onUpdateLog(dateStr, { tasks: updatedTasks });
    setEditingTaskId(null);
    setEditTaskText("");
  };

  // Delete individual task from this day
  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = currentTasks.filter((t) => t.id !== taskId);
    const nowAllChecked = updatedTasks.length > 0 && updatedTasks.every((t) => t.completed);
    onUpdateLog(dateStr, {
      tasks: updatedTasks,
      completed: updatedTasks.length === 0 ? false : (nowAllChecked ? true : isCompleted),
    });
  };

  // Toggle general day completion status (the big Cross X on calendar)
  const handleToggleDayComplete = () => {
    const newCompleted = !isCompleted;

    // If marking as complete and there are tasks, we can optionally mark all tasks as completed
    let updatedTasks = [...currentTasks];
    if (newCompleted && totalTasks > 0) {
      updatedTasks = currentTasks.map((t) => ({ ...t, completed: true }));
    } else if (!newCompleted && totalTasks > 0 && allTasksChecked) {
      // If unmarking completion, and all tasks were checked, uncheck them so they can track again
      updatedTasks = currentTasks.map((t) => ({ ...t, completed: false }));
    }

    onUpdateLog(dateStr, {
      completed: newCompleted,
      tasks: updatedTasks,
    });
  };

  // Reset all tasks for this day
  const handleResetDay = () => {
    const resetTasks = currentTasks.map((t) => ({ ...t, completed: false }));
    onUpdateLog(dateStr, {
      completed: false,
      tasks: resetTasks,
      note: "",
    });
    setNoteText("");
  };

  // Handle Note Blur to Save (legacy)
  const handleNoteBlur = () => {
    onUpdateLog(dateStr, { note: noteText });
  };

  // Event Journal Handlers
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newEventText.trim();
    if (!trimmed) return;
    
    const newEvent: DailyEvent = {
      id: Math.random().toString(36).substring(2, 9),
      time: new Date().toLocaleTimeString(i18n.language === "en" ? "en-US" : "es-ES", { hour: '2-digit', minute: '2-digit' }),
      text: trimmed,
      category: newEventCategory,
    };

    const currentEvents = log?.events || [];
    onUpdateLog(dateStr, { events: [...currentEvents, newEvent] });
    setNewEventText("");
  };

  const handleDeleteEvent = (eventId: string) => {
    const currentEvents = log?.events || [];
    onUpdateLog(dateStr, { events: currentEvents.filter(e => e.id !== eventId) });
  };

  const getCategoryIcon = (cat: EventCategory) => {
    switch (cat) {
      case "learning": return "📚";
      case "entertainment": return "📺";
      case "finance": return "💰";
      case "general": return "📝";
      case "health": return "💪";
      case "social": return "👥";
      case "work": return "💼";
      case "travel": return "✈️";
      default: return "📝";
    }
  };

  const handleSaveEventEdit = (eventId: string) => {
    const trimmed = editEventText.trim();
    if (!trimmed) return;
    const currentEvents = log?.events || [];
    const updatedEvents = currentEvents.map((ev) =>
      ev.id === eventId ? { ...ev, text: trimmed } : ev
    );
    onUpdateLog(dateStr, { events: updatedEvents });
    setEditingEventId(null);
    setEditEventText("");
  };

  return (
    <div className="neo-card p-6 relative flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 neo-border pb-4 mb-5">
        <div>
          <div className="flex items-center gap-1.5 text-black dark:text-white text-[10px] font-black tracking-widest uppercase mb-1">
            <Calendar className="w-3.5 h-3.5 text-black dark:text-white" />
            <span>{t("details.title")}</span>
          </div>
          <h3 className="text-base font-black text-black dark:text-white leading-tight uppercase font-display">
            {formattedHeaderDate}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 border-2 neo-border bg-white dark:bg-neutral-800 text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-colors cursor-pointer"
          title={t("details.closePanel")}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-1">
        {/* BIG COMPLETION TOGGLE CARD */}
        <div
          className={`p-5 rounded-none border-2 neo-border transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden
            ${
              isCompleted
                ? "bg-red-50 dark:bg-red-950/20 text-black dark:text-white"
                : "bg-slate-50 dark:bg-neutral-800 text-black dark:text-white"
            }
          `}
        >
          <div className="relative z-10 flex flex-col items-center w-full">
            <span className="text-[10px] font-black tracking-widest uppercase text-gray-500 dark:text-neutral-400 mb-3">
              {t("details.fulfillmentStatus")}
            </span>

            {isCompleted ? (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 border-2 neo-border bg-white dark:bg-neutral-800 flex items-center justify-center text-red-500 font-black text-4xl mb-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                  ✕
                </div>
                <h4 className="text-sm font-black uppercase tracking-wide text-black dark:text-white">
                  {t("details.dayCompleted")}
                </h4>
                <p className="text-[11px] text-gray-600 dark:text-neutral-300 mt-1 max-w-[240px] leading-tight font-medium">
                  {t("details.dayCompletedDesc")}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 border-2 neo-border bg-white dark:bg-neutral-800 flex items-center justify-center text-gray-300 dark:text-neutral-600 mb-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                  <Check className="w-6 h-6 text-gray-400 dark:text-neutral-500" />
                </div>
                <h4 className="text-sm font-black uppercase tracking-wide text-gray-700 dark:text-neutral-300">
                  {t("details.pending")}
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-1 max-w-[240px] leading-tight font-medium">
                  {t("details.pendingDesc")}
                </p>
              </div>
            )}

            <button
              id={`toggle-day-btn-${dateStr}`}
              onClick={handleToggleDayComplete}
              className={`mt-5 w-full py-3 px-4 border-2 neo-border font-black uppercase text-xs tracking-wider transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:dark:shadow-[1px_1px_0px_0px_rgba(255,255,255,1)] flex items-center justify-center gap-2 cursor-pointer
                ${
                  isCompleted
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-yellow-300 text-black hover:bg-yellow-400"
                }
              `}
            >
              {isCompleted ? (
                <>
                  <RotateCcw className="w-4 h-4 stroke-[3]" />
                  <span>{t("details.removeCross")}</span>
                </>
              ) : (
                <>
                  <span className="font-black text-sm">✕</span>
                  <span>{t("details.markCross")}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Time Blocks Button */}
        <button
          onClick={() => setShowTimeBlockModal(true)}
          className="w-full neo-button flex items-center justify-center gap-2 bg-purple-300 hover:bg-purple-400 text-black py-3 mb-6"
        >
          <Clock className="w-5 h-5 stroke-[3]" />
          <span className="text-sm font-black">{t("details.timeBlocks.title")}</span>
        </button>

        {/* DETAILED TASKS LIST */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-neutral-400">
              {t("details.tasks")} ({completedTasksCount}/{totalTasks})
            </h4>
            {isCompleted && totalTasks > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="text-[9px] bg-black dark:bg-yellow-300 text-white dark:text-black font-bold uppercase tracking-wider px-2 py-0.5 border neo-border flex items-center gap-1"
              >
                <Award className="w-3 h-3" /> {t("details.done")}
              </motion.span>
            )}
          </div>

          {totalTasks === 0 ? (
            <div className="text-center py-10 px-4 bg-white dark:bg-neutral-900 border-2 neo-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] text-black dark:text-white flex flex-col items-center">
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 mb-6 relative"
              >
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md overflow-visible">
                  {/* Sun */}
                  <circle cx="75" cy="25" r="12" fill="#facc15" stroke="currentColor" strokeWidth="4" />
                  <line x1="75" y1="5" x2="75" y2="9" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  <line x1="75" y1="41" x2="75" y2="45" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  <line x1="55" y1="25" x2="59" y2="25" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  <line x1="91" y1="25" x2="95" y2="25" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  
                  {/* Steam */}
                  <motion.path 
                    d="M 35 30 Q 45 20 35 10" 
                    fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"
                    animate={{ d: ["M 35 30 Q 45 20 35 10", "M 35 30 Q 25 20 35 10", "M 35 30 Q 45 20 35 10"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.path 
                    d="M 50 35 Q 60 25 50 15" 
                    fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"
                    animate={{ d: ["M 50 35 Q 60 25 50 15", "M 50 35 Q 40 25 50 15", "M 50 35 Q 60 25 50 15"] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  />

                  {/* Cup Handle */}
                  <path d="M 60 50 C 75 50 75 70 55 70" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                  {/* Coffee Cup */}
                  <path d="M 20 40 L 65 40 L 55 85 L 30 85 Z" fill="#ffffff" className="dark:fill-[#121212]" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
                  {/* Stripe on cup */}
                  <line x1="26" y1="65" x2="59" y2="65" stroke="#facc15" strokeWidth="6" />
                </svg>
              </motion.div>
              <h3 className="text-xl font-black uppercase tracking-widest bg-yellow-300 text-black px-3 py-1 border-2 border-black rotate-[-2deg] mb-3">
                {t("details.dayOff")}
              </h3>
              <p className="text-xs font-bold text-gray-500 dark:text-neutral-400 uppercase leading-relaxed max-w-[200px]">
                {t("details.noTasksDesc")}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {currentTasks.map((task) => (
                <div
                  key={task.id}
                  id={`day-task-${task.id}`}
                  className={`border-2 neo-border text-xs font-bold uppercase tracking-wide transition-all select-none
                    ${
                      task.completed
                        ? "bg-gray-100 dark:bg-neutral-800/50 text-gray-400 dark:text-neutral-500"
                        : "bg-white dark:bg-neutral-900 text-black dark:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
                    }
                  `}
                >
                  {editingTaskId === task.id ? (
                    /* Inline edit mode */
                    <div className="flex items-center gap-2 p-2">
                      <input
                        type="text"
                        value={editTaskText}
                        onChange={(e) => setEditTaskText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveTaskEdit(task.id);
                          if (e.key === "Escape") { setEditingTaskId(null); setEditTaskText(""); }
                        }}
                        className="flex-1 text-xs neo-input border-2 px-2 py-1.5 focus:outline-none font-mono min-w-0"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveTaskEdit(task.id)}
                        className="p-1 bg-green-500 text-white border-2 border-black dark:border-white flex-shrink-0 cursor-pointer"
                        title={t("details.saveEdit")}
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => { setEditingTaskId(null); setEditTaskText(""); }}
                        className="p-1 bg-red-500 text-white border-2 border-black dark:border-white flex-shrink-0 cursor-pointer"
                        title={t("details.cancelEdit")}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    /* Normal display mode */
                    <div className="flex items-center gap-3 p-3 group">
                      <div
                        onClick={() => handleToggleTask(task.id)}
                        className={`w-5 h-5 border-2 neo-border flex items-center justify-center transition-colors cursor-pointer flex-shrink-0
                          ${
                            task.completed
                              ? "bg-black dark:bg-white text-white dark:text-black"
                              : "bg-white dark:bg-neutral-900 text-transparent hover:bg-gray-100 dark:hover:bg-neutral-800"
                          }
                        `}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span
                        onClick={() => handleToggleTask(task.id)}
                        className={`flex-1 font-black tracking-tight cursor-pointer ${task.completed ? "line-through" : ""}`}
                      >
                        {task.text}
                      </span>
                      <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTaskId(task.id);
                            setEditTaskText(task.text);
                          }}
                          className="p-1 border-2 border-transparent hover:border-black dark:hover:border-white hover:bg-blue-50 dark:hover:bg-blue-950/25 text-gray-400 dark:text-neutral-400 hover:text-blue-500 cursor-pointer"
                          title={t("details.editTask")}
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(task.id);
                          }}
                          className="p-1 border-2 border-transparent hover:border-black dark:hover:border-white hover:bg-red-50 dark:hover:bg-red-950/25 text-gray-400 dark:text-neutral-400 hover:text-red-500 cursor-pointer"
                          title={t("details.deleteTask")}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* EVENT JOURNAL */}
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center">
            <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-neutral-400">
              <FileText className="w-3.5 h-3.5 text-black dark:text-white" />
              <span>{t("details.dayNotes")}</span>
            </label>
            
            {/* Button to see yesterday */}
            {yesterdayLog?.events && yesterdayLog.events.length > 0 && (
              <button
                onClick={() => setShowYesterdayEvents(!showYesterdayEvents)}
                className="text-[10px] font-bold bg-yellow-300 hover:bg-yellow-400 text-black px-2 py-0.5 border neo-border transition-colors cursor-pointer"
              >
                {showYesterdayEvents ? t("details.hideYesterday") : t("details.seeYesterday")}
              </button>
            )}
          </div>

          {/* Yesterday's events peek */}
          {showYesterdayEvents && yesterdayLog?.events && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="bg-gray-50 dark:bg-neutral-800/50 border-2 border-dashed neo-border p-3 space-y-2 overflow-hidden"
            >
              <h5 className="text-[10px] font-black uppercase text-gray-500 dark:text-neutral-400 mb-2">
                {t("details.yesterdayTitle")} ({yesterdayStr})
              </h5>
              {yesterdayLog.events.map((ev) => (
                <div key={ev.id} className="flex items-start gap-2 text-xs">
                  <span className="text-gray-400 dark:text-neutral-500 font-mono text-[10px] mt-0.5 w-8">{ev.time}</span>
                  <span title={t(`details.cat_${ev.category}`)}>{getCategoryIcon(ev.category)}</span>
                  <span className="text-gray-700 dark:text-neutral-300 font-medium">{ev.text}</span>
                </div>
              ))}
            </motion.div>
          )}

          {/* Add Event Form */}
          <form onSubmit={handleAddEvent} className="flex gap-1.5">
            <select
              value={newEventCategory}
              onChange={(e) => setNewEventCategory(e.target.value as EventCategory)}
              className="neo-input border-2 text-sm p-1.5 focus:outline-none bg-white dark:bg-[#1a1a1a] text-black dark:text-white cursor-pointer"
              title="Category"
            >
              <option value="learning">📚</option>
              <option value="entertainment">📺</option>
              <option value="finance">💰</option>
              <option value="general">📝</option>
              <option value="health">💪</option>
              <option value="social">👥</option>
              <option value="work">💼</option>
              <option value="travel">✈️</option>
            </select>
            <input
              type="text"
              value={newEventText}
              onChange={(e) => setNewEventText(e.target.value)}
              placeholder={t("details.eventPlaceholder")}
              className="flex-1 text-xs neo-input border-2 px-2 py-1.5 focus:outline-none focus:bg-yellow-50/20 dark:focus:bg-yellow-950/20 font-mono placeholder-gray-400 dark:placeholder-neutral-500"
            />
            <button
              type="submit"
              disabled={!newEventText.trim()}
              className="bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white px-3 text-xs font-black uppercase tracking-wider disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Today's Events List */}
          <div className="space-y-1.5 pt-2">
            {!log?.events || log.events.length === 0 ? (
              <p className="text-[10px] text-gray-400 dark:text-neutral-500 font-bold uppercase text-center py-4 border-2 border-dashed border-transparent">
                {t("details.noEventsToday")}
              </p>
            ) : (
              log.events.map((ev) => (
                <div key={ev.id} className="bg-white dark:bg-[#1a1a1a] border-2 neo-border p-2 group shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                  {editingEventId === ev.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editEventText}
                        onChange={(e) => setEditEventText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEventEdit(ev.id);
                          if (e.key === "Escape") { setEditingEventId(null); setEditEventText(""); }
                        }}
                        className="flex-1 text-xs neo-input border-2 px-2 py-1.5 focus:outline-none font-mono min-w-0"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEventEdit(ev.id)}
                        className="p-1 bg-green-500 text-white border-2 border-black dark:border-white flex-shrink-0 cursor-pointer"
                        title={t("details.saveEdit")}
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => { setEditingEventId(null); setEditEventText(""); }}
                        className="p-1 bg-red-500 text-white border-2 border-black dark:border-white flex-shrink-0 cursor-pointer"
                        title={t("details.cancelEdit")}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 dark:text-neutral-500 font-mono text-[9px] mt-0.5 w-8">{ev.time}</span>
                      <span title={t(`details.cat_${ev.category}`)}>{getCategoryIcon(ev.category)}</span>
                      <span className="flex-1 text-xs text-black dark:text-white font-medium">{ev.text}</span>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingEventId(ev.id);
                            setEditEventText(ev.text);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-500 cursor-pointer"
                          title={t("details.editTask")}
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                          title={t("details.deleteTask")}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Legacy Notes Textarea (only render if there's legacy text, to not break old notes) */}
          {noteText && (
            <div className="mt-4">
              <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-1 block">
                Legacy Notes
              </label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onBlur={handleNoteBlur}
                rows={2}
                className="w-full text-[10px] bg-slate-50 dark:bg-neutral-800/50 border-2 border-dashed neo-border p-2 focus:outline-none font-mono text-gray-500 dark:text-neutral-400"
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer controls */}
      <div className="border-t-2 neo-border pt-4 mt-4 flex justify-between items-center bg-white dark:bg-neutral-900">
        <button
          onClick={handleResetDay}
          className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors px-2 py-1 cursor-pointer border-2 border-transparent hover:border-black dark:hover:border-white bg-white dark:bg-neutral-900"
          title={t("details.resetDay")}
        >
          <RotateCcw className="w-3.5 h-3.5 stroke-[3]" />
          <span>{t("details.reset")}</span>
        </button>
        <span className="text-[10px] font-mono font-bold text-white dark:text-black bg-black dark:bg-white px-2 py-1 border neo-border">
          {dateStr}
        </span>
      </div>
      <TimeBlockModal 
        isOpen={showTimeBlockModal} 
        onClose={() => setShowTimeBlockModal(false)}
        dateStr={dateStr}
        log={log || { date: dateStr, completed: false, tasks: [] }}
        onUpdateLog={onUpdateLog}
      />
    </div>
  );
}
