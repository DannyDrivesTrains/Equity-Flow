import React from 'react';
import { Notification, Task } from '../types';
import { Bell, Clock, Calendar, X, Circle } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationMenuProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onTaskClick: (taskId: string) => void;
}

export function NotificationMenu({ 
  notifications, 
  onDismiss, 
  onMarkAsRead, 
  onClearAll,
  onTaskClick 
}: NotificationMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-2.5 bg-white border rounded-2xl transition-all shadow-sm relative",
          isOpen ? "border-rose-200 text-rose-600 bg-rose-50/50" : "border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-100"
        )}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-slate-50">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 rounded-3xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-5 border-bottom border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Alert Center</h3>
                  <span className="bg-rose-100 text-rose-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount} NEW
                  </span>
                </div>
                <button 
                  onClick={onClearAll}
                  className="text-[9px] font-bold text-slate-400 hover:text-rose-600 uppercase tracking-widest transition-colors"
                >
                  Clear All
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
                      <Bell className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-medium text-slate-400">All caught up! No active earnings alerts.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        className={cn(
                          "p-5 hover:bg-slate-50 transition-colors cursor-pointer group relative",
                          !notif.read && "bg-rose-50/20"
                        )}
                        onClick={() => {
                          onMarkAsRead(notif.id);
                          onTaskClick(notif.taskId);
                          setIsOpen(false);
                        }}
                      >
                        {!notif.read && (
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-rose-500 rounded-full" />
                        )}
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                            notif.type === 'earning-today' ? "bg-rose-500 text-white" : "bg-white border border-slate-100 text-rose-500"
                          )}>
                            {notif.type === 'earning-today' ? <Calendar className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">{notif.ticker} Milestone</span>
                              <span className="text-[9px] font-medium text-slate-400">{notif.date}</span>
                            </div>
                            <p className="text-xs font-semibold text-slate-900 leading-tight mb-2">
                              {notif.message}
                            </p>
                            <div className="flex items-center gap-3">
                              <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest group-hover:underline">View Analysis</span>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onDismiss(notif.id);
                            }}
                            className="p-1 text-slate-300 hover:text-slate-900 bg-white border border-slate-100 rounded-lg group-hover:border-slate-200 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-4 bg-white border-t border-slate-50">
                  <button 
                    onClick={() => {
                      setIsOpen(false);
                      // Navigate to calendar maybe?
                    }}
                    className="w-full py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                  >
                    View Earnings Schedule
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
