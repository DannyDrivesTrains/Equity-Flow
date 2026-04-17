import React from 'react';
import { Analyst } from '../types';
import { User, Palette, Check, Plus, Trash2, Hexagon } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface AnalystSettingsProps {
  analysts: Analyst[];
  onUpdateAnalyst: (analyst: Analyst) => void;
  onAddAnalyst: (name: string) => void;
  onRemoveAnalyst: (id: string) => void;
}

const PRESET_COLORS = [
  '#f43f5e', // rose-500
  '#ec4899', // pink-500
  '#d946ef', // fuchsia-500
  '#a855f7', // purple-500
  '#6366f1', // indigo-500
  '#3b82f6', // blue-500
  '#0ea5e9', // sky-500
  '#06b6d4', // cyan-500
  '#14b8a6', // teal-500
  '#10b981', // emerald-500
  '#22c55e', // green-500
  '#84cc16', // lime-500
  '#eab308', // yellow-500
  '#f59e0b', // amber-500
  '#f97316', // orange-500
  '#ef4444', // red-500
  '#64748b', // slate-500
];

export function AnalystSettings({ analysts, onUpdateAnalyst, onAddAnalyst, onRemoveAnalyst }: AnalystSettingsProps) {
  const [newAnalystName, setNewAnalystName] = React.useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAnalystName.trim()) {
      onAddAnalyst(newAnalystName.trim());
      setNewAnalystName('');
    }
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Personnel & Preferences</h2>
          <p className="text-slate-500 text-xs">Manage research team members and their visual signatures.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: Analyst List */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
            <User className="w-3 h-3" />
            Active Analysts ({analysts.length})
          </h3>
          
          <div className="space-y-3">
            {analysts.map((analyst) => (
              <div 
                key={analyst.id}
                className="premium-card p-6 bg-white group flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-lg rotate-3",
                      !analyst.color.startsWith('#') && analyst.color
                    )}
                    style={{ backgroundColor: analyst.color.startsWith('#') ? analyst.color : undefined }}
                  >
                    {analyst.initials}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{analyst.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {analyst.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onRemoveAnalyst(analyst.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <form onSubmit={handleAdd} className="mt-6 flex items-center gap-3 p-2 bg-slate-50 rounded-[2rem] border border-slate-100">
              <input 
                type="text"
                placeholder="New analyst name..."
                value={newAnalystName}
                onChange={(e) => setNewAnalystName(e.target.value)}
                className="flex-1 bg-transparent border-none text-sm font-bold text-slate-900 focus:ring-0 px-4 placeholder:text-slate-300 placeholder:italic"
              />
              <button 
                type="submit"
                className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-lg"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right: Interface Color Matrix */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
            <Palette className="w-3 h-3" />
            Color Assignments
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            {analysts.map((analyst) => (
              <div key={analyst.id} className="premium-card p-6 bg-white shadow-sm space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">{analyst.name}'s Signature</span>
                  <div className="flex items-center gap-1">
                    <Hexagon className="w-3 h-3 text-slate-300" />
                    <span className="text-[9px] font-mono text-slate-400 uppercase">{analyst.color}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => onUpdateAnalyst({ ...analyst, color })}
                      className={cn(
                        "w-7 h-7 rounded-lg transition-transform hover:scale-110 active:scale-95 flex items-center justify-center text-white",
                        analyst.color === color && "ring-2 ring-slate-900 ring-offset-2"
                      )}
                      style={{ backgroundColor: color }}
                    >
                      {analyst.color === color && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
