import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CreateTask from './CreateTask';
import { TasksProvider } from '@/src/context/TasksContext';

beforeEach(() => {
  localStorage.clear();
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
  it('показывает ошибку валидации при пустом названии', () => {
    renderCreateTask();
    fireEvent.click(screen.getByText('Создать задачу'));
    expect(screen.getByText('Дайте задаче название перед созданием.')).toBeInTheDocument();
  });

  it('создаёт задачу и вызывает onCreated при заполненном названии', () => {
    const onCreated = vi.fn();
    renderCreateTask(onCreated);

    fireEvent.change(screen.getByPlaceholderText('Что нужно сделать?'), {
      target: { value: 'Написать тесты' },
    });
    fireEvent.click(screen.getByText('Создать задачу'));

    expect(onCreated).toHaveBeenCalledTimes(1);
    expect(onCreated.mock.calls[0][0]).toMatchObject({ title: 'Написать тесты', status: 'Pending' });
  });

  it('очищает поле названия после успешного создания', () => {
    renderCreateTask();

    const titleInput = screen.getByPlaceholderText('Что нужно сделать?') as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: 'Ещё одна задача' } });
    fireEvent.click(screen.getByText('Создать задачу'));

    expect(titleInput.value).toBe('');
  });
});
