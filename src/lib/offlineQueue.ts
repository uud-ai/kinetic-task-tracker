import { supabase } from '@/src/lib/supabase';

export type QueuedOperation =
  | { kind: 'insert'; id: string; row: Record<string, unknown> }
  | { kind: 'update'; id: string; row: Record<string, unknown> }
  | { kind: 'delete'; id: string };

function queueKey(userId: string) {
  return `kinetic-sync-queue-${userId}`;
}

export function getQueue(userId: string): QueuedOperation[] {
  try {
    const raw = localStorage.getItem(queueKey(userId));
    return raw ? (JSON.parse(raw) as QueuedOperation[]) : [];
  } catch {
    return [];
  }
}

function setQueue(userId: string, queue: QueuedOperation[]) {
  try {
    localStorage.setItem(queueKey(userId), JSON.stringify(queue));
  } catch {
    // localStorage may be unavailable — queue then only lives for this tab session
  }
}

export function enqueueOperation(userId: string, op: QueuedOperation) {
  setQueue(userId, [...getQueue(userId), op]);
}

export function isNetworkError(error: unknown): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return true;
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message: unknown }).message)
        : '';
  return /fetch|network|load failed/i.test(message);
}

async function applyOperation(op: QueuedOperation) {
  if (op.kind === 'insert') return supabase.from('tasks').insert(op.row);
  if (op.kind === 'update') return supabase.from('tasks').update(op.row).eq('id', op.id);
  return supabase.from('tasks').delete().eq('id', op.id);
}

/**
 * Replays queued operations in order against Supabase. Stops (leaving the
 * remainder queued) on the first network failure; a non-network failure
 * (e.g. the row was already deleted elsewhere) is dropped so it can't block
 * the queue forever.
 */
export async function flushQueue(userId: string): Promise<QueuedOperation[]> {
  let queue = getQueue(userId);
  while (queue.length > 0) {
    const op = queue[0];
    const { error } = await applyOperation(op);
    if (error && isNetworkError(error)) break;
    queue = queue.slice(1);
    setQueue(userId, queue);
  }
  return queue;
}
