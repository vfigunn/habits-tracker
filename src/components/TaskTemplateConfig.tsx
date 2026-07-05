import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { TaskTemplate } from "../types";
import { Plus, Trash2, ListTodo, Sparkles, Pencil, Check, X } from "lucide-react";

interface TaskTemplateConfigProps {
  templates: TaskTemplate[];
  onAddTemplate: (text: string) => void;
  onDeleteTemplate: (id: string) => void;
  onUpdateTemplate: (id: string, text: string) => void;
}

export default function TaskTemplateConfig({
  templates,
  onAddTemplate,
  onDeleteTemplate,
  onUpdateTemplate,
}: TaskTemplateConfigProps) {
  const { t } = useTranslation();
  const [newHabitText, setNewHabitText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // Presets use i18n keys so they change with locale
  const PRESET_HABITS = [
    t("template.presetWater"),
    t("template.presetExercise"),
    t("template.presetRead"),
    t("template.presetMeditate"),
    t("template.presetCode"),
    t("template.presetHealthy"),
    t("template.presetSleep"),
    t("template.presetGratitude"),
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newHabitText.trim();
    if (!trimmed) return;
    if (templates.some((t) => t.text.toLowerCase() === trimmed.toLowerCase())) return;
    onAddTemplate(trimmed);
    setNewHabitText("");
  };

  const handleAddPreset = (text: string) => {
    // Avoid duplicates
    if (templates.some((t) => t.text.toLowerCase() === text.toLowerCase())) return;
    onAddTemplate(text);
  };

  return (
    <div className="neo-card p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-1.5 text-black dark:text-white text-[10px] font-black tracking-widest uppercase mb-1">
        <ListTodo className="w-3.5 h-3.5 text-black dark:text-white" />
        <span>{t("template.title")}</span>
      </div>
      <h3 className="text-lg font-black text-black dark:text-white mb-3 uppercase font-display">
        {t("template.yourDailyHabits")}
      </h3>
      <p className="text-xs text-gray-600 dark:text-neutral-300 mb-4 leading-relaxed">
        {t("template.description")}
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-5">
        <input
          id="new-habit-input"
          type="text"
          value={newHabitText}
          onChange={(e) => setNewHabitText(e.target.value)}
          placeholder={t("template.placeholder")}
          className="flex-1 text-xs neo-input border-2 px-3 py-3 focus:outline-none focus:bg-yellow-50/20 dark:focus:bg-yellow-950/20 font-mono placeholder-gray-400 dark:placeholder-neutral-500"
        />
        <button
          id="add-habit-btn"
          type="submit"
          className="bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-neutral-100 text-white dark:text-black rounded-none border-2 border-black dark:border-white px-4 py-3 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:dark:shadow-[1px_1px_0px_0px_rgba(255,255,255,1)] transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{t("template.add")}</span>
        </button>
      </form>

      {/* Scrollable list of current habits */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-5 max-h-[220px] pr-1">
        {templates.length === 0 ? (
          <div className="text-center py-10 px-4 bg-white dark:bg-neutral-900 border-2 neo-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] text-black dark:text-white flex flex-col items-center">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="w-24 h-24 mb-6 relative"
            >
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md overflow-visible">
                {/* Impact stars */}
                <motion.path d="M 15 80 L 10 75" stroke="#facc15" strokeWidth="4" strokeLinecap="round" animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
                <motion.path d="M 85 80 L 90 75" stroke="#facc15" strokeWidth="4" strokeLinecap="round" animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2.2, repeat: Infinity, delay: 0.3 }} />
                
                {/* 3D Isometric Cube / Block */}
                <motion.g 
                  animate={{ y: [-3, 3, -3] }} 
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  {/* Top face */}
                  <polygon points="50,20 80,35 50,50 20,35" fill="#facc15" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
                  {/* Left face */}
                  <polygon points="20,35 50,50 50,80 20,65" fill="#ffffff" className="dark:fill-[#1a1a1a]" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
                  {/* Right face */}
                  <polygon points="50,50 80,35 80,65 50,80" fill="#e5e5e5" className="dark:fill-[#2a2a2a]" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
                  {/* Checkmark on right face */}
                  <path d="M 60 55 L 65 65 L 75 45" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                </motion.g>
              </svg>
            </motion.div>
            <h3 className="text-xl font-black uppercase tracking-widest bg-yellow-300 text-black px-3 py-1 border-2 border-black rotate-[2deg] mb-3">
              {t("template.blankCanvas")}
            </h3>
            <p className="text-xs font-bold text-gray-500 dark:text-neutral-400 uppercase leading-relaxed max-w-[220px]">
              {t("template.noTasksDesc")}
            </p>
          </div>
        ) : (
          templates.map((template) => (
            <div
              key={template.id}
              id={`habit-template-item-${template.id}`}
              className="flex items-center justify-between p-3 bg-white dark:bg-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-neutral-800/80 border-2 neo-border rounded-none text-xs font-bold uppercase tracking-wide text-black dark:text-white transition-colors group shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
            >
              {editingId === template.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="flex-1 text-xs neo-input border-2 px-2 py-1 focus:outline-none font-mono"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      if (editText.trim()) onUpdateTemplate(template.id, editText.trim());
                      setEditingId(null);
                    }}
                    className="p-1 bg-green-500 text-white border-2 border-black dark:border-white"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditText("");
                    }}
                    className="p-1 bg-red-500 text-white border-2 border-black dark:border-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="truncate pr-2">{template.text}</span>
                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={() => {
                        setEditingId(template.id);
                        setEditText(template.text);
                      }}
                      className="p-1.5 border-2 border-transparent hover:border-black dark:hover:border-white hover:bg-blue-50 dark:hover:bg-blue-950/25 text-gray-400 dark:text-neutral-400 hover:text-blue-500 cursor-pointer"
                      title={t("template.editTask")}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`delete-habit-btn-${template.id}`}
                      type="button"
                      onClick={() => onDeleteTemplate(template.id)}
                      className="p-1.5 border-2 border-transparent hover:border-black dark:hover:border-white hover:bg-red-50 dark:hover:bg-red-950/25 text-gray-400 dark:text-neutral-400 hover:text-red-500 dark:hover:text-red-400 cursor-pointer"
                      title={t("template.deleteTask")}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Preset Habits Panel */}
      <div className="border-t-2 neo-border pt-4 mt-auto">
        <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-neutral-400 uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5 text-black dark:text-white" />
          <span>{t("template.suggestions")}</span>
        </div>
        <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto pr-1">
          {PRESET_HABITS.map((preset) => {
            const isAdded = templates.some((t) => t.text.toLowerCase() === preset.toLowerCase());
            return (
              <button
                key={preset}
                type="button"
                onClick={() => handleAddPreset(preset)}
                disabled={isAdded}
                className={`text-[10px] px-3 py-2 font-black uppercase tracking-wider border-2 neo-border transition-all cursor-pointer select-none
                  ${
                    isAdded
                      ? "bg-gray-100 dark:bg-neutral-800 text-gray-400 dark:text-neutral-500 cursor-not-allowed border-gray-300 dark:border-neutral-700"
                      : "bg-white dark:bg-neutral-900 text-black dark:text-white hover:bg-yellow-300 dark:hover:bg-yellow-300 dark:hover:text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:dark:shadow-[1px_1px_0px_0px_rgba(255,255,255,1)]"
                  }
                `}
              >
                {preset}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
