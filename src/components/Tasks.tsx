import React from 'react';
import { Search, MoreVertical, Check, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Task } from '@/src/types';
import { useTasks } from '@/src/context/TasksContext';
import { format, isToday, parseISO } from 'date-fns';

const FILTERS = ['All', 'Today', 'Important', 'Projects'] as const;
type Filter = (typeof FILTERS)[number];

export default function Tasks() {
  const { tasks, toggleTaskStatus, deleteTask } = useTasks();
  const [activeFilter, setActiveFilter] = React.useState<Filter>('All');
  const [query, setQuery] = React.useState('');

  const filtered = tasks.filter((task) => {
    if (query && !task.title.toLowerCase().includes(query.toLowerCase())) return false;
    switch (activeFilter) {
      case 'Today':
        return isToday(parseISO(task.dueDate));
      case 'Important':
        return task.priority === 'High';
      case 'Projects':
        return task.category === 'Work';
      default:
        return true;
    }
  });

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-8 font-headline">Tasks</h2>
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
            <Search size={20} />
          </div>
          <input
            className="w-full bg-surface-container-low border-none rounded-xl py-4 pl-12 pr-4 text-on-surface focus:ring-2 focus:ring-primary/10 focus:bg-surface-container-lowest transition-all duration-200 placeholder:text-on-surface-variant/50 font-medium"
            placeholder="Find a workflow..."
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </section>

      <nav className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "px-6 py-2.5 rounded-full font-semibold text-sm transition-all active:scale-95 shrink-0",
              activeFilter === filter
                ? "bg-primary text-on-primary"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-highest"
            )}
          >
            {filter}
          </button>
        ))}
      </nav>

      <div className="space-y-6">
        <AnimatePresence initial={false}>
          {filtered.map((task) => (
            <TaskItem key={task.id} task={task} onToggle={toggleTaskStatus} onDelete={deleteTask} />
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-on-surface-variant">
            <p className="font-semibold">No tasks match here yet.</p>
            <p className="text-sm">Try a different filter or search term.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TaskItem({
  task,
  onToggle,
  onDelete,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const isCompleted = task.status === 'Completed';
  const due = isToday(parseISO(task.dueDate)) ? 'Due today' : format(parseISO(task.dueDate), 'MMM d');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn(
        "group relative bg-surface-container-lowest rounded-xl p-6 transition-all duration-300 hover:shadow-[0px_24px_48px_rgba(26,27,36,0.06)] flex items-start gap-5",
        isCompleted && "opacity-60 bg-surface-container-low/50"
      )}
    >
      <div className="mt-1">
        <button
          onClick={() => onToggle(task.id)}
          aria-label={isCompleted ? 'Mark as pending' : 'Mark as completed'}
          className={cn(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
            isCompleted
              ? "bg-tertiary-container border-tertiary-container text-on-tertiary-container"
              : "border-outline group-hover:border-primary"
          )}
        >
          {isCompleted && <Check size={14} strokeWidth={3} />}
        </button>
      </div>
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          {task.priority && !isCompleted && (
            <span className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
              task.priority === 'High' ? "bg-error-container text-on-error-container" :
              task.priority === 'Medium' ? "bg-secondary-container text-on-secondary-container" :
              "bg-surface-container-highest text-on-surface-variant"
            )}>
              {task.priority} Priority
            </span>
          )}
          {isCompleted && (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-tertiary-container text-on-tertiary-container">
              Completed
            </span>
          )}
          {!isCompleted && <span className="text-[11px] text-on-surface-variant font-medium">{due}</span>}
        </div>
        <h3 className={cn("text-xl font-bold text-on-surface mb-2", isCompleted && "line-through")}>{task.title}</h3>
        {task.description && (
          <p className={cn("text-on-surface-variant text-sm mb-4 leading-relaxed max-w-2xl", isCompleted && "line-through")}>
            {task.description}
          </p>
        )}
        <div className="flex gap-2">
          {task.tags.map((tag) => (
            <span key={tag} className="px-2.5 py-1 rounded-md bg-surface-container-low text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">
              #{tag}
            </span>
          ))}
        </div>
      </div>
      <div className="relative opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Task actions"
          className="p-2 text-outline hover:text-on-surface"
        >
          <MoreVertical size={20} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 bg-surface-container-lowest shadow-lg rounded-lg overflow-hidden z-10 border border-surface-container-highest">
            <button
              onClick={() => {
                setMenuOpen(false);
                onDelete(task.id);
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-on-error-container hover:bg-error-container whitespace-nowrap"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
