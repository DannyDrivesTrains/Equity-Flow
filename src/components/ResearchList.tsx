import React from 'react';
import { Task, Analyst } from '../types';
import { cn } from '../lib/utils';
import { Clock, AlertCircle, ChevronRight, User } from 'lucide-react';
import { motion } from 'motion/react';

interface ResearchListProps {
  tasks: Task[];
  analysts: Analyst[];
  onTaskClick: (task: Task) => void;
}

export function ResearchList({ tasks, analysts, onTaskClick }: ResearchListProps) {
  const priorityColors = {
    High: 'text-rose-600 bg-rose-50',
    Medium: 'text-amber-600 bg-amber-50',
    Low: 'text-slate-600 bg-slate-50',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-bottom border-slate-100 bg-slate-50/50">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ticker</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Company</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priority</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assignee</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map((task) => {
              const analyst = analysts.find(a => a.id === task.assigneeId);
              const completedCount = task.checklist.filter(item => item.completed).length;
              const progressPercent = Math.round((completedCount / task.checklist.length) * 100);

              return (
                <motion.tr 
                  key={task.id}
                  initial={false}
                  whileHover={{ backgroundColor: 'rgba(248, 250, 252, 0.8)' }}
                  onClick={() => onTaskClick(task)}
                  className="cursor-pointer group transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold font-mono px-2 py-1 bg-slate-800 text-white rounded-lg">
                      {task.ticker}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 leading-tight">{task.companyName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ring-1 ring-inset",
                      task.columnId === 'todo' && "bg-slate-100 text-slate-500 ring-slate-200",
                      task.columnId === 'analysis' && "bg-rose-50 text-rose-600 ring-rose-100",
                      task.columnId === 'review' && "bg-amber-50 text-amber-600 ring-amber-100",
                      task.columnId === 'done' && "bg-emerald-50 text-emerald-600 ring-emerald-100"
                    )}>
                      {task.columnId.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full flex items-center gap-1 w-fit",
                      priorityColors[task.priority]
                    )}>
                      {task.priority === 'High' && <AlertCircle className="w-2.5 h-2.5 animate-pulse" />}
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {analyst ? (
                      <div className="flex items-center gap-2">
                        <div 
                          className={cn(
                            "w-6 h-6 rounded-lg flex items-center justify-center text-[8px] font-bold text-white", 
                            !analyst.color.startsWith('#') && analyst.color
                          )}
                          style={{ backgroundColor: analyst.color.startsWith('#') ? analyst.color : undefined }}
                        >
                          {analyst.initials}
                        </div>
                        <span className="text-xs font-medium text-slate-700">{analyst.name}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5 min-w-[100px]">
                      <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                        <span>{completedCount}/{task.checklist.length} Steps</span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-rose-500 transition-all duration-500 ease-out"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 group-hover:text-rose-500 group-hover:bg-rose-50 rounded-xl transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
