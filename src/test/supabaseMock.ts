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

export function resetMockTasks(rows: Partial<MockTaskRow>[] = []) {
  mockTaskRows.length = 0;
  mockTaskRows.push(...rows.map(materialize));
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
          if (!committed) {
            mockTaskRows.unshift(...materialized);
            committed = true;
          }
        };
        return {
          then: (onFulfilled: (value: { data: MockTaskRow[]; error: null }) => unknown) => {
            commit();
            return Promise.resolve({ data: materialized, error: null }).then(onFulfilled);
          },
          select: () => ({
            single: () =>
              thenable(() => {
                commit();
                return { data: materialized[0], error: null };
              }),
          }),
        };
      },
      update: (patch: Partial<MockTaskRow>) => ({
        eq: (_column: string, id: string) =>
          thenable(() => {
            const row = mockTaskRows.find((r) => r.id === id);
            if (row) Object.assign(row, patch);
            return { error: null };
          }),
      }),
      delete: () => ({
        eq: (_column: string, id: string) =>
          thenable(() => {
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
