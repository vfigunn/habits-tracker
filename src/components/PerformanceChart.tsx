import { useTranslation } from "react-i18next";
import { DayLog } from "../types";
import { BarChart2 } from "lucide-react";
import { formatLocalDate } from "../utils";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, YAxis } from "recharts";

interface PerformanceChartProps {
  logs: Record<string, DayLog>;
}

export default function PerformanceChart({ logs }: PerformanceChartProps) {
  const { i18n } = useTranslation();

  // Generate last 7 days data for Recharts
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = formatLocalDate(d);
    const log = logs[dateStr];
    
    let completedTasks = 0;
    let totalTasks = 0;
    
    if (log && log.tasks) {
      completedTasks = log.tasks.filter(t => t.completed).length;
      totalTasks = log.tasks.length;
    }
    
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const isPerfect = log?.completed || false;
    
    return {
      name: d.toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-ES', { weekday: 'short' }),
      dateStr,
      completedTasks,
      totalTasks,
      percentage,
      isPerfect,
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-neutral-900 border-2 border-black dark:border-white p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
          <p className="font-black text-xs uppercase mb-1">{data.dateStr}</p>
          <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400">
            Completadas: {data.completedTasks} / {data.totalTasks}
          </p>
          <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400">
            Rendimiento: {data.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="neo-card p-4 sm:p-6 flex flex-col w-full">
      <div className="flex items-center gap-2 mb-6">
        <BarChart2 className="w-5 h-5 text-black dark:text-white" />
        <h4 className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white">
          Rendimiento últimos 7 días
        </h4>
      </div>
      
      <div className="w-full h-48 sm:h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={last7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 900, fill: '#737373' }} 
              dy={10}
            />
            <YAxis 
              hide 
              domain={[0, 100]} 
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            <Bar dataKey="percentage" radius={[0, 0, 0, 0]}>
              {last7Days.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isPerfect ? '#facc15' : '#111111'} 
                  stroke={entry.isPerfect ? '#000000' : 'transparent'}
                  strokeWidth={entry.isPerfect ? 2 : 0}
                  className="dark:fill-white dark:stroke-black"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
