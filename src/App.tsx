/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { KanbanBoard } from './components/KanbanBoard';
import { Sidebar } from './components/Sidebar';
import { TaskModal } from './components/TaskModal';
import { ResearchArchive } from './components/ResearchArchive';
import { EarningsCalendar } from './components/EarningsCalendar';
import { NewAnalysisModal } from './components/NewAnalysisModal';
import { NotebookLMView } from './components/NotebookLMView';
import { WorkloadStats } from './components/WorkloadStats';
import { ResearchList } from './components/ResearchList';
import { AnalystSettings } from './components/AnalystSettings';
import { Column, Task, Analyst, Priority, Notification } from './types';
import { Search, Plus, Filter, Bell, User, LayoutDashboard, BookOpen, Calendar as CalendarIcon, Users } from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { NotificationMenu } from './components/NotificationMenu';
import { useEffect } from 'react';

const INITIAL_COLUMNS: Column[] = [
  { id: 'todo', title: 'Research Backlog' },
  { id: 'analysis', title: 'S1-S2: Data Analysis' },
  { id: 'evaluation', title: 'S3-S4: Thesis & Factsheet' },
  { id: 'done', title: 'S5: Completed' },
];

const PROPERTY_RESEARCH_WORKFLOW = [
  { id: 's1', label: 'Management Call Review', estimatedMinutes: 90 },
  { id: 's2', label: 'Data Assembly (Excel)', dependsOn: ['s1'], estimatedMinutes: 180 },
  { id: 's3', label: 'Analysis & Factsheet', dependsOn: ['s2'], estimatedMinutes: 120 },
  { id: 's4', label: 'Investment Thesis', dependsOn: ['s3'], estimatedMinutes: 60 },
  { id: 's5', label: 'Distribution & Archive', dependsOn: ['s4'], estimatedMinutes: 30 },
];

const ANALYSTS: Analyst[] = [
  { id: 'daniel', name: 'Daniel', initials: 'DN', color: 'bg-rose-500' },
  { id: 'takalani', name: 'Takalani', initials: 'TK', color: 'bg-indigo-500' },
  { id: 'both', name: 'Both', initials: 'BT', color: 'bg-slate-700' },
];

const INITIAL_TASKS: Task[] = [
  {
    id: 'grt',
    ticker: 'GRT',
    companyName: 'Growthpoint Properties',
    priority: 'High',
    assigneeId: 'daniel',
    earningsDate: '2026-04-20',
    lastUpdated: '2026-03-20',
    description: 'South Africa diversified portfolio. Focus on retail reversion rates.',
    columnId: 'analysis',
    notebookLMLink: 'https://notebooklm.google.com/notebook/example-grt',
    checklist: PROPERTY_RESEARCH_WORKFLOW.map((step, i) => ({
      id: step.id,
      label: step.label,
      completed: i < 2,
      dependsOn: step.dependsOn,
      estimatedMinutes: (step as any).estimatedMinutes || 60,
    })),
  },
  {
    id: 'nepi',
    ticker: 'NEP',
    companyName: 'NEPI Rockcastle',
    priority: 'High',
    assigneeId: 'takalani',
    earningsDate: '2026-04-17',
    lastUpdated: '2026-03-22',
    description: 'CEE retail focused. Analyzing regional NOI growth differentials.',
    columnId: 'evaluation',
    checklist: PROPERTY_RESEARCH_WORKFLOW.map((step, i) => ({
      id: step.id,
      label: step.label,
      completed: i < 4,
      dependsOn: step.dependsOn,
      estimatedMinutes: (step as any).estimatedMinutes || 60,
    })),
  },
  {
    id: 'vke',
    ticker: 'VKE',
    companyName: 'Vukile Property Fund',
    priority: 'Medium',
    assigneeId: 'daniel',
    earningsDate: '2026-04-25',
    lastUpdated: '2026-03-21',
    description: 'Specialist retail focus. Reviewing Spanish portfolio performance.',
    columnId: 'todo',
    todo: '# Key Catalysts\n- [ ] Spanish retail recovery\n- [ ] LTV optimization\n\n**Note:** Review LFL growth.',
    checklist: PROPERTY_RESEARCH_WORKFLOW.map((step, i) => ({
      id: step.id,
      label: step.label,
      completed: false,
      dependsOn: step.dependsOn,
      estimatedMinutes: (step as any).estimatedMinutes || 60,
    })),
  },
  {
    id: 'hyprop',
    ticker: 'HYP',
    companyName: 'Hyprop Investments',
    priority: 'Low',
    assigneeId: 'both',
    earningsDate: '2026-03-15',
    lastUpdated: '2026-03-25',
    description: 'Specialist retail portfolio. Documenting Step 5 completion.',
    columnId: 'done',
    thesis: 'Stable retail recovery but high exposure to emerging market currency fluctuations.',
    checklist: PROPERTY_RESEARCH_WORKFLOW.map((step, i) => ({
      id: step.id,
      label: step.label,
      completed: true,
      dependsOn: step.dependsOn,
      estimatedMinutes: (step as any).estimatedMinutes || 60,
    })),
  },
];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('equityflow_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('board');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [targetColumnId, setTargetColumnId] = useState('todo');
  const [analysts, setAnalysts] = useState<Analyst[]>(() => {
    const saved = localStorage.getItem('equityflow_analysts');
    return saved ? JSON.parse(saved) : ANALYSTS;
  });
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('equityflow_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist tasks and notifications
  useEffect(() => {
    localStorage.setItem('equityflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('equityflow_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('equityflow_analysts', JSON.stringify(analysts));
  }, [analysts]);
  
  // Notification Logic
  useEffect(() => {
    const today = new Date('2026-04-17'); // Using system context date
    const alerts: Notification[] = [];

    tasks.forEach(task => {
      if (!task.earningsDate) return;
      const earningsDate = new Date(task.earningsDate);
      const diffTime = earningsDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        alerts.push({
          id: `today-${task.id}`,
          taskId: task.id,
          ticker: task.ticker,
          message: `${task.companyName} (${task.ticker}) earnings are being released TODAY.`,
          type: 'earning-today',
          date: 'Just now',
          read: false
        });
      } else if (diffDays > 0 && diffDays <= 7) {
        alerts.push({
          id: `soon-${task.id}`,
          taskId: task.id,
          ticker: task.ticker,
          message: `${task.companyName} reporting in ${diffDays} days. Finalize your research.`,
          type: 'earning-soon',
          date: `${diffDays}d left`,
          read: false
        });
      }
    });

    setNotifications(alerts);
  }, [tasks]);

  const handleDismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleNotificationTaskClick = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
    }
  };

  const handleUpdateAnalyst = (updatedAnalyst: Analyst) => {
    setAnalysts(prev => prev.map(a => a.id === updatedAnalyst.id ? updatedAnalyst : a));
  };

  const handleAddAnalyst = (name: string) => {
    const newAnalyst: Analyst = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      initials: name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
      color: '#64748b' // Default slate
    };
    setAnalysts(prev => [...prev, newAnalyst]);
  };

  const handleRemoveAnalyst = (id: string) => {
    setAnalysts(prev => prev.filter(a => a.id !== id));
  };
  
  // Filter States
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filters, setFilters] = useState<{
    assigneeId: string | null;
    priority: Priority | null;
  }>({
    assigneeId: null,
    priority: null,
  });

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    setSelectedTask(updatedTask);
  };

  const handleAddTask = (columnId: string) => {
    setTargetColumnId(columnId);
    setIsNewTaskModalOpen(true);
  };

  const handleInitiateAnalysis = (data: {
    ticker: string;
    companyName: string;
    priority: Priority;
    assigneeId: string;
    description: string;
    earningsDate: string;
    notebookLMLink?: string;
  }) => {
    const newTask: Task = {
      id: Math.random().toString(36).substring(2, 11),
      ticker: data.ticker,
      companyName: data.companyName,
      priority: data.priority,
      assigneeId: data.assigneeId,
      earningsDate: data.earningsDate,
      lastUpdated: new Date().toISOString().split('T')[0],
      description: data.description,
      columnId: targetColumnId,
      notebookLMLink: data.notebookLMLink,
      checklist: PROPERTY_RESEARCH_WORKFLOW.map((step) => ({
        id: step.id,
        label: step.label,
        completed: false,
        dependsOn: step.dependsOn,
        estimatedMinutes: (step as any).estimatedMinutes || 60,
      })),
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const handleImportCalendarTasks = (importedData: Partial<Task>[]) => {
    const newTasks: Task[] = importedData.map(data => ({
      id: Math.random().toString(36).substring(2, 11),
      ticker: data.ticker || 'UNTK',
      companyName: data.companyName || 'Imported REIT',
      priority: data.priority || 'Medium',
      assigneeId: 'daniel', // Default to daniel or unassigned
      earningsDate: data.earningsDate,
      lastUpdated: new Date().toISOString().split('T')[0],
      description: data.description || 'Imported via Outlook .ics file',
      columnId: 'todo',
      checklist: PROPERTY_RESEARCH_WORKFLOW.map((step) => ({
        id: step.id,
        label: step.label,
        completed: false,
        dependsOn: step.dependsOn,
        estimatedMinutes: (step as any).estimatedMinutes || 60,
      })),
    }));
    setTasks(prev => [...newTasks, ...prev]);
  };

  const handleToggleChecklist = (taskId: string, itemId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== taskId) return task;
      
      const item = task.checklist.find(i => i.id === itemId);
      if (!item) return task;

      // Dependency Check
      if (!item.completed && item.dependsOn && item.dependsOn.length > 0) {
        const prerequisitesMet = item.dependsOn.every(depId => {
          const depItem = task.checklist.find(i => i.id === depId);
          return depItem?.completed;
        });

        if (!prerequisitesMet) {
          // Find missing dependencies for the alert
          const missingDeps = item.dependsOn
            .filter(depId => !task.checklist.find(i => i.id === depId)?.completed)
            .map(depId => task.checklist.find(i => i.id === depId)?.label.split(':')[0] || depId);
          
          alert(`Locked: Please complete the following prerequisites first: ${missingDeps.join(', ')}`);
          return task;
        }
      }

      return {
        ...task,
        checklist: task.checklist.map(item => 
          item.id === itemId ? { ...item, completed: !item.completed } : item
        )
      };
    }));
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    setTasks((prevTasks) => {
      const activeTask = prevTasks.find((t) => t.id === activeId);
      const overTask = prevTasks.find((t) => t.id === overId);
      const overColumn = INITIAL_COLUMNS.find((c) => c.id === overId);

      if (!activeTask) return prevTasks;

      if (overTask) {
        if (activeTask.columnId !== overTask.columnId) {
          const updatedTasks = prevTasks.map((t) => 
            t.id === activeId ? { ...t, columnId: overTask.columnId } : t
          );
          const activeIndex = updatedTasks.findIndex((t) => t.id === activeId);
          const overIndex = updatedTasks.findIndex((t) => t.id === overId);
          return arrayMove(updatedTasks, activeIndex, overIndex);
        }
      }

      if (overColumn) {
        if (activeTask.columnId !== overColumn.id) {
          return prevTasks.map((t) => 
            t.id === activeId ? { ...t, columnId: overColumn.id } : t
          );
        }
      }

      return prevTasks;
    });
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId !== overId) {
      setTasks((items) => {
        const oldIndex = items.findIndex((t) => t.id === activeId);
        const newIndex = items.findIndex((t) => t.id === overId);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAssignee = !filters.assigneeId || t.assigneeId === filters.assigneeId;
    const matchesPriority = !filters.priority || t.priority === filters.priority;

    return matchesSearch && matchesAssignee && matchesPriority;
  });

  const upcomingEarningsCount = tasks.filter(t => {
    if (!t.earningsDate) return false;
    const d = new Date(t.earningsDate);
    return d.getTime() > Date.now();
  }).length;

  const archiveCount = tasks.filter(t => t.columnId === 'done').length;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        stats={{
          active: tasks.filter(t => t.columnId !== 'done').length,
          earnings: upcomingEarningsCount,
          archive: archiveCount
        }}
      />
      
      <div className="flex-1 flex flex-col min-w-0 h-full p-8 lg:p-10 gap-6 overflow-hidden">
        {/* Top Header Section */}
        <header className="flex items-center justify-between shrink-0">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {activeTab === 'overview' && "Dashboard Overview"}
              {activeTab === 'board' && "Research Board"}
              {activeTab === 'research' && "Research Archive"}
              {activeTab === 'calendar' && "Earnings Schedule"}
              {activeTab === 'notebook' && "NotebookLM Hub"}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {activeTab === 'overview' && "Portfolio performance and team workload overview."}
              {activeTab === 'board' && "Manage and track your equity research workflow."}
              {activeTab === 'research' && "Access finalized property research documents."}
              {activeTab === 'calendar' && "Track reporting dates and reporting milestones."}
              {activeTab === 'notebook' && "Centralized AI research notebooks and analysis repositories."}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search resources..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-6 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all w-80 shadow-sm"
              />
            </div>
            <NotificationMenu 
              notifications={notifications}
              onDismiss={handleDismissNotification}
              onMarkAsRead={handleMarkAsRead}
              onClearAll={handleClearNotifications}
              onTaskClick={handleNotificationTaskClick}
            />
            <button className="flex items-center gap-3 pl-2 pr-4 py-2 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-rose-100 transition-all">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-[10px] uppercase">dn</div>
              <span className="text-sm font-semibold text-slate-700">Daniel</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 min-h-0 bg-transparent rounded-3xl overflow-hidden">
          {activeTab === 'overview' && (
            <div className="space-y-8 overflow-y-auto h-full pr-4 custom-scrollbar">
              {/* Global Pipeline Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
                <button 
                  onClick={() => setActiveTab('board')}
                  className="premium-card p-6 flex flex-col gap-1 text-left hover:border-rose-200 transition-all cursor-pointer"
                >
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Active Research</span>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-slate-900">{tasks.filter(t => t.columnId !== 'done').length}</span>
                    <span className="text-rose-600 text-[10px] font-bold mb-1.5">+2 this week</span>
                  </div>
                </button>
                <button 
                  onClick={() => setActiveTab('calendar')}
                  className="premium-card p-6 flex flex-col gap-1 text-left hover:border-rose-200 transition-all cursor-pointer"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upcoming Earnings</span>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-slate-900">{upcomingEarningsCount}</span>
                    <span className="text-slate-400 text-[10px] font-bold mb-1.5">Next 30 Days</span>
                  </div>
                </button>
                <button 
                  onClick={() => setActiveTab('research')}
                  className="premium-card p-6 flex flex-col gap-1 text-left hover:border-rose-200 transition-all cursor-pointer"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Finalized Docs</span>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-slate-900">{archiveCount}</span>
                    <span className="text-emerald-500 text-[10px] font-bold mb-1.5">Archive Ready</span>
                  </div>
                </button>
              </div>

              <WorkloadStats tasks={tasks} analysts={ANALYSTS} />
            </div>
          )}

          {activeTab === 'board' && (
            <div className="flex flex-col gap-6 h-full">
               <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-white border border-slate-200 p-1 rounded-2xl shadow-sm">
                    <button 
                      onClick={() => setViewMode('kanban')}
                      className={cn(
                        "px-5 py-2 text-xs font-bold rounded-xl transition-all",
                        viewMode === 'kanban' ? "bg-rose-50 text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
                      )}
                    >
                      Kanban Explorer
                    </button>
                    <button 
                      onClick={() => setViewMode('list')}
                      className={cn(
                        "px-5 py-2 text-xs font-bold rounded-xl transition-all",
                        viewMode === 'list' ? "bg-rose-50 text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
                      )}
                    >
                      List View
                    </button>
                  </div>
                  <button 
                    onClick={() => handleAddTask('todo')}
                    className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                  >
                    <Plus className="w-4 h-4" />
                    NEW ANALYSIS
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsFilterVisible(!isFilterVisible)}
                    className={cn(
                      "p-2.5 border rounded-2xl transition-all shadow-sm flex items-center gap-2",
                      isFilterVisible || Object.values(filters).some(v => v !== null)
                        ? "bg-rose-50 border-rose-200 text-rose-600"
                        : "bg-white border-slate-200 text-slate-500 hover:text-rose-600"
                    )}
                  >
                    <Filter className="w-4 h-4" />
                    {Object.values(filters).some(v => v !== null) && (
                      <span className="w-2 h-2 bg-rose-500 rounded-full" />
                    )}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {isFilterVisible && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-wrap gap-6 items-end mb-2">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Lead Analyst</label>
                        <select 
                          value={filters.assigneeId || ''}
                          onChange={(e) => setFilters(f => ({ ...f, assigneeId: e.target.value || null }))}
                          className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-rose-500/10 min-w-[160px]"
                        >
                          <option value="">All Analysts</option>
                          {ANALYSTS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Priority</label>
                        <select 
                          value={filters.priority || ''}
                          onChange={(e) => setFilters(f => ({ ...f, priority: (e.target.value as Priority) || null }))}
                          className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-rose-500/10 min-w-[140px]"
                        >
                          <option value="">All Priorities</option>
                          <option value="High">High Priority</option>
                          <option value="Medium">Medium Priority</option>
                          <option value="Low">Low Priority</option>
                        </select>
                      </div>

                      <button 
                        onClick={() => setFilters({ assigneeId: null, priority: null })}
                        className="p-3 text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="flex-1 min-h-0">
                  {viewMode === 'kanban' ? (
                    <KanbanBoard 
                      columns={INITIAL_COLUMNS} 
                      tasks={filteredTasks} 
                      analysts={ANALYSTS}
                      onAddTask={handleAddTask} 
                      onDeleteTask={handleDeleteTask}
                      onToggleChecklist={handleToggleChecklist}
                      onDragEnd={onDragEnd}
                      onDragOver={onDragOver}
                      onTaskClick={setSelectedTask}
                      onUpdateTask={handleTaskUpdate}
                    />
                  ) : (
                    <ResearchList 
                      tasks={filteredTasks}
                      analysts={ANALYSTS}
                      onTaskClick={setSelectedTask}
                    />
                  )}
              </div>
            </div>
          )}

          {activeTab === 'research' && (
            <ResearchArchive 
              tasks={tasks} 
              analysts={ANALYSTS}
              onTaskClick={setSelectedTask} 
            />
          )}

          {activeTab === 'calendar' && (
            <EarningsCalendar 
              tasks={tasks} 
              onTaskClick={setSelectedTask} 
              onAddEvent={() => handleAddTask('todo')}
              onImportTasks={handleImportCalendarTasks}
            />
          )}

          {activeTab === 'notebook' && (
            <NotebookLMView 
              tasks={tasks} 
              onTaskClick={setSelectedTask} 
            />
          )}

          {activeTab === 'personnel' && (
            <AnalystSettings 
              analysts={analysts}
              onUpdateAnalyst={handleUpdateAnalyst}
              onAddAnalyst={handleAddAnalyst}
              onRemoveAnalyst={handleRemoveAnalyst}
            />
          )}
        </div>
      </div>

      <NewAnalysisModal 
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        onAdd={handleInitiateAnalysis}
        analysts={analysts}
      />

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          analysts={analysts}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdate}
          onToggleChecklist={handleToggleChecklist}
        />
      )}
    </div>
  );
}
