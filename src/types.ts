export type Priority = 'Low' | 'Medium' | 'High';

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  dependsOn?: string[];
  estimatedMinutes?: number;
  actualMinutes?: number;
}

export interface Analyst {
  id: string;
  name: string;
  initials: string;
  color: string; // Tailwind class OR Hex code
}

export interface Task {
  id: string;
  ticker: string;
  companyName: string;
  priority: Priority;
  assigneeId?: string;
  targetPrice?: number;
  currentPrice?: number;
  earningsDate?: string;
  lastUpdated: string;
  description: string;
  columnId: string;
  checklist: ChecklistItem[];
  thesis?: string;
  todo?: string;
  notebookLMLink?: string;
  catalysts?: string[];
  risks?: string[];
}

export interface Column {
  id: string;
  title: string;
}

export interface Notification {
  id: string;
  taskId: string;
  ticker: string;
  message: string;
  type: 'earning-soon' | 'earning-today';
  date: string;
  read: boolean;
}
