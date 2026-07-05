import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TrackerState, DayLog, TaskTemplate } from "../types";
import { Download, Upload, Trash2, Database, Check, X } from "lucide-react";

interface BackupRestoreProps {
  state: TrackerState;
  onImportState: (newState: TrackerState) => void;
  onResetAllData: () => void;
}

/** Validates that a parsed object conforms to TrackerState shape */
function validateImportedData(data: unknown): { valid: boolean; state?: TrackerState; error?: string } {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "backup.validation.invalidJson" };
  }

  const obj = data as Record<string, unknown>;

  // Validate templates (if present)
  let templates: TaskTemplate[] = [];
  if ("templates" in obj && Array.isArray(obj.templates)) {
    for (const t of obj.templates) {
      if (!t || typeof t !== "object") {
        return { valid: false, error: "backup.validation.invalidTemplate" };
      }
      const tpl = t as Record<string, unknown>;
      if (typeof tpl.id !== "string" || typeof tpl.text !== "string" || typeof tpl.createdAt !== "number") {
        return { valid: false, error: "backup.validation.templateMissingFields" };
      }
      templates.push(tpl as unknown as TaskTemplate);
    }
  }

  // Validate logs (if present)
  let logs: Record<string, DayLog> = {};
  if ("logs" in obj && obj.logs && typeof obj.logs === "object") {
    for (const [dateStr, log] of Object.entries(obj.logs as Record<string, unknown>)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return { valid: false, error: "backup.validation.invalidDate" };
      }
      if (!log || typeof log !== "object") {
        return { valid: false, error: "backup.validation.invalidLog" };
      }
      const l = log as Record<string, unknown>;
      if (typeof l.completed !== "boolean") {
        return { valid: false, error: "backup.validation.invalidCompleted" };
      }
      if (!Array.isArray(l.tasks)) {
        return { valid: false, error: "backup.validation.invalidTasks" };
      }
      logs[dateStr] = {
        date: dateStr,
        completed: l.completed as boolean,
        tasks: (l.tasks as Array<Record<string, unknown>>).map((task) => ({
          id: String(task.id ?? ""),
          text: String(task.text ?? ""),
          completed: Boolean(task.completed),
        })),
        note: typeof l.note === "string" ? l.note : undefined,
      };
    }
  }

  if (Object.keys(templates).length === 0 && Object.keys(logs).length === 0) {
    return { valid: false, error: "backup.validation.noData" };
  }

  return { valid: true, state: { logs, templates } };
}

export default function BackupRestore({
  state,
  onImportState,
  onResetAllData,
}: BackupRestoreProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Export State to JSON
  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(state, null, 2);
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const exportFileDefaultName = `tareas_diarias_backup_${new Date()
        .toISOString()
        .slice(0, 10)}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();

      showStatus("success", t("backup.exportSuccess"));
    } catch (_err) {
      showStatus("error", t("backup.exportError"));
    }
  };

  // Import State from JSON
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const result = validateImportedData(parsed);

        if (result.valid && result.state) {
          onImportState(result.state);
          showStatus("success", t("backup.importSuccess"));
        } else {
          showStatus("error", result.error ? t(result.error) : t("backup.invalidFile"));
        }
      } catch (_err) {
        showStatus("error", t("backup.readJsonError"));
      }
    };

    fileReader.readAsText(files[0]);
    // Reset file input value so same file can be imported again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleResetConfirm = () => {
    onResetAllData();
    setShowConfirmReset(false);
    showStatus("success", t("backup.resetSuccess"));
  };

  const showStatus = (type: "success" | "error", text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  return (
    <div className="neo-card p-4 sm:p-5 flex flex-col justify-center">
      <div className="flex flex-col gap-3">
        {/* Header & Status */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Database className="w-4 h-4 text-black dark:text-white" />
            <h3 className="text-sm font-black text-black dark:text-white uppercase font-display tracking-wide">
              {t("backup.heading")}
            </h3>
          </div>
          
          {statusMessage ? (
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 border-2 neo-border text-[10px] font-bold uppercase tracking-wider
                ${statusMessage.type === "success" 
                  ? "bg-green-300 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]" 
                  : "bg-red-300 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"}
              `}
            >
              {statusMessage.type === "success" ? <Check className="w-3 h-3 stroke-[3]" /> : <X className="w-3 h-3 stroke-[3]" />}
              <span>{statusMessage.text}</span>
            </div>
          ) : (
            <p className="text-[10px] font-bold text-gray-500 dark:text-neutral-400 uppercase max-w-sm leading-snug">
              {t("backup.description")}
            </p>
          )}
        </div>

        {/* Actions Toolbar */}
        <div className="flex items-center gap-2 self-start xl:self-auto flex-wrap">
          <button
            id="export-data-btn"
            onClick={handleExport}
            className="flex-shrink-0 bg-yellow-300 hover:bg-yellow-400 border-2 border-black dark:border-white text-black font-black uppercase text-[10px] sm:text-xs tracking-wider px-3 sm:px-4 py-2 sm:py-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center gap-1.5 cursor-pointer"
            title={t("backup.exportJson")}
          >
            <Download className="w-3.5 h-3.5 stroke-[3]" />
            <span>Exportar</span>
          </button>

          <button
            id="import-data-btn"
            onClick={triggerFileInput}
            className="flex-shrink-0 bg-white dark:bg-neutral-900 hover:bg-gray-100 dark:hover:bg-neutral-800 border-2 neo-border text-black dark:text-white font-black uppercase text-[10px] sm:text-xs tracking-wider px-3 sm:px-4 py-2 sm:py-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center gap-1.5 cursor-pointer"
            title={t("backup.importBackup")}
          >
            <Upload className="w-3.5 h-3.5 stroke-[3]" />
            <span>Importar</span>
          </button>
          
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />

          {/* Inline Reset Button */}
          {!showConfirmReset ? (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="flex-shrink-0 bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white hover:bg-red-500 hover:text-white hover:border-red-500 dark:hover:bg-red-500 dark:hover:border-red-500 font-black uppercase text-[10px] sm:text-xs tracking-wider px-3 sm:px-4 py-2 sm:py-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title={t("backup.resetBtn")}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Restablecer</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 bg-red-100 dark:bg-red-950/40 p-1 border-2 border-red-500 rounded-none animate-pulse">
              <span className="text-[9px] font-black uppercase text-red-600 dark:text-red-400 px-1">¿Seguro?</span>
              <button
                onClick={handleResetConfirm}
                className="bg-red-500 text-white font-black text-[9px] px-2 py-1 uppercase tracking-wider cursor-pointer border-2 border-red-500 hover:bg-red-600"
              >
                Sí, Borrar
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="bg-white text-black font-black text-[9px] px-2 py-1 uppercase tracking-wider cursor-pointer border-2 border-black hover:bg-gray-100"
              >
                No
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
