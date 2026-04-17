import React from 'react';
import { LayoutDashboard, BookOpen, Settings, LogOut, TrendingUp, Calendar, Users } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  stats: {
    active: number;
    earnings: number;
    archive: number;
  };
}

export function Sidebar({ activeTab, setActiveTab, stats }: SidebarProps) {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', id: 'overview' },
    { icon: LayoutDashboard, label: 'Analysis Board', id: 'board', count: stats.active },
    { icon: Calendar, label: 'Earnings Schedule', id: 'calendar', count: stats.earnings },
    { icon: BookOpen, label: 'Research Archive', id: 'research', count: stats.archive },
    { icon: BookOpen, label: 'NotebookLM View', id: 'notebook' },
    { icon: Users, label: 'Personnel', id: 'personnel' },
  ];

  return (
    <div className="w-72 h-full bg-white border-r border-slate-100 flex flex-col p-6 overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-10 h-10 rounded-2xl bg-rose-500 shadow-lg shadow-rose-500/20 flex items-center justify-center rotate-3">
          <TrendingUp className="text-white w-6 h-6" />
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight text-slate-900 block leading-none">EquityFlow</span>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">Research Hub</span>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-4 mb-4">Workspace</div>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "premium-sidebar-item w-full flex justify-between",
              activeTab === item.id 
                ? "premium-sidebar-item-active" 
                : "premium-sidebar-item-inactive"
            )}
          >
            <div className="flex items-center gap-2">
              <item.icon className={cn("w-4 h-4", activeTab === item.id ? "text-rose-600" : "text-slate-400")} />
              {item.label}
            </div>
            {item.count !== undefined && item.count > 0 && (
              <span className={cn(
                "text-[9px] font-bold px-1.5 py-0.5 rounded-lg",
                activeTab === item.id ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-500"
              )}>
                {item.count}
              </span>
            )}
          </button>
        ))}
      </nav>

    </div>
  );
}
