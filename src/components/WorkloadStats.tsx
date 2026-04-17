import React from 'react';
import { Analyst, Task } from '../types';
import { User, BarChart2, Clock, Briefcase } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface WorkloadStatsProps {
  tasks: Task[];
  analysts: Analyst[];
}

export function WorkloadStats({ tasks, analysts }: WorkloadStatsProps) {
  const getAnalystStats = (analystId: string) => {
    const analystTasks = tasks.filter(t => t.assigneeId === analystId && t.columnId !== 'done');
    const totalTasks = analystTasks.length;
    
    // Sum up estimated minutes for incomplete tasks
    const totalMinutes = analystTasks.reduce((acc, task) => {
      const remainingItems = task.checklist.filter(item => !item.completed);
      return acc + remainingItems.reduce((sum, item) => sum + (item.estimatedMinutes || 0), 0);
    }, 0);

    const totalHours = Math.round(totalMinutes / 60 * 10) / 10;
    
    return { totalTasks, totalHours };
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <Briefcase className="w-3 h-3" />
          Team Workload
        </h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Hours Forecast</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {analysts.map((analyst) => {
          const stats = getAnalystStats(analyst.id);
          const maxExpectedHours = 40; // Reference for a "full" week, though this is dynamic
          const progress = Math.min((stats.totalHours / maxExpectedHours) * 100, 100);

          return (
            <motion.div 
              key={analyst.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="premium-card p-5 bg-white/70 backdrop-blur-sm border border-slate-200/60 shadow-sm flex flex-col gap-4 group hover:border-rose-200 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-lg",
                      !analyst.color.startsWith('#') && analyst.color
                    )}
                    style={{ backgroundColor: analyst.color.startsWith('#') ? analyst.color : undefined }}
                  >
                    {analyst.initials}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{analyst.name}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{stats.totalTasks} Active Tasks</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-slate-900 leading-none block">{stats.totalHours}h</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Est. Residue</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">
                  <span>Capacity</span>
                  <span className={cn(
                    "text-[10px]",
                    progress > 80 ? "text-rose-500" : progress > 50 ? "text-amber-500" : "text-emerald-500"
                  )}>
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={cn(
                      "h-full rounded-full transition-colors",
                      progress > 80 ? "bg-rose-500" : progress > 50 ? "bg-amber-500" : "bg-emerald-500"
                    )}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
