import React from 'react';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { Task } from '@/src/types';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/context/AuthContext';
import { seedTasks } from '@/src/lib/seedTasks';
import { enqueueOperation, flushQueue, getQueue, isNetworkError } from '@/src/lib/offlineQueue';

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

function tasksCacheKey(userId: string) {
  return `kinetic-tasks-cache-${userId}`;
}

function readTasksCache(userId: string): Task[] | null {
  try {
    const raw = localStorage.getItem(tasksCacheKey(userId));
    return raw ? (JSON.parse(raw) as Task[]) : null;
  } catch {
    return null;
  }
}

function writeTasksCache(userId: string, tasks: Task[]) {
  try {
    localStorage.setItem(tasksCacheKey(userId), JSON.stringify(tasks));
  } catch {
    // localStorage may be unavailable (private browsing, storage quota) — cache is best-effort
  }
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
  pendingSyncCount: number;
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
  const [pendingSyncCount, setPendingSyncCount] = React.useState(0);

  // mirrors `tasks` synchronously (unlike React state, which may not be
  // committed yet when the next line of code runs) so optimistic read-then-write
  // helpers below never act on a stale snapshot
  const tasksRef = React.useRef<Task[]>(tasks);
  const applyTasks = React.useCallback((updater: Task[] | ((prev: Task[]) => Task[])) => {
    const next = typeof updater === 'function' ? (updater as (prev: Task[]) => Task[])(tasksRef.current) : updater;
    tasksRef.current = next;
    setTasks(next);
  }, []);

  const retry = React.useCallback(() => setRetryToken((n) => n + 1), []);

  React.useEffect(() => {
    if (!user) {
      setPendingSyncCount(0);
      return;
    }

    setPendingSyncCount(getQueue(user.id).length);

    const flush = async () => {
      if (!navigator.onLine) return;
      await flushQueue(user.id);
      setPendingSyncCount(getQueue(user.id).length);
    };

    flush();
    window.addEventListener('online', flush);
    return () => window.removeEventListener('online', flush);
  }, [user]);

  React.useEffect(() => {
    if (!user) {
      applyTasks([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    let fetchResolved = false;
    const pendingRealtimeUpdates: Array<(tasks: Task[]) => Task[]> = [];
    setLoading(true);
    setError(null);

    const applyRealtimePayload = (prev: Task[], payload: RealtimePostgresChangesPayload<TaskRow>) => {
      if (payload.eventType === 'DELETE') {
        const deletedId = (payload.old as Partial<TaskRow>).id;
        return prev.filter((t) => t.id !== deletedId);
      }
      const incoming = rowToTask(payload.new as TaskRow);
      const exists = prev.some((t) => t.id === incoming.id);
      if (exists) return prev.map((t) => (t.id === incoming.id ? incoming : t));
      return [incoming, ...prev];
    };

    supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (cancelled) return;
        if (fetchError) {
          const cached = readTasksCache(user.id);
          if (cached) {
            let next = cached;
            for (const apply of pendingRealtimeUpdates) next = apply(next);
            applyTasks(next);
          } else {
            setError('Не удалось загрузить задачи. Проверьте подключение.');
          }
        } else if (data) {
          // replay any realtime events that arrived before this fetch resolved,
          // so they aren't clobbered by this snapshot
          let next = (data as TaskRow[]).map(rowToTask);
          for (const apply of pendingRealtimeUpdates) next = apply(next);
          applyTasks(next);

          // first login after email confirmation never ran the sign-up-time seed,
          // so seed here once, the first time we see this user with an empty list
          if (next.length === 0 && user.user_metadata?.needsSeed) {
            seedInitialTasks(user.id)
              .then(() => supabase.from('tasks').select('*').order('created_at', { ascending: false }))
              .then(({ data: seeded }) => {
                if (!cancelled && seeded) applyTasks((seeded as TaskRow[]).map(rowToTask));
              })
              .catch(() => {
                if (!cancelled) setError('Не удалось создать стартовые задачи. Проверьте подключение.');
              })
              .finally(() => {
                supabase.auth.updateUser({ data: { needsSeed: false } });
              });
          }
        }
        fetchResolved = true;
        setLoading(false);
      });

    const channel = supabase
      .channel(`tasks-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${user.id}` },
        (payload: RealtimePostgresChangesPayload<TaskRow>) => {
          if (!fetchResolved) pendingRealtimeUpdates.push((tasks) => applyRealtimePayload(tasks, payload));
          applyTasks((prev) => applyRealtimePayload(prev, payload));
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user, retryToken, applyTasks]);

  React.useEffect(() => {
    if (user && !loading) writeTasksCache(user.id, tasks);
  }, [user, loading, tasks]);

  const queueForLater = React.useCallback(
    (op: Parameters<typeof enqueueOperation>[1]) => {
      if (!user) return;
      enqueueOperation(user.id, op);
      setPendingSyncCount(getQueue(user.id).length);
    },
    [user]
  );

  const addTask = React.useCallback(
    async (task: NewTask): Promise<Task> => {
      if (!user) throw new Error('Требуется вход в аккаунт.');
      const id = crypto.randomUUID();
      const newTask: Task = { ...task, id, status: task.status ?? 'Pending' };
      const row = { id, ...taskToRow(user.id, task) };

      applyTasks((prev) => [newTask, ...prev]);

      const { error } = await supabase.from('tasks').insert(row);
      if (error) {
        if (isNetworkError(error)) {
          queueForLater({ kind: 'insert', id, row });
          return newTask;
        }
        applyTasks((prev) => prev.filter((t) => t.id !== id));
        throw error;
      }
      return newTask;
    },
    [user, queueForLater, applyTasks]
  );

  const updateTask = React.useCallback(
    async (id: string, patch: Partial<NewTask>) => {
      const current = tasksRef.current.find((t) => t.id === id);
      if (!current) return;
      applyTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
      const row = taskPatchToRow(patch);
      const { error: updateError } = await supabase.from('tasks').update(row).eq('id', id);
      if (updateError) {
        if (isNetworkError(updateError)) {
          queueForLater({ kind: 'update', id, row });
          return;
        }
        // restore only the fields we optimistically changed, so a concurrent
        // change to other fields on this task (e.g. a realtime update) isn't clobbered
        const revertPatch = Object.fromEntries(
          (Object.keys(patch) as (keyof NewTask)[]).map((key) => [key, current[key]])
        );
        applyTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...revertPatch } : t)));
        throw updateError;
      }
    },
    [queueForLater, applyTasks]
  );

  const toggleTaskStatus = React.useCallback(
    async (id: string) => {
      const current = tasksRef.current.find((t) => t.id === id);
      if (!current) return;
      const nextStatus: Task['status'] = current.status === 'Completed' ? 'Pending' : 'Completed';
      applyTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t)));
      const { error: updateError } = await supabase.from('tasks').update({ status: nextStatus }).eq('id', id);
      if (updateError) {
        if (isNetworkError(updateError)) {
          queueForLater({ kind: 'update', id, row: { status: nextStatus } });
          return;
        }
        applyTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: current.status } : t)));
        setError('Не удалось сохранить изменения. Проверьте подключение.');
      }
    },
    [queueForLater, applyTasks]
  );

  const deleteTask = React.useCallback(
    async (id: string) => {
      const removed = tasksRef.current.find((t) => t.id === id);
      applyTasks((prev) => prev.filter((t) => t.id !== id));
      const { error: deleteError } = await supabase.from('tasks').delete().eq('id', id);
      if (deleteError) {
        if (isNetworkError(deleteError)) {
          queueForLater({ kind: 'delete', id });
          return;
        }
        if (removed) {
          applyTasks((prev) => (prev.some((t) => t.id === id) ? prev : [removed, ...prev]));
        }
        setError('Не удалось удалить задачу. Проверьте подключение.');
      }
    },
    [queueForLater, applyTasks]
  );

  const value = React.useMemo(
    () => ({ tasks, loading, error, pendingSyncCount, retry, addTask, updateTask, toggleTaskStatus, deleteTask }),
    [tasks, loading, error, pendingSyncCount, retry, addTask, updateTask, toggleTaskStatus, deleteTask]
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
  const { error } = await supabase.from('tasks').insert(seedTasks.map((task) => taskToRow(userId, task)));
  if (error) throw error;
}
