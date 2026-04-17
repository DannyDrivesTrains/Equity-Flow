import React from 'react';
import { Column, Task, Analyst } from '../types';
import { KanbanCard } from './KanbanCard';
import { Plus, MoreHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DndContext, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  DragOverEvent
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';

interface KanbanBoardProps {
  columns: Column[];
  tasks: Task[];
  analysts: Analyst[];
  onAddTask: (columnId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleChecklist: (taskId: string, itemId: string) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onDragOver: (event: DragOverEvent) => void;
  onTaskClick: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
}

export function KanbanBoard({ 
  columns, 
  tasks, 
  analysts,
  onAddTask, 
  onDeleteTask, 
  onToggleChecklist, 
  onDragEnd, 
  onDragOver,
  onTaskClick,
  onUpdateTask,
}: KanbanBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columnColors: Record<string, string> = {
    'todo': 'text-slate-400 bg-slate-100 ring-slate-200',
    'in-progress': 'text-rose-600 bg-rose-50 ring-rose-100',
    'review': 'text-amber-600 bg-amber-50 ring-amber-100',
    'done': 'text-emerald-600 bg-emerald-50 ring-emerald-100',
  };

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
    >
      <div className="flex gap-8 h-full overflow-x-auto pb-4 custom-scrollbar">
        {columns.map((column) => {
          const columnTasks = tasks.filter((t) => t.columnId === column.id);
          const colorClass = columnColors[column.id] || 'text-slate-400 bg-slate-100 ring-slate-200';
          
          return (
            <div key={column.id} className="flex-shrink-0 w-80 flex flex-col h-full bg-slate-100/30 rounded-[2.5rem] border border-slate-200/40 overflow-hidden">
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    column.id === 'in-progress' ? 'bg-rose-500 animate-pulse' : 'bg-slate-300'
                  )}></span>
                  <h3 className="font-bold text-slate-800 tracking-tight">{column.title}</h3>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-lg ring-1",
                    colorClass
                  )}>
                    {columnTasks.length}
                  </span>
                </div>
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4 custom-scrollbar">
                <SortableContext 
                  id={column.id}
                  items={columnTasks.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <AnimatePresence mode="popLayout">
                    {columnTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <KanbanCard 
                          task={task} 
                          analyst={analysts.find(a => a.id === task.assigneeId)}
                          onDelete={onDeleteTask}
                          onToggleChecklist={onToggleChecklist}
                          onClick={() => onTaskClick(task)}
                          onUpdate={(updated) => onUpdateTask(updated)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </SortableContext>
                
                <button
                  onClick={() => onAddTask(column.id)}
                  className="w-full py-4 bg-white/50 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:border-rose-200 hover:text-rose-500 hover:bg-rose-50/30 transition-all group shadow-sm"
                >
                  <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 group-hover:scale-110" />
                  New Analysis
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </DndContext>
  );
}
