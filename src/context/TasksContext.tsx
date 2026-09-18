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

function taskPatchToRow(patch: Partial<NewTask>) {
  const row: Record<string, unknown> = {};
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.description !== undefined) row.description = patch.description;
  if (patch.priority !== undefined) row.priority = patch.priority;
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.dueDate !== undefined) row.due_date = patch.dueDate;
  if (patch.tags !== undefined) row.tags = patch.tags;
  if (patch.category !== undefined) row.category = patch.category;
  if (patch.time !== undefined) row.time = patch.time ?? null;
  return row;
}

interface TasksContextValue {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  retry: () => void;
  addTask: (task: NewTask) => Promise<Task>;
  updateTask: (id: string, patch: Partial<NewTask>) => Promise<void>;
  toggleTaskStatus: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

const TasksContext = React.createContext<TasksContextValue | null>(null);

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [retryToken, setRetryToken] = React.useState(0);

  const retry = React.useCallback(() => setRetryToken((n) => n + 1), []);

  React.useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (cancelled) return;
        if (fetchError) {
          setError('Не удалось загрузить задачи. Проверьте подключение.');
        } else if (data) {
          setTasks((data as TaskRow[]).map(rowToTask));
        }
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
  }, [user, retryToken]);

  const addTask = React.useCallback(
    async (task: NewTask): Promise<Task> => {
      if (!user) throw new Error('Требуется вход в аккаунт.');
      const { data, error } = await supabase.from('tasks').insert(taskToRow(user.id, task)).select().single();
      if (error || !data) throw error ?? new Error('Не удалось создать задачу.');
      const newTask = rowToTask(data as TaskRow);
      setTasks((prev) => (prev.some((t) => t.id === newTask.id) ? prev : [newTask, ...prev]));
      return newTask;
    },
    [user]
  );

  const updateTask = React.useCallback(
    async (id: string, patch: Partial<NewTask>) => {
      const current = tasks.find((t) => t.id === id);
      if (!current) return;
      const optimistic: Task = { ...current, ...patch };
      setTasks((prev) => prev.map((t) => (t.id === id ? optimistic : t)));
      const { error: updateError } = await supabase.from('tasks').update(taskPatchToRow(patch)).eq('id', id);
      if (updateError) {
        setTasks((prev) => prev.map((t) => (t.id === id ? current : t)));
        throw updateError;
      }
    },
    [tasks]
  );

  const toggleTaskStatus = React.useCallback(
    async (id: string) => {
      const current = tasks.find((t) => t.id === id);
      if (!current) return;
      const nextStatus: Task['status'] = current.status === 'Completed' ? 'Pending' : 'Completed';
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t)));
      const { error: updateError } = await supabase.from('tasks').update({ status: nextStatus }).eq('id', id);
      if (updateError) {
        setTasks((prev) => prev.map((t) => (t.id === id ? current : t)));
        setError('Не удалось сохранить изменения. Проверьте подключение.');
      }
    },
    [tasks]
  );

  const deleteTask = React.useCallback(
    async (id: string) => {
      const removed = tasks.find((t) => t.id === id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      const { error: deleteError } = await supabase.from('tasks').delete().eq('id', id);
      if (deleteError && removed) {
        setTasks((prev) => (prev.some((t) => t.id === id) ? prev : [removed, ...prev]));
        setError('Не удалось удалить задачу. Проверьте подключение.');
      }
    },
    [tasks]
  );

  const value = React.useMemo(
    () => ({ tasks, loading, error, retry, addTask, updateTask, toggleTaskStatus, deleteTask }),
    [tasks, loading, error, retry, addTask, updateTask, toggleTaskStatus, deleteTask]
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
