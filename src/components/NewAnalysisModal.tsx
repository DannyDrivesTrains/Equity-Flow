import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, UserPlus, Briefcase, BarChart3, Clock, AlertCircle, ArrowDown } from 'lucide-react';
import { Analyst, Priority } from '../types';
import { cn } from '../lib/utils';

interface NewAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: {
    ticker: string;
    companyName: string;
    priority: Priority;
    assigneeId: string;
    description: string;
    earningsDate: string;
    notebookLMLink?: string;
  }) => void;
  analysts: Analyst[];
}

export function NewAnalysisModal({ isOpen, onClose, onAdd, analysts }: NewAnalysisModalProps) {
  const [ticker, setTicker] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [assigneeId, setAssigneeId] = useState(analysts[0]?.id || '');
  const [description, setDescription] = useState('');
  const [earningsDate, setEarningsDate] = useState('');
  const [notebookLMLink, setNotebookLMLink] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker || !companyName || !assigneeId) return;

    onAdd({
      ticker: ticker.toUpperCase(),
      companyName,
      priority,
      assigneeId,
      description,
      earningsDate: earningsDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notebookLMLink,
    });
    
    // Reset form
    setTicker('');
    setCompanyName('');
    setDescription('');
    setEarningsDate('');
    setNotebookLMLink('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-10 pt-10 pb-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Initiate New Analysis</h2>
                  <p className="text-slate-500 text-sm font-medium">Provision a new property research case across the team.</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar px-10 pb-10 space-y-8">
              {/* Core Identity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Ticker Symbol</label>
                  <input 
                    autoFocus
                    required
                    placeholder="e.g. GRT"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value.toUpperCase())}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-200 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Fund Name</label>
                  <input 
                    required
                    placeholder="e.g. Growthpoint Properties"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-200 transition-all"
                  />
                </div>
              </div>

              {/* Assignment Section */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Assign Lead Analyst</label>
                <div className="grid grid-cols-3 gap-3">
                  {analysts.map((analyst) => (
                    <button
                      type="button"
                      key={analyst.id}
                      onClick={() => setAssigneeId(analyst.id)}
                      className={cn(
                        "flex flex-col items-center gap-3 p-4 rounded-3xl border-2 transition-all text-center",
                        assigneeId === analyst.id 
                          ? "border-slate-900 bg-slate-900 text-white shadow-xl shadow-slate-900/20" 
                          : "border-slate-50 bg-slate-50 text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      <div 
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ring-4 ring-white/20", 
                          !analyst.color.startsWith('#') && analyst.color
                        )}
                        style={{ backgroundColor: analyst.color.startsWith('#') ? analyst.color : undefined }}
                      >
                        {analyst.initials}
                      </div>
                      <div>
                        <p className="font-bold text-[11px] leading-tight">{analyst.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Research Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Priority Level</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['Low', 'Medium', 'High'] as const).map((p) => {
                      const isSelected = priority === p;
                      const styles = {
                        High: isSelected ? "bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20" : "bg-white text-slate-400 border-slate-100 hover:border-rose-200 hover:text-rose-600",
                        Medium: isSelected ? "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20" : "bg-white text-slate-400 border-slate-100 hover:border-amber-200 hover:text-amber-600",
                        Low: isSelected ? "bg-slate-700 text-white border-slate-700 shadow-lg shadow-slate-700/20" : "bg-white text-slate-400 border-slate-100 hover:border-slate-300 hover:text-slate-900",
                      };

                      const icons = {
                        High: <AlertCircle className="w-4 h-4" />,
                        Medium: <Clock className="w-4 h-4" />,
                        Low: <ArrowDown className="w-4 h-4" />,
                      };

                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className={cn(
                            "flex flex-col items-center gap-2 py-3 rounded-2xl border transition-all text-[10px] font-bold uppercase tracking-widest",
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
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Est. Earnings</label>
                  <input 
                    type="date"
                    value={earningsDate}
                    onChange={(e) => setEarningsDate(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-rose-500/10 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Research Brief</label>
                <textarea 
                  rows={2}
                  placeholder="Summarize the focus of this analysis. Supports Markdown (#, **, -)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-medium text-slate-900 outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-200 transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">NotebookLM Link (Optional)</label>
                <input 
                  type="url"
                  placeholder="https://notebooklm.google.com/notebook/..."
                  value={notebookLMLink}
                  onChange={(e) => setNotebookLMLink(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-200 transition-all shadow-sm"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-bold text-base hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98] flex items-center justify-center gap-3"
              >
                Initiate Analysis
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
