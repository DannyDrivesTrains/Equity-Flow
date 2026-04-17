import React from 'react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Priority, Task, Analyst } from '../types';
import { ExternalLink, MoreVertical, MessageSquare, AlertCircle, Trash2, GripVertical, CheckCircle2, Circle, User, Lock, Clock, BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface KanbanCardProps {
  task: Task;
  analyst?: Analyst;
  onDelete?: (taskId: string) => void;
  onToggleChecklist?: (taskId: string, itemId: string) => void;
  onClick?: () => void;
  onUpdate?: (task: Task) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ task, analyst, onDelete, onToggleChecklist, onClick, onUpdate }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  const priorityStyles = {
    High: 'text-rose-600 bg-rose-50 ring-rose-100',
    Medium: 'text-amber-600 bg-amber-50 ring-amber-100',
    Low: 'text-slate-600 bg-slate-100 ring-slate-200',
  };

  const completedCount = task.checklist.filter(item => item.completed).length;
  const progressPercent = (completedCount / task.checklist.length) * 100;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={cn(
        "premium-card p-5 cursor-default relative overflow-hidden group",
        isDragging && "ring-4 ring-rose-500/20 shadow-2xl scale-[1.02] z-50",
        !isDragging && "premium-card-hover",
        task.priority === 'High' && "border-l-4 border-l-rose-500 shadow-rose-500/5 bg-rose-50/10"
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <button 
            {...attributes} 
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="p-1 -ml-1 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing transition-colors"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-slate-800 text-white rounded-lg shadow-sm">
            {task.ticker}
          </span>
          <span className={cn(
            "text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ring-1 flex items-center gap-1",
            priorityStyles[task.priority]
          )}>
            {task.priority === 'High' && <AlertCircle className="w-2.5 h-2.5 animate-pulse" />}
            {task.priority}
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-full">
            <Clock className="w-3 h-3 text-slate-400" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
              {Math.round(task.checklist.reduce((acc, i) => acc + (i.estimatedMinutes || 0), 0) / 60 * 10) / 10}h
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
           {onDelete && (
             <button 
               onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
               className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
               title="Delete Analysis"
             >
               <Trash2 className="w-3.5 h-3.5" />
             </button>
           )}
          <button className="p-1.5 text-slate-400 hover:text-slate-900 transition-all">
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <h4 className="font-bold text-slate-900 text-base mb-1 tracking-tight">{task.companyName}</h4>
      <p className="text-slate-500 text-[11px] font-medium leading-relaxed mb-5 line-clamp-2">
        {task.description}
      </p>

      {/* Workflow Checklist Progress */}
      <div className="space-y-3 mb-5">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>PIPELINE PROGRESS</span>
          <span className="text-slate-900">{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            className="h-full bg-rose-500 rounded-full"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {task.checklist
            .filter(item => item.label.startsWith('Step'))
            .map((item) => {
              const isLocked = !item.completed && 
                item.dependsOn && 
                item.dependsOn.length > 0 && 
                !item.dependsOn.every(depId => task.checklist.find(i => i.id === depId)?.completed);

              return (
                <button
                  key={item.id}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (isLocked) {
                      const missingDeps = item.dependsOn!
                        .filter(depId => !task.checklist.find(i => i.id === depId)?.completed)
                        .map(depId => task.checklist.find(i => i.id === depId)?.label.split(':')[0] || depId);
                      alert(`Prerequisites needed: ${missingDeps.join(', ')}`);
                      return;
                    }
                    onToggleChecklist?.(task.id, item.id); 
                  }}
                  className={cn(
                    "flex items-center gap-1.5 text-left text-[9px] font-bold py-1 px-2.5 rounded-xl transition-all border",
                    item.completed 
                      ? "bg-rose-50 text-rose-600 border-rose-100" 
                      : isLocked
                        ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
                        : "bg-white text-slate-400 border-slate-200 hover:border-rose-200 hover:text-slate-600"
                  )}
                >
                  {isLocked ? (
                    <Lock className="w-3 h-3 shrink-0" strokeWidth={1.5} />
                  ) : (
                    <CheckCircle2 className={cn("w-3 h-3 shrink-0", !item.completed && "opacity-20")} strokeWidth={item.completed ? 3 : 2} />
                  )}
                  <span>{item.label.split(':')[0]}</span>
                </button>
              );
            })}
        </div>
      </div>

      {/* To Do Section */}
      <div className="mb-5 bg-slate-50/50 rounded-2xl border border-slate-100 p-3 group/todo focus-within:bg-white focus-within:border-rose-100 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-bold text-slate-400 tracking-[0.15em] uppercase pl-1">To Do:</span>
        </div>
        <div className="markdown-content max-h-[80px] overflow-y-auto custom-scrollbar px-1">
          {task.todo ? (
            <ReactMarkdown>{task.todo}</ReactMarkdown>
          ) : (
            <span className="text-[10px] text-slate-300 italic">No notes added...</span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center gap-3">
          {task.notebookLMLink && (
            <div 
              className="flex items-center gap-1.5 px-2 py-0.5 bg-rose-50 border border-rose-100 rounded-full text-rose-600"
              title="NotebookLM Linked"
            >
              <BookOpen className="w-3 h-3" />
              <span className="text-[8px] font-bold uppercase tracking-widest">Notebook</span>
            </div>
          )}
        </div>

        {analyst ? (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-[1px]">{analyst.name.split(' ')[1] ? analyst.name : analyst.name}</span>
            <div 
              className={cn(
                "w-6 h-6 rounded-lg flex items-center justify-center text-white text-[9px] font-bold shadow-sm", 
                !analyst.color.startsWith('#') && analyst.color
              )}
              style={{ backgroundColor: analyst.color.startsWith('#') ? analyst.color : undefined }}
            >
              {analyst.initials}
            </div>
          </div>
        ) : (
          <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-300">
            <User className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
    </div>
  );
};
