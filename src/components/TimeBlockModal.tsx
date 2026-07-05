import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Plus, Trash2, X } from "lucide-react";
import { TimeBlock, DayLog } from "../types";

interface TimeBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  log: DayLog;
  onUpdateLog: (date: string, partial: Partial<DayLog>) => void;
}

export default function TimeBlockModal({
  isOpen,
  onClose,
  dateStr,
  log,
  onUpdateLog,
}: TimeBlockModalProps) {
  const { t } = useTranslation();

  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [emoji, setEmoji] = useState("💪");
  const [activity, setActivity] = useState("");

  const timeBlocks = log?.timeBlocks || [];

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity.trim()) return;

    const newBlock: TimeBlock = {
      id: crypto.randomUUID(),
      startTime,
      endTime,
      activity: activity.trim(),
      emoji: emoji.trim() || undefined,
    };

    const newBlocks = [...timeBlocks, newBlock].sort((a, b) => 
      a.startTime.localeCompare(b.startTime)
    );

    onUpdateLog(dateStr, { timeBlocks: newBlocks });
    
    // Reset fields for the next one, but keep emoji and increment time slightly?
    setActivity("");
  };

  const handleDeleteBlock = (id: string) => {
    const newBlocks = timeBlocks.filter(b => b.id !== id);
    onUpdateLog(dateStr, { timeBlocks: newBlocks });
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="relative bg-white dark:bg-[#111] w-full max-w-md border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b-4 border-black dark:border-white bg-yellow-300">
            <div className="flex items-center gap-2 text-black">
              <Clock className="w-5 h-5 stroke-[3]" />
              <h2 className="text-lg font-black font-display uppercase tracking-wider">
                {t("details.timeBlocks.title")}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 bg-white border-2 border-black hover:bg-red-500 hover:text-white transition-colors cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
            >
              <X className="w-5 h-5 stroke-[3] text-black hover:text-white" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleAddBlock} className="p-4 border-b-4 border-black dark:border-white bg-gray-50 dark:bg-neutral-900">
            <div className="flex flex-wrap sm:flex-nowrap gap-3 mb-3">
              <div className="flex-1 min-w-[45%]">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-neutral-400 mb-1">
                  {t("details.timeBlocks.startTime")}
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full neo-input p-2 text-sm bg-white dark:bg-[#1a1a1a] text-black dark:text-white"
                  required
                />
              </div>
              <div className="flex-1 min-w-[45%]">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-neutral-400 mb-1">
                  {t("details.timeBlocks.endTime")}
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full neo-input p-2 text-sm bg-white dark:bg-[#1a1a1a] text-black dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-16 flex-shrink-0">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-neutral-400 mb-1">
                  {t("details.timeBlocks.emoji")}
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  className="w-full neo-input p-2 text-center text-sm bg-white dark:bg-[#1a1a1a] text-black dark:text-white"
                  placeholder="🏋️"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-neutral-400 mb-1">
                  {t("details.timeBlocks.activity")}
                </label>
                <input
                  type="text"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  className="w-full neo-input p-2 text-sm bg-white dark:bg-[#1a1a1a] text-black dark:text-white placeholder:text-gray-400"
                  placeholder="Ir al gimnasio..."
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 w-full bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-wider text-xs py-3 neo-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer flex justify-center items-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              {t("details.timeBlocks.add")}
            </button>
          </form>

          {/* List */}
          <div className="p-4 overflow-y-auto flex-1 bg-white dark:bg-[#111]">
            {timeBlocks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500">
                  {t("details.timeBlocks.empty")}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {timeBlocks.map((block) => (
                  <div key={block.id} className="group flex items-stretch border-2 neo-border bg-white dark:bg-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                    <div className="bg-yellow-300 flex flex-col items-center justify-center px-2 py-2 border-r-2 border-black dark:border-white text-black min-w-[70px]">
                      <span className="text-xs font-black font-mono leading-none mb-1">{block.startTime}</span>
                      <span className="text-[9px] font-black font-mono leading-none opacity-60">to</span>
                      <span className="text-xs font-black font-mono leading-none mt-1">{block.endTime}</span>
                    </div>
                    <div className="p-2 flex-1 flex items-center justify-between gap-2 overflow-hidden">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {block.emoji && (
                          <span className="text-xl flex-shrink-0">{block.emoji}</span>
                        )}
                        <span className="text-xs font-bold text-black dark:text-white truncate">
                          {block.activity}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteBlock(block.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 bg-white dark:bg-black text-red-500 border-2 border-black dark:border-white hover:bg-red-500 hover:text-white dark:hover:bg-red-500 transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] active:translate-x-[1px] active:translate-y-[1px]"
                      >
                        <Trash2 className="w-4 h-4 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
