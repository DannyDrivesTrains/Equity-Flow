import React from 'react';
import { Task } from '../types';
import { BookOpen, ExternalLink, Search, FileText, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface NotebookLMViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export function NotebookLMView({ tasks, onTaskClick }: NotebookLMViewProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const linkedTasks = tasks.filter(t => t.notebookLMLink);
  const unlinkedTasks = tasks.filter(t => !t.notebookLMLink && t.columnId !== 'done');

  const filteredLinked = linkedTasks.filter(t => 
    t.companyName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.ticker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">NotebookLM Hub</h2>
          <p className="text-slate-500 text-xs">A unified view of all AI research notebooks and analysis repositories.</p>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search notebooks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-6 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all w-80 shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
        {/* Linked Notebooks Grid */}
        <div className="lg:col-span-2 flex flex-col gap-6 overflow-hidden">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
            <BookOpen className="w-3 h-3" />
            Active Notebooks ({filteredLinked.length})
          </h3>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            {filteredLinked.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200 p-10 text-center">
                <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center shadow-sm mb-4">
                  <BookOpen className="w-8 h-8 text-slate-200" />
                </div>
                <h4 className="text-slate-900 font-bold mb-1">No Notebooks Found</h4>
                <p className="text-slate-500 text-xs max-w-[200px] leading-relaxed">
                  Search results empty or no tasks have been linked to NotebookLM yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredLinked.map((task) => (
                  <div 
                    key={task.id}
                    className="premium-card p-6 bg-white group hover:border-rose-200 transition-all flex flex-col justify-between h-52 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-xs">
                            {task.ticker}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm truncate max-w-[140px]">{task.companyName}</h4>
                          </div>
                        </div>
                        <a 
                          href={task.notebookLMLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-3 italic bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                        {task.thesis || "No thesis defined for this notebook repository yet."}
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => onTaskClick(task)}
                      className="mt-4 flex items-center justify-between group/link"
                    >
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover/link:text-rose-500 transition-colors">Manage Research Record</span>
                      <ArrowRight className="w-3 h-3 text-slate-300 group-hover/link:text-rose-500 group-hover/link:translate-x-1 transition-all" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Unlinked Tasks */}
        <div className="flex flex-col gap-6 overflow-hidden">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] px-2">Pending Links</h3>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
            {unlinkedTasks.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-3xl border border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                All active analyses are currently linked.
              </div>
            ) : (
              unlinkedTasks.map(task => (
                <div 
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  className="p-5 bg-white border border-slate-100 rounded-3xl hover:border-rose-100 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-[10px]">
                      {task.ticker}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-900 text-xs truncate">{task.companyName}</h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Requires Notebook Setup</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-1.5 overflow-hidden">
                      <div className="w-5 h-5 rounded-md bg-slate-100 border-2 border-white flex items-center justify-center text-slate-300">
                        <FileText className="w-2.5 h-2.5" />
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Add Link</span>
                  </div>
                </div>
              ))
            )}
            
            <div className="mt-8 p-6 bg-rose-50 rounded-[2rem] border border-rose-100">
              <h4 className="text-xs font-bold text-rose-600 mb-2">Researcher Pro Tip</h4>
              <p className="text-[10px] text-rose-500 leading-relaxed font-medium">
                Link each analysis record to a specific NotebookLM repository to centralize source documents, investor transcripts, and AI-powered insights.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
