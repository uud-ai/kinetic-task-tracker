import React from 'react';
import { Search, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Task } from '@/src/types';
import { useTasks } from '@/src/context/TasksContext';
import { format, isToday, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { PRIORITY_LABELS, STATUS_LABELS } from '@/src/lib/labels';
import EditTaskModal from './EditTaskModal';
import TaskActionsMenu from './TaskActionsMenu';

const FILTERS = [
  { id: 'all', label: 'Все' },
  { id: 'today', label: 'Сегодня' },
  { id: 'important', label: 'Важное' },
  { id: 'projects', label: 'Проекты' },
] as const;
type FilterId = (typeof FILTERS)[number]['id'];

interface TasksProps {
  focusSearchToken?: number;
}

export default function Tasks({ focusSearchToken }: TasksProps) {
  const { tasks, toggleTaskStatus, deleteTask } = useTasks();
  const [activeFilter, setActiveFilter] = React.useState<FilterId>('all');
  const [query, setQuery] = React.useState('');
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (focusSearchToken) searchInputRef.current?.focus();
  }, [focusSearchToken]);

  const filtered = tasks.filter((task) => {
    if (query && !task.title.toLowerCase().includes(query.toLowerCase())) return false;
    switch (activeFilter) {
      case 'today':
        return isToday(parseISO(task.dueDate));
      case 'important':
        return task.priority === 'High';
      case 'projects':
        return task.category === 'Work';
      default:
        return true;
    }
  });

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-8 font-headline">Задачи</h2>
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
            <Search size={20} />
          </div>
          <input
            ref={searchInputRef}
            className="w-full bg-surface-container-low border-none rounded-xl py-4 pl-12 pr-4 text-on-surface focus:ring-2 focus:ring-primary/10 focus:bg-surface-container-lowest transition-all duration-200 placeholder:text-on-surface-variant/50 font-medium"
            placeholder="Найти рабочий процесс..."
            aria-label="Поиск задач"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </section>

      <nav className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={cn(
              'px-6 py-2.5 rounded-full font-semibold text-sm transition-all active:scale-95 shrink-0',
              activeFilter === filter.id
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-highest'
            )}
          >
            {filter.label}
          </button>
        ))}
      </nav>

      <div className="space-y-6">
        <AnimatePresence initial={false}>
          {filtered.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleTaskStatus}
              onDelete={deleteTask}
              onEdit={setEditingTask}
            />
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-on-surface-variant">
            <p className="font-semibold">Здесь пока нет подходящих задач.</p>
            <p className="text-sm">Попробуйте другой фильтр или запрос.</p>
          </div>
        )}
      </div>

      {editingTask && <EditTaskModal task={editingTask} onClose={() => setEditingTask(null)} />}
    </div>
  );
}

function TaskItem({
  task,
  onToggle,
  onDelete,
  onEdit,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}) {
  const isCompleted = task.status === 'Completed';
  const due = isToday(parseISO(task.dueDate)) ? 'Сегодня' : format(parseISO(task.dueDate), 'd MMM', { locale: ru });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn(
        'group relative bg-surface-container-lowest rounded-xl p-6 transition-all duration-300 hover:shadow-[0px_24px_48px_rgba(26,27,36,0.06)] flex items-start gap-5',
        isCompleted && 'opacity-60 bg-surface-container-low/50'
      )}
    >
      <div className="mt-1">
        <button
          onClick={() => onToggle(task.id)}
          aria-label={isCompleted ? 'Отметить как ожидающую' : 'Отметить как выполненную'}
          className={cn(
            'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
            isCompleted
              ? 'bg-tertiary-container border-tertiary-container text-on-tertiary-container'
              : 'border-outline group-hover:border-primary'
          )}
        >
          {isCompleted && <Check size={14} strokeWidth={3} />}
        </button>
      </div>
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          {task.priority && !isCompleted && (
            <span
              className={cn(
                'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest',
                task.priority === 'High'
                  ? 'bg-error-container text-on-error-container'
                  : task.priority === 'Medium'
                    ? 'bg-secondary-container text-on-secondary-container'
                    : 'bg-surface-container-highest text-on-surface-variant'
              )}
            >
              {`${PRIORITY_LABELS[task.priority]} приоритет`}
            </span>
          )}
          {isCompleted && (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-tertiary-container text-on-tertiary-container">
              {STATUS_LABELS.Completed}
            </span>
          )}
          {!isCompleted && <span className="text-[11px] text-on-surface-variant font-medium">{due}</span>}
        </div>
        <h3 className={cn('text-xl font-bold text-on-surface mb-2', isCompleted && 'line-through')}>{task.title}</h3>
        {task.description && (
          <p
            className={cn(
              'text-on-surface-variant text-sm mb-4 leading-relaxed max-w-2xl',
              isCompleted && 'line-through'
            )}
          >
            {task.description}
          </p>
        )}
        <div className="flex gap-2">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-md bg-surface-container-low text-on-surface-variant text-[10px] font-bold uppercase tracking-wider"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
      <TaskActionsMenu
        className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity"
        onEdit={() => onEdit(task)}
        onDelete={() => onDelete(task.id)}
      />
    </motion.div>
  );
}
