import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { TasksProvider, useTasks, NewTask } from './TasksContext';

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
  localStorage.clear();
});

describe('TasksContext', () => {
  it('добавляет задачу со сгенерированным id и статусом Pending по умолчанию', () => {
    const { result } = renderHook(() => useTasks(), { wrapper });
    const before = result.current.tasks.length;

    act(() => {
      result.current.addTask(baseTask);
    });

    expect(result.current.tasks).toHaveLength(before + 1);
    const created = result.current.tasks.find((t) => t.title === 'Тестовая задача');
    expect(created).toMatchObject({ title: 'Тестовая задача', status: 'Pending' });
    expect(created?.id).toBeTruthy();
  });

  it('переключает статус задачи между Pending и Completed', () => {
    const { result } = renderHook(() => useTasks(), { wrapper });

    let created;
    act(() => {
      created = result.current.addTask(baseTask);
    });

    act(() => {
      result.current.toggleTaskStatus(created!.id);
    });
    expect(result.current.tasks.find((t) => t.id === created!.id)?.status).toBe('Completed');

    act(() => {
      result.current.toggleTaskStatus(created!.id);
    });
    expect(result.current.tasks.find((t) => t.id === created!.id)?.status).toBe('Pending');
  });

  it('удаляет задачу', () => {
    const { result } = renderHook(() => useTasks(), { wrapper });
    const before = result.current.tasks.length;

    let created;
    act(() => {
      created = result.current.addTask(baseTask);
    });
    expect(result.current.tasks).toHaveLength(before + 1);

    act(() => {
      result.current.deleteTask(created!.id);
    });
    expect(result.current.tasks).toHaveLength(before);
    expect(result.current.tasks.find((t) => t.id === created!.id)).toBeUndefined();
  });

  it('сохраняет задачи в localStorage', () => {
    const { result } = renderHook(() => useTasks(), { wrapper });

    let created;
    act(() => {
      created = result.current.addTask(baseTask);
    });

    const stored = JSON.parse(localStorage.getItem('kinetic-tasks') ?? '[]');
    const persisted = stored.find((t: { id: string }) => t.id === created!.id);
    expect(persisted).toBeTruthy();
    expect(persisted.title).toBe('Тестовая задача');
  });
});
