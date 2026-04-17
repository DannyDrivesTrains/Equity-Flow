import React from 'react';
import { Task, Analyst } from '../types';
import { FileText, Download, Eye, Clock, Hash, CheckCircle2, User } from 'lucide-react';
import { cn } from '../lib/utils';

interface ResearchArchiveProps {
  tasks: Task[];
  analysts: Analyst[];
  onTaskClick: (task: Task) => void;
}

export function ResearchArchive({ tasks, analysts, onTaskClick }: ResearchArchiveProps) {
  const completedTasks = tasks.filter(t => t.columnId === 'done');

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Research Archive</h2>
          <p className="text-slate-500 text-xs">Access finalized property research reports and distribution documents.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
            {completedTasks.length} Documents
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {completedTasks.length === 0 ? (
            <div className="col-span-full h-80 premium-card flex flex-col items-center justify-center text-slate-400 gap-4 bg-slate-50/50 border-dashed">
              <FileText className="w-12 h-12 opacity-20" />
              <p className="font-medium">No finalized research documents found.</p>
              <p className="text-[10px] uppercase tracking-widest">Move tasks to "Complete" to archive them</p>
            </div>
          ) : (
            completedTasks.map((task) => (
              <div 
                key={task.id}
                onClick={() => onTaskClick(task)}
                className="premium-card premium-card-hover group p-6 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:bg-rose-500 transition-colors">
                      {task.ticker}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm truncate max-w-[150px]">{task.companyName}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">Finalized {task.lastUpdated}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed h-[3.75rem]">
                    {task.thesis || task.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-rose-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Validated</span>
                      </div>
                      {task.assigneeId && (
                        <div className="flex items-center gap-1.5">
                          <div 
                            className={cn(
                              "w-5 h-5 rounded flex items-center justify-center text-white text-[8px] font-bold", 
                              analysts.find(a => a.id === task.assigneeId)?.color.startsWith('#') ? undefined : (analysts.find(a => a.id === task.assigneeId)?.color || "bg-slate-400")
                            )}
                            style={{ backgroundColor: analysts.find(a => a.id === task.assigneeId)?.color.startsWith('#') ? analysts.find(a => a.id === task.assigneeId)?.color : undefined }}
                          >
                            {analysts.find(a => a.id === task.assigneeId)?.initials || "NA"}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
