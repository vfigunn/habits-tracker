import { useState, useEffect } from "react";
import { TrackerState, DayLog, TaskTemplate } from "../types";
import { formatLocalDate, calculateStreaks } from "../utils";

// Default template tasks
const DEFAULT_TEMPLATES: TaskTemplate[] = [
  { id: "1", text: "Beber 2 litros de agua 💧", createdAt: Date.now() - 3000 },
  { id: "2", text: "Hacer 30 min de ejercicio 🏃‍♂️", createdAt: Date.now() - 2000 },
  { id: "3", text: "Leer 15 páginas de un libro 📖", createdAt: Date.now() - 1000 },
];

function createInitialState(): TrackerState {
  const saved = localStorage.getItem("habit_tracker_state");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.logs && parsed.templates) {
        return parsed as TrackerState;
      }
    } catch (e) {
      console.error("Error loading localStorage state:", e);
    }
  }

  // Seed initial demo data for new users
  const initialTemplates = [...DEFAULT_TEMPLATES];
  const initialLogs: Record<string, DayLog> = {};

  const today = new Date();

  // Seed Yesterday as completed
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = formatLocalDate(yesterday);
  initialLogs[yesterdayStr] = {
    date: yesterdayStr,
    completed: true,
    tasks: initialTemplates.map((t) => ({ id: t.id, text: t.text, completed: true })),
    note: "¡Ayer fue un gran día de enfoque absoluto!",
  };

  // Seed 2 days ago as completed
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(today.getDate() - 2);
  const twoDaysAgoStr = formatLocalDate(twoDaysAgo);
  initialLogs[twoDaysAgoStr] = {
    date: twoDaysAgoStr,
    completed: true,
    tasks: initialTemplates.map((t) => ({ id: t.id, text: t.text, completed: true })),
    note: "Completado todo a tiempo antes de cenar.",
  };

  // Seed Today as partially completed
  const todayStr = formatLocalDate(today);
  initialLogs[todayStr] = {
    date: todayStr,
    completed: false,
    tasks: [
      { id: initialTemplates[0].id, text: initialTemplates[0].text, completed: true },
      { id: initialTemplates[1].id, text: initialTemplates[1].text, completed: false },
      { id: initialTemplates[2].id, text: initialTemplates[2].text, completed: false },
    ],
    note: "Progreso del día de hoy en marcha.",
  };

  return {
    logs: initialLogs,
    templates: initialTemplates,
  };
}

export function useHabitTracker() {
  const [state, setState] = useState<TrackerState>(createInitialState);

  // Calendar navigation
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [slideDirection, setSlideDirection] = useState(1);

  // Selected day for details panel (default to today)
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => formatLocalDate(new Date()));

  // How-it-works overlay
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // Dark mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem("darkMode");
    if (stored !== null) return stored === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [isDarkMode]);

  // Auto-save to localStorage on state changes (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem("habit_tracker_state", JSON.stringify(state));
      } catch (err) {
        console.error("Error saving to localStorage (possibly full):", err);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [state]);

  // Navigate month
  const handlePrevMonth = () => {
    setSlideDirection(-1);
    setCurrentMonth((prev) => {
      if (prev === 0) {
        setCurrentYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setSlideDirection(1);
    setCurrentMonth((prev) => {
      if (prev === 11) {
        setCurrentYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const handleSelectToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDateStr(formatLocalDate(today));
  };

  // State modification handlers
  const handleUpdateLog = (dateStr: string, updatedFields: Partial<DayLog>) => {
    setState((prev) => {
      const existingLog = prev.logs[dateStr] || {
        date: dateStr,
        completed: false,
        tasks: prev.templates.map((t) => ({
          id: t.id,
          text: t.text,
          completed: false,
        })),
      };

      const updatedLog: DayLog = {
        ...existingLog,
        ...updatedFields,
      };

      return {
        ...prev,
        logs: {
          ...prev.logs,
          [dateStr]: updatedLog,
        },
      };
    });
  };

    // Handle direct toggle of cross (X) on the calendar
  const handleToggleDayCompleted = (dateStr: string, e?: React.MouseEvent) => {
    void e;
    const existingLog = state.logs[dateStr];
    const isCurrentlyCompleted = existingLog?.completed || false;
    const nextCompletedState = !isCurrentlyCompleted;

    // Build the tasks array (either from log or fallback template)
    const baseTasks =
      existingLog?.tasks !== undefined
        ? existingLog.tasks
        : state.templates.map((t) => ({ id: t.id, text: t.text, completed: false }));

    // If we mark day completed, we also mark all individual tasks completed to stay consistent.
    // If we mark day incomplete, we keep task completion or reset them if they were all true.
    const updatedTasks = nextCompletedState
      ? baseTasks.map((t) => ({ ...t, completed: true }))
      : baseTasks.every((t) => t.completed)
        ? baseTasks.map((t) => ({ ...t, completed: false }))
        : baseTasks;

    handleUpdateLog(dateStr, {
      completed: nextCompletedState,
      tasks: updatedTasks,
    });
  };

  const handleAddTemplate = (text: string) => {
    // Generate ID and timestamp outside setState to ensure idempotency
    // under React StrictMode's double-invocation of state updaters.
    const newTemplate: TaskTemplate = {
      id: Math.random().toString(36).substring(2, 9),
      text,
      createdAt: Date.now(),
    };

    setState((prev) => {
      // Prevent adding if a template with this ID already exists (StrictMode guard)
      if (prev.templates.some((t) => t.id === newTemplate.id)) {
        return prev;
      }

      const updatedTemplates = [...prev.templates, newTemplate];

      // Update existing logs that aren't completed to include the new task
      const updatedLogs = { ...prev.logs };
      Object.keys(updatedLogs).forEach((dateStr) => {
        const log = updatedLogs[dateStr];
        if (!log.completed && (!log.tasks || log.tasks.length === 0)) {
          log.tasks = updatedTemplates.map((t) => ({
            id: t.id,
            text: t.text,
            completed: false,
          }));
        } else if (!log.completed && log.tasks && log.tasks.length > 0) {
          // Only add if not already present
          if (!log.tasks.some((t) => t.id === newTemplate.id)) {
            log.tasks = [
              ...log.tasks,
              { id: newTemplate.id, text: newTemplate.text, completed: false },
            ];
          }
        }
      });

      return {
        templates: updatedTemplates,
        logs: updatedLogs,
      };
    });
  };

  const handleUpdateTemplate = (id: string, text: string) => {
    setState((prev) => {
      const updatedTemplates = prev.templates.map((t) =>
        t.id === id ? { ...t, text } : t
      );

      const updatedLogs = { ...prev.logs };
      Object.keys(updatedLogs).forEach((dateStr) => {
        const log = updatedLogs[dateStr];
        if (log.tasks) {
          log.tasks = log.tasks.map((t) =>
            t.id === id ? { ...t, text } : t
          );
        }
      });

      return {
        templates: updatedTemplates,
        logs: updatedLogs,
      };
    });
  };

  const handleDeleteTemplate = (id: string) => {
    setState((prev) => {
      const updatedTemplates = prev.templates.filter((t) => t.id !== id);

      const updatedLogs = { ...prev.logs };
      Object.keys(updatedLogs).forEach((dateStr) => {
        const log = updatedLogs[dateStr];
        if (log.tasks) {
          log.tasks = log.tasks.filter((t) => t.id !== id);
        }
      });

      return {
        templates: updatedTemplates,
        logs: updatedLogs,
      };
    });
  };

  const handleImportState = (newState: TrackerState) => {
    setState(newState);
  };

  const handleResetAllData = () => {
    setState({
      logs: {},
      templates: DEFAULT_TEMPLATES,
    });
    setSelectedDateStr(formatLocalDate(new Date()));
  };

  // Streaks calculations
  const { currentStreak, maxStreak } = calculateStreaks(state.logs);

  return {
    // State
    state,
    currentYear,
    currentMonth,
    slideDirection,
    selectedDateStr,
    showHowItWorks,
    isDarkMode,
    currentStreak,
    maxStreak,

    // Setters
    setSelectedDateStr,
    setShowHowItWorks,
    setIsDarkMode,

    // Handlers
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
  };
}
