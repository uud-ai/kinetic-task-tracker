import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ReactNode } from 'react';
import Tasks from './Tasks';
import { TasksProvider } from '@/src/context/TasksContext';

// AnimatePresence defers unmounting until its exit animation finishes, which
// never resolves synchronously under jsdom — replace it with a pass-through
// so filtered/deleted tasks disappear from the DOM immediately in tests.
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, initial: _initial, animate: _animate, exit: _exit, transition: _transition, layout: _layout, whileHover: _whileHover, ...rest }: Record<string, unknown> & { children?: ReactNode }) => (
      <div {...rest}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

beforeEach(() => {
  localStorage.clear();
});

function renderTasks() {
  return render(
    <TasksProvider>
      <Tasks />
    </TasksProvider>
  );
}

describe('Экран задач', () => {
  it('показывает пустое состояние, когда поиск ничего не находит', () => {
    renderTasks();
    fireEvent.change(screen.getByLabelText('Поиск задач'), { target: { value: 'несуществующий-запрос-zzz' } });
    expect(screen.getByText('Здесь пока нет подходящих задач.')).toBeInTheDocument();
  });

  it('фильтр "Важное" оставляет только задачи с высоким приоритетом', () => {
    renderTasks();
    fireEvent.click(screen.getByText('Важное'));
    expect(screen.queryAllByText('Высокий приоритет').length).toBeGreaterThan(0);
    expect(screen.queryByText('Средний приоритет')).not.toBeInTheDocument();
  });

  it('отмечает задачу выполненной по клику на чекбокс', () => {
    renderTasks();
    const completedBefore = screen.getAllByLabelText('Отметить как ожидающую').length;

    fireEvent.click(screen.getAllByLabelText('Отметить как выполненную')[0]);

    expect(screen.getAllByLabelText('Отметить как ожидающую')).toHaveLength(completedBefore + 1);
  });

  it('удаляет задачу через меню действий', () => {
    renderTasks();
    const before = screen.getAllByLabelText('Действия с задачей').length;

    fireEvent.click(screen.getAllByLabelText('Действия с задачей')[0]);
    fireEvent.click(screen.getByText('Удалить'));

    expect(screen.getAllByLabelText('Действия с задачей')).toHaveLength(before - 1);
  });
});
