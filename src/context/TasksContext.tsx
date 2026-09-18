import React from 'react';
import { Task } from '@/src/types';
import { seedTasks } from '@/src/lib/seedTasks';

const STORAGE_KEY = 'kinetic-tasks';

function loadInitialTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Task[];
  } catch {
    // ignore malformed storage and fall back to seed data
  }
  return seedTasks;
}

export type NewTask = Omit<Task, 'id' | 'status'> & { status?: Task['status'] };

interface TasksContextValue {
  tasks: Task[];
  addTask: (task: NewTask) => Task;
  toggleTaskStatus: (id: string) => void;
  deleteTask: (id: string) => void;
}

const TasksContext = React.createContext<TasksContextValue | null>(null);

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = React.useState<Task[]>(loadInitialTasks);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = React.useCallback((task: NewTask): Task => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      status: task.status ?? 'Pending',
    };
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  }, []);

  const toggleTaskStatus = React.useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, status: task.status === 'Completed' ? 'Pending' : 'Completed' }
          : task
      )
    );
  }, []);

  const deleteTask = React.useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  const value = React.useMemo(
    () => ({ tasks, addTask, toggleTaskStatus, deleteTask }),
    [tasks, addTask, toggleTaskStatus, deleteTask]
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const ctx = React.useContext(TasksContext);
  if (!ctx) throw new Error('useTasks must be used within a TasksProvider');
  return ctx;
}
