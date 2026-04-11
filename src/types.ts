export type Priority = 'High' | 'Medium' | 'Low';
export type Status = 'Completed' | 'In Progress' | 'Pending';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  dueDate: string;
  tags: string[];
  category: 'Work' | 'Personal' | 'Health';
  time?: string;
}

export type Screen = 'dashboard' | 'tasks' | 'create' | 'calendar';
