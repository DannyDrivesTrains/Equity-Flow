import React, { useState } from 'react';
import { Task, Analyst } from '../types';
import ReactMarkdown from 'react-markdown';
import { X, AlertCircle, CheckCircle2, Circle, User, Lock, Clock, Timer, BookOpen, ExternalLink, Type, Eye, GitMerge, ArrowRight, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface TaskModalProps {
  task: Task;
  analysts: Analyst[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (task: Task) => void;
  onToggleChecklist: (taskId: string, itemId: string) => void;
}

export function TaskModal({ task, analysts, isOpen, onClose, onUpdate, onToggleChecklist }: TaskModalProps) {
  const [todoTab, setTodoTab] = useState<'write' | 'preview'>('write');
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {task.ticker}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{task.companyName}</h2>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Analysis Pipeline</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Left Column: Checklist & Thesis */}
              <div className="space-y-10">
                <section className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <GitMerge className="w-3.5 h-3.5" />
                      Research Pipeline Map
                    </h3>
                  </div>
                  
                  <div className="premium-card p-6 bg-slate-50/50 border border-slate-200/40 relative overflow-hidden mb-6">
                    <div className="flex items-center justify-between relative z-10 overflow-x-auto no-scrollbar py-2">
                      {task.checklist.map((item, index) => {
                        const isCompleted = item.completed;
                        const isLocked = !item.completed && 
                          item.dependsOn && 
                          item.dependsOn.length > 0 && 
                          !item.dependsOn.every(depId => task.checklist.find(i => i.id === depId)?.completed);
                        
                        return (
                          <React.Fragment key={item.id}>
                            <div className="flex flex-col items-center gap-2 min-w-[80px]">
                              <div className={cn(
                                "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm",
                                isCompleted ? "bg-rose-500 text-white shadow-rose-200 ring-4 ring-rose-500/10" :
                                isLocked ? "bg-white border border-slate-100 text-slate-200" :
                                "bg-white border-2 border-slate-200 text-slate-400 font-bold"
                              )}>
                                {isCompleted ? <CheckCircle2 className="w-5 h-5" strokeWidth={3} /> : (
                                  <span className="text-xs">{item.id.toUpperCase()}</span>
                                )}
                              </div>
                              <span className={cn(
                                "text-[9px] font-bold uppercase tracking-widest",
                                isCompleted ? "text-rose-600" :
                                isLocked ? "text-slate-300" :
                                "text-slate-500"
                              )}>
                                {item.label.split(':')[0]}
                              </span>
                            </div>
                            {index < task.checklist.length - 1 && (
                              <div className="flex-1 min-w-[20px] h-[2px] mx-2 bg-slate-100 relative">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: isCompleted ? '100%' : '0%' }}
                                  className="absolute inset-0 bg-rose-500 transition-all duration-700"
                                />
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Research Pipeline</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Timer className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          Total Effort: {Math.round(task.checklist.reduce((acc, item) => acc + (item.estimatedMinutes || 0), 0) / 60 * 10) / 10} Hours
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg">
                      {task.checklist.filter(i => i.completed).length} / {task.checklist.length} Steps
                    </span>
                  </div>
                  <div className="space-y-2">
                    {task.checklist.map((item) => {
                      const isLocked = !item.completed && 
                        item.dependsOn && 
                        item.dependsOn.length > 0 && 
                        !item.dependsOn.every(depId => task.checklist.find(i => i.id === depId)?.completed);

                      return (
                        <div key={item.id} className="group relative">
                          <button
                            onClick={() => {
                              if (isLocked) {
                                const missingDeps = item.dependsOn!
                                  .filter(depId => !task.checklist.find(i => i.id === depId)?.completed)
                                  .map(depId => task.checklist.find(i => i.id === depId)?.label.split(':')[0] || depId);
                                alert(`Prerequisites needed: ${missingDeps.join(', ')}`);
                                return;
                              }
                              onToggleChecklist(task.id, item.id);
                            }}
                            className={cn(
                              "w-full flex items-center justify-between p-4 rounded-2xl border text-sm transition-all text-left",
                              item.completed 
                                ? "bg-rose-50 border-rose-100 text-rose-700 shadow-sm" 
                                : isLocked
                                  ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                                  : "bg-white border-slate-100 text-slate-600 hover:border-rose-200"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              {isLocked ? (
                                <Lock className="w-5 h-5 shrink-0" strokeWidth={1.5} />
                              ) : (
                                <CheckCircle2 className={cn("w-5 h-5 shrink-0", !item.completed && "opacity-20")} />
                              )}
                              <span className={cn("font-medium", item.completed && "opacity-60")}>
                                {item.label}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              {isLocked && item.dependsOn && (
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 rounded-lg text-amber-600 border border-amber-100">
                                  <Lock className="w-2.5 h-2.5" />
                                  <span className="text-[9px] font-bold uppercase tracking-tighter">
                                    Needs {item.dependsOn.map(id => task.checklist.find(i => i.id === id)?.label.split(':')[0]).join(', ')}
                                  </span>
                                </div>
                              )}
                              {item.estimatedMinutes && (
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100/50 rounded-lg">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span className="text-[10px] font-bold text-slate-500">{item.estimatedMinutes}m</span>
                                </div>
                              )}
                              {isLocked && (
                                <span className="text-[8px] font-bold uppercase tracking-widest text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">Locked</span>
                              )}
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Investment Thesis</h3>
                  <textarea
                    value={task.thesis || ''}
                    onChange={(e) => onUpdate({ ...task, thesis: e.target.value })}
                    placeholder="Describe the core investment thesis..."
                    className="w-full h-40 p-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all resize-none"
                  />
                </section>

                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Analyst "To Do" Section</h3>
                    <div className="flex items-center bg-slate-100 p-1 rounded-lg">
                      <button 
                        onClick={() => setTodoTab('write')}
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all",
                          todoTab === 'write' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        <Type className="w-3 h-3" />
                        Write
                      </button>
                      <button 
                        onClick={() => setTodoTab('preview')}
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all",
                          todoTab === 'preview' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        <Eye className="w-3 h-3" />
                        Preview
                      </button>
                    </div>
                  </div>
                  
                  {todoTab === 'write' ? (
                    <textarea
                      value={task.todo || ''}
                      onChange={(e) => onUpdate({ ...task, todo: e.target.value })}
                      placeholder="Support Markdown: # Header, - list, **bold**..."
                      className="w-full h-40 p-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all resize-none font-mono"
                    />
                  ) : (
                    <div className="w-full min-h-[160px] p-6 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm markdown-content">
                      {task.todo ? (
                        <ReactMarkdown>{task.todo}</ReactMarkdown>
                      ) : (
                        <span className="text-slate-400 italic">Nothing to preview...</span>
                      )}
                    </div>
                  )}
                </section>
              </div>

              {/* Right Column: Catalysts & Schedule */}
              <div className="space-y-10">
                <section className="premium-card p-6 bg-slate-50/50 border-slate-200/40">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Research Schedule</h4>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 leading-tight">Earnings Release Date</label>
                        <input 
                          type="date"
                          value={task.earningsDate || ''}
                          onChange={(e) => onUpdate({ ...task, earningsDate: e.target.value })}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-rose-500/10 transition-all shadow-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Lead Analyst Assignment</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {analysts.map((analyst) => (
                          <button
                            key={analyst.id}
                            onClick={() => onUpdate({ ...task, assigneeId: analyst.id })}
                            className={cn(
                              "flex items-center gap-2 p-3 rounded-2xl border transition-all text-left",
                              task.assigneeId === analyst.id 
                                ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/10" 
                                : "bg-white border-slate-100 text-slate-600 hover:border-rose-100"
                            )}
                          >
                            <div 
                              className={cn(
                                "w-6 h-6 shrink-0 rounded-lg flex items-center justify-center font-bold text-[9px] ring-2 ring-white/10", 
                                !analyst.color.startsWith('#') && analyst.color
                              )}
                              style={{ backgroundColor: analyst.color.startsWith('#') ? analyst.color : undefined }}
                            >
                              {analyst.initials}
                            </div>
                            <span className="text-[10px] font-bold truncate">{analyst.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Research Priority</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {(['Low', 'Medium', 'High'] as const).map((p) => {
                          const isSelected = task.priority === p;
                          const styles = {
                            High: isSelected ? "bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20" : "bg-white text-slate-400 border-slate-100 hover:border-rose-200 hover:text-rose-600",
                            Medium: isSelected ? "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20" : "bg-white text-slate-400 border-slate-100 hover:border-amber-200 hover:text-amber-600",
                            Low: isSelected ? "bg-slate-700 text-white border-slate-700 shadow-lg shadow-slate-700/20" : "bg-white text-slate-400 border-slate-100 hover:border-slate-300 hover:text-slate-900",
                          };

                          const icons = {
                            High: <AlertCircle className="w-3.5 h-3.5" />,
                            Medium: <Clock className="w-3.5 h-3.5" />,
                            Low: <ArrowDown className="w-3.5 h-3.5" />,
                          };

                          return (
                            <button
                              key={p}
                              onClick={() => onUpdate({ ...task, priority: p })}
                              className={cn(
                                "flex flex-col items-center gap-2 py-3 px-1 rounded-2xl border transition-all text-[10px] font-bold uppercase tracking-widest",
                                styles[p]
                              )}
                            >
                              {icons[p]}
                              {p}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="premium-card p-6 border-slate-200/40 bg-white">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">External Resources</h4>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 leading-tight flex items-center gap-2">
                        <BookOpen className="w-3 h-3 text-rose-500" />
                        NotebookLM Link
                      </label>
                      <input 
                        type="url"
                        placeholder="Paste your NotebookLM URL..."
                        value={task.notebookLMLink || ''}
                        onChange={(e) => onUpdate({ ...task, notebookLMLink: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium text-slate-900 outline-none focus:ring-4 focus:ring-rose-500/10 focus:bg-white transition-all shadow-sm"
                      />
                      {task.notebookLMLink && (
                        <a 
                          href={task.notebookLMLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-rose-500 uppercase tracking-widest pl-1 hover:underline flex items-center gap-1 mt-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Open Notebook
                        </a>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>

          <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all"
            >
              Close Record
            </button>
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all"
            >
              Finalize Research Phase
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
