import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import CreateTask from './CreateTask';
import { TasksProvider } from '@/src/context/TasksContext';
import { resetMockTasks } from '@/src/test/supabaseMock';

vi.mock('@/src/lib/supabase', () => import('@/src/test/supabaseMock'));
vi.mock('@/src/context/AuthContext', () => import('@/src/test/authMock'));

beforeEach(() => {
  resetMockTasks();
});

function renderCreateTask(onCreated = vi.fn()) {
  render(
    <TasksProvider>
      <CreateTask onCreated={onCreated} />
    </TasksProvider>
  );
  return onCreated;
}

describe('Создание задачи', () => {
  it('показывает ошибку валидации при пустом названии', async () => {
    renderCreateTask();
    await act(async () => {});
    fireEvent.click(screen.getByText('Создать задачу'));
    expect(screen.getByText('Дайте задаче название.')).toBeInTheDocument();
  });

  it('создаёт задачу и вызывает onCreated при заполненном названии', async () => {
    const onCreated = vi.fn();
    renderCreateTask(onCreated);

    fireEvent.change(screen.getByPlaceholderText('Что нужно сделать?'), {
      target: { value: 'Написать тесты' },
    });
    fireEvent.click(screen.getByText('Создать задачу'));

    await waitFor(() => expect(onCreated).toHaveBeenCalledTimes(1));
    expect(onCreated.mock.calls[0][0]).toMatchObject({ title: 'Написать тесты', status: 'Pending' });
  });

  it('очищает поле названия после успешного создания', async () => {
    renderCreateTask();

    const titleInput = screen.getByPlaceholderText('Что нужно сделать?') as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: 'Ещё одна задача' } });
    fireEvent.click(screen.getByText('Создать задачу'));

    await waitFor(() => expect(titleInput.value).toBe(''));
  });
});
