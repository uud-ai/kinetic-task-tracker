import React from 'react';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { Task } from '@/src/types';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/context/AuthContext';
import { seedTasks } from '@/src/lib/seedTasks';

export type NewTask = Omit<Task, 'id' | 'status'> & { status?: Task['status'] };

interface TaskRow {
  id: string;
  title: string;
  description: string;
  priority: Task['priority'];
  status: Task['status'];
  due_date: string;
  tags: string[];
  category: Task['category'];
  time: string | null;
}

function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    priority: row.priority,
    status: row.status,
    dueDate: row.due_date,
    tags: row.tags,
    category: row.category,
    time: row.time ?? undefined,
  };
}

function taskToRow(userId: string, task: NewTask) {
  return {
    user_id: userId,
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status ?? 'Pending',
    due_date: task.dueDate,
    tags: task.tags,
    category: task.category,
    time: task.time ?? null,
  };
}

interface TasksContextValue {
  tasks: Task[];
  loading: boolean;
  addTask: (task: NewTask) => Promise<Task>;
  toggleTaskStatus: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

const TasksContext = React.createContext<TasksContextValue | null>(null);

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (!error && data) setTasks((data as TaskRow[]).map(rowToTask));
        setLoading(false);
      });

    const channel = supabase
      .channel(`tasks-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${user.id}` },
        (payload: RealtimePostgresChangesPayload<TaskRow>) => {
          setTasks((prev) => {
            if (payload.eventType === 'DELETE') {
              const deletedId = (payload.old as Partial<TaskRow>).id;
              return prev.filter((t) => t.id !== deletedId);
            }
            const incoming = rowToTask(payload.new as TaskRow);
            const exists = prev.some((t) => t.id === incoming.id);
            if (exists) return prev.map((t) => (t.id === incoming.id ? incoming : t));
            return [incoming, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addTask = React.useCallback(
    async (task: NewTask): Promise<Task> => {
      if (!user) throw new Error('Требуется вход в аккаунт.');
      const { data, error } = await supabase
        .from('tasks')
        .insert(taskToRow(user.id, task))
        .select()
        .single();
      if (error || !data) throw error ?? new Error('Не удалось создать задачу.');
      const newTask = rowToTask(data as TaskRow);
      setTasks((prev) => (prev.some((t) => t.id === newTask.id) ? prev : [newTask, ...prev]));
      return newTask;
    },
    [user]
  );

  const toggleTaskStatus = React.useCallback(
    async (id: string) => {
      const current = tasks.find((t) => t.id === id);
      if (!current) return;
      const nextStatus: Task['status'] = current.status === 'Completed' ? 'Pending' : 'Completed';
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t)));
      const { error } = await supabase.from('tasks').update({ status: nextStatus }).eq('id', id);
      if (error) {
        setTasks((prev) => prev.map((t) => (t.id === id ? current : t)));
      }
    },
    [tasks]
  );

  const deleteTask = React.useCallback(
    async (id: string) => {
      const removed = tasks.find((t) => t.id === id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error && removed) {
        setTasks((prev) => (prev.some((t) => t.id === id) ? prev : [removed, ...prev]));
      }
    },
    [tasks]
  );

  const value = React.useMemo(
    () => ({ tasks, loading, addTask, toggleTaskStatus, deleteTask }),
    [tasks, loading, addTask, toggleTaskStatus, deleteTask]
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- context + hook are colocated by design
export function useTasks() {
  const ctx = React.useContext(TasksContext);
  if (!ctx) throw new Error('useTasks must be used within a TasksProvider');
  return ctx;
}

// eslint-disable-next-line react-refresh/only-export-components -- one-off write helper colocated with the context that owns the schema mapping
export async function seedInitialTasks(userId: string) {
  await supabase.from('tasks').insert(seedTasks.map((task) => taskToRow(userId, task)));
}
