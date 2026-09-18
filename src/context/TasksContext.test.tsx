import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { resetMockTasks } from '@/src/test/supabaseMock';
import { TasksProvider, useTasks, NewTask } from './TasksContext';

vi.mock('@/src/lib/supabase', () => import('@/src/test/supabaseMock'));
vi.mock('@/src/context/AuthContext', () => import('@/src/test/authMock'));

const wrapper = ({ children }: { children: ReactNode }) => <TasksProvider>{children}</TasksProvider>;

const baseTask: NewTask = {
  title: 'Тестовая задача',
  description: 'описание',
  priority: 'Medium',
  dueDate: '2024-01-01',
  tags: ['тег'],
  category: 'Work',
};

beforeEach(() => {
  resetMockTasks();
});

describe('TasksContext', () => {
  it('добавляет задачу со сгенерированным id и статусом Pending по умолчанию', async () => {
    const { result } = renderHook(() => useTasks(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addTask(baseTask);
    });

    expect(result.current.tasks).toHaveLength(1);
    const created = result.current.tasks.find((t) => t.title === 'Тестовая задача');
    expect(created).toMatchObject({ title: 'Тестовая задача', status: 'Pending' });
    expect(created?.id).toBeTruthy();
  });

  it('переключает статус задачи между Pending и Completed', async () => {
    const { result } = renderHook(() => useTasks(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let created;
    await act(async () => {
      created = await result.current.addTask(baseTask);
    });

    await act(async () => {
      await result.current.toggleTaskStatus(created!.id);
    });
    expect(result.current.tasks.find((t) => t.id === created!.id)?.status).toBe('Completed');

    await act(async () => {
      await result.current.toggleTaskStatus(created!.id);
    });
    expect(result.current.tasks.find((t) => t.id === created!.id)?.status).toBe('Pending');
  });

  it('удаляет задачу', async () => {
    const { result } = renderHook(() => useTasks(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let created;
    await act(async () => {
      created = await result.current.addTask(baseTask);
    });
    expect(result.current.tasks).toHaveLength(1);

    await act(async () => {
      await result.current.deleteTask(created!.id);
    });
    expect(result.current.tasks).toHaveLength(0);
    expect(result.current.tasks.find((t) => t.id === created!.id)).toBeUndefined();
  });

  it('загружает существующие задачи пользователя при монтировании', async () => {
    resetMockTasks([
      {
        user_id: 'test-user-id',
        title: 'Уже существующая задача',
        description: '',
        priority: 'Low',
        status: 'Pending',
        due_date: '2024-01-01',
        tags: [],
        category: 'Personal',
        time: null,
      },
    ]);

    const { result } = renderHook(() => useTasks(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].title).toBe('Уже существующая задача');
  });
});
