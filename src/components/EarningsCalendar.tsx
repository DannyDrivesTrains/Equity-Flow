import React, { useState, useRef } from 'react';
import { Task } from '../types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, TrendingUp, Plus, Filter, ArrowUpDown, Search, Upload, FileText } from 'lucide-react';
import { cn } from '../lib/utils';
import ICAL from 'ical.js';

interface EarningsCalendarProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddEvent: () => void;
  onImportTasks?: (tasks: Partial<Task>[]) => void;
}

export function EarningsCalendar({ tasks, onTaskClick, onAddEvent, onImportTasks }: EarningsCalendarProps) {
  const [sortField, setSortField] = useState<'date' | 'ticker'>('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const jcalData = ICAL.parse(text);
      const vcalendar = new ICAL.Component(jcalData);
      const vevents = vcalendar.getAllSubcomponents('vevent');

      const importedTasks: Partial<Task>[] = vevents.map(vevent => {
        const event = new ICAL.Event(vevent);
        const startDate = event.startDate.toJSDate().toISOString().split('T')[0];
        const summary = event.summary || 'Imported Event';
        const description = event.description || '';
        
        // Try to extract ticker from summary (e.g., "GRT Earnings Release" -> "GRT")
        const tickerMatch = summary.match(/^([A-Z0-9]{2,5})\b/);
        const ticker = tickerMatch ? tickerMatch[1] : summary.substring(0, 4).toUpperCase();

        return {
          ticker,
          companyName: summary,
          earningsDate: startDate,
          description,
          priority: 'Medium',
          columnId: 'todo',
        };
      });

      if (onImportTasks && importedTasks.length > 0) {
        onImportTasks(importedTasks);
        alert(`Successfully imported ${importedTasks.length} events into the schedule.`);
      }
      
      // Reset input
      e.target.value = '';
    } catch (error) {
      console.error('Error parsing ICS file:', error);
      alert('Failed to parse .ics file. Please ensure it is a valid iCalendar format.');
    }
  };
  
  // Calendar calculation logic
  const today = new Date();
  const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();
  
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const prevMonthDays = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();

  const upcomingEarnings = tasks
    .filter(t => t.earningsDate)
    .filter(t => 
      t.companyName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.ticker.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortField === 'date') {
        return new Date(a.earningsDate!).getTime() - new Date(b.earningsDate!).getTime();
      }
      return a.ticker.localeCompare(b.ticker);
    });

  const getDayTasks = (day: number, month: number, year: number) => {
    return tasks.filter(t => {
      if (!t.earningsDate) return false;
      const d = new Date(t.earningsDate);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Earnings Schedule</h2>
          <p className="text-slate-500 text-xs">Track release dates and reporting milestones for the JSE property sector.</p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".ics" 
            className="hidden" 
          />
          <button 
            onClick={handleImportClick}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-all mr-2"
          >
            <Upload className="w-4 h-4" />
            <span>Import .ics</span>
          </button>
          <button 
            onClick={onAddEvent}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all mr-4"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Event</span>
          </button>
          <button 
            onClick={handlePrevMonth}
            className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div 
            onClick={handleToday}
            className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl font-bold text-sm shadow-sm cursor-pointer hover:bg-slate-50 transition-all"
          >
            {currentMonthName} {currentYear}
          </div>
          <button 
            onClick={handleNextMonth}
            className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
        {/* Main Calendar View */}
        <div className="lg:col-span-2 premium-card p-8 bg-white flex flex-col h-full">
          <div className="grid grid-cols-7 gap-4 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-4 flex-1">
            {Array.from({ length: 42 }).map((_, i) => {
              let day: number;
              let isCurrentMonth = true;
              let month = currentDate.getMonth();
              let year = currentDate.getFullYear();

              if (i < firstDayOfMonth) {
                day = prevMonthDays - firstDayOfMonth + i + 1;
                isCurrentMonth = false;
                month = currentDate.getMonth() - 1;
              } else if (i >= firstDayOfMonth + daysInMonth) {
                day = i - (firstDayOfMonth + daysInMonth) + 1;
                isCurrentMonth = false;
                month = currentDate.getMonth() + 1;
              } else {
                day = i - firstDayOfMonth + 1;
              }

              const isToday = day === today.getDate() && 
                              currentDate.getMonth() === today.getMonth() && 
                              currentDate.getFullYear() === today.getFullYear() &&
                              isCurrentMonth;
              
              const dayTasks = getDayTasks(day, month, year);
              const hasEarnings = dayTasks.length > 0;

              return (
                <div 
                  key={i} 
                  className={cn(
                    "relative aspect-square rounded-2xl border p-2 flex flex-col justify-between transition-all",
                    !isCurrentMonth ? "opacity-30" : "hover:border-rose-200 hover:bg-rose-50/10 cursor-default",
                    isToday ? "border-rose-500 bg-rose-50/30 ring-2 ring-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.1)]" : "border-slate-50 bg-slate-50/30",
                    hasEarnings && isCurrentMonth && !isToday && "border-slate-200 bg-white shadow-sm"
                  )}
                >
                  <span className={cn(
                    "text-[10px] font-bold",
                    isToday ? "text-rose-600" : "text-slate-400"
                  )}>{day}</span>
                  
                  {hasEarnings && (
                    <div className="flex flex-col gap-1">
                      {dayTasks.slice(0, 2).map(t => (
                        <div key={t.id} className="w-full h-1 rounded-full bg-rose-500" title={t.ticker} />
                      ))}
                      {dayTasks.length > 2 && (
                        <div className="text-[8px] font-bold text-slate-400">+{dayTasks.length - 2}</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming List */}
        <div className="flex flex-col gap-6 overflow-hidden">
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] px-2">Upcoming Events</h3>
            
            {/* Sort & Filter Controls */}
            <div className="flex items-center gap-2 px-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Filter funds..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-medium text-slate-700 outline-none focus:ring-4 focus:ring-rose-500/5 focus:border-rose-200 transition-all shadow-sm"
                />
              </div>
              <button 
                onClick={() => setSortField(prev => prev === 'date' ? 'ticker' : 'date')}
                className={cn(
                  "p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-rose-600 transition-all shadow-sm flex items-center gap-1.5",
                  sortField !== 'date' && "text-rose-600 border-rose-100 bg-rose-50/50"
                )}
                title={sortField === 'date' ? "Sorting by Date" : "Sorting by Ticker"}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span className="text-[9px] font-bold uppercase tracking-tight">{sortField}</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
            {upcomingEarnings.length === 0 ? (
              <div className="p-10 text-center bg-slate-50 rounded-[2rem] border border-slate-100 italic text-slate-400 text-xs">
                No upcoming release dates scheduled.
              </div>
            ) : (
              upcomingEarnings.map(task => (
                <div 
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  className="premium-card p-5 group cursor-pointer premium-card-hover"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-xs">
                      {task.ticker}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                        {new Date(task.earningsDate!).toLocaleDateString('default', { day: 'numeric', month: 'short' })}
                      </p>
                      <h4 className="font-bold text-slate-900 text-sm truncate max-w-[140px]">{task.companyName}</h4>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>Pre-Market Open</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
