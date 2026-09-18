import { vi } from 'vitest';

export interface MockTaskRow {
  id: string;
  user_id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  due_date: string;
  tags: string[];
  category: string;
  time: string | null;
  created_at: string;
}

export const mockTaskRows: MockTaskRow[] = [];
let idCounter = 0;

function materialize(row: Partial<MockTaskRow>): MockTaskRow {
  return {
    id: `row-${++idCounter}`,
    created_at: new Date().toISOString(),
    ...row,
  } as MockTaskRow;
}

function thenable<T>(resolve: () => T) {
  return { then: (onFulfilled: (value: T) => unknown) => Promise.resolve(resolve()).then(onFulfilled) };
}

type ForcedErrorKind = 'insert' | 'update' | 'delete';
let forcedError: { kind: ForcedErrorKind; message: string } | null = null;

export function resetMockTasks(rows: Partial<MockTaskRow>[] = []) {
  mockTaskRows.length = 0;
  mockTaskRows.push(...rows.map(materialize));
  forcedError = null;
}

/** Makes the next matching insert/update/delete resolve with this error instead of succeeding — simulates being offline. */
export function forceNextError(kind: ForcedErrorKind, message = 'Failed to fetch') {
  forcedError = { kind, message };
}

function takeForcedError(kind: ForcedErrorKind): { message: string } | null {
  if (forcedError?.kind !== kind) return null;
  const { message } = forcedError;
  forcedError = null;
  return { message };
}

export const supabase = {
  from(_table: string) {
    return {
      select: () => ({
        order: () => thenable(() => ({ data: [...mockTaskRows], error: null })),
      }),
      insert: (rowOrRows: Partial<MockTaskRow> | Partial<MockTaskRow>[]) => {
        const materialized = (Array.isArray(rowOrRows) ? rowOrRows : [rowOrRows]).map(materialize);
        let committed = false;
        const commit = () => {
          const forced = takeForcedError('insert');
          if (forced) return { data: null, error: forced };
          if (!committed) {
            mockTaskRows.unshift(...materialized);
            committed = true;
          }
          return { data: materialized, error: null };
        };
        return {
          then: (onFulfilled: (value: { data: MockTaskRow[] | null; error: { message: string } | null }) => unknown) =>
            Promise.resolve(commit()).then(onFulfilled),
          select: () => ({
            single: () =>
              thenable(() => {
                const result = commit();
                return { data: result.data?.[0] ?? null, error: result.error };
              }),
          }),
        };
      },
      update: (patch: Partial<MockTaskRow>) => ({
        eq: (_column: string, id: string) =>
          thenable(() => {
            const forced = takeForcedError('update');
            if (forced) return { error: forced };
            const row = mockTaskRows.find((r) => r.id === id);
            if (row) Object.assign(row, patch);
            return { error: null };
          }),
      }),
      delete: () => ({
        eq: (_column: string, id: string) =>
          thenable(() => {
            const forced = takeForcedError('delete');
            if (forced) return { error: forced };
            const index = mockTaskRows.findIndex((r) => r.id === id);
            if (index !== -1) mockTaskRows.splice(index, 1);
            return { error: null };
          }),
      }),
    };
  },
  channel(_name: string) {
    const chan = {
      on: () => chan,
      subscribe: () => chan,
    };
    return chan;
  },
  removeChannel: vi.fn(),
};
