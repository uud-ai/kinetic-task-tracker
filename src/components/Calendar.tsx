import React from 'react';
import { ChevronLeft, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { Task, Screen } from '@/src/types';
import { useTasks } from '@/src/context/TasksContext';
import { CATEGORY_LABELS, PRIORITY_LABELS, STATUS_LABELS, pluralizeTasks } from '@/src/lib/labels';

interface CalendarProps {
  onScreenChange?: (screen: Screen) => void;
}

const CATEGORY_DOT: Record<Task['category'], string> = {
  Work: 'bg-primary',
  Personal: 'bg-tertiary-container',
  Health: 'bg-error-container',
};

export default function Calendar({ onScreenChange }: CalendarProps) {
  const { tasks, toggleTaskStatus } = useTasks();
  const today = new Date();
  const [currentDate, setCurrentDate] = React.useState(today);
  const [selectedDate, setSelectedDate] = React.useState(today);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const tasksByDay = (day: Date) => tasks.filter((t) => isSameDay(new Date(`${t.dueDate}T00:00:00`), day));

  const agenda = tasksByDay(selectedDate).sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''));

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="font-headline font-extrabold text-5xl text-on-surface tracking-tight mb-2">
            {format(currentDate, 'LLLL yyyy', { locale: ru })}
          </h1>
          <p className="text-on-surface-variant font-medium text-lg">
            {isSameDay(selectedDate, today)
              ? 'Ваш фокус на сегодня продуман.'
              : `Просмотр даты ${format(selectedDate, 'd MMMM', { locale: ru })}.`}
          </p>
        </div>
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            aria-label="Предыдущий месяц"
            className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container-highest transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            aria-label="Следующий месяц"
            className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container-highest transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Monthly View */}
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-[2rem] p-8 shadow-sm">
          <div className="grid grid-cols-7 gap-4 text-center mb-8">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-[10px] font-bold uppercase tracking-widest text-outline">
                {day}
              </div>
            ))}
            {calendarDays.map((day, idx) => {
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isToday = isSameDay(day, today);
              const isSelected = isSameDay(day, selectedDate);
              const dayTasks = tasksByDay(day);
              const dotCategory = dayTasks[0]?.category;

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    'h-16 flex flex-col items-center justify-center font-headline font-bold text-lg rounded-2xl cursor-pointer transition-all relative',
                    !isCurrentMonth && 'text-outline-variant/40',
                    isToday && !isSelected && 'ring-2 ring-primary text-primary',
                    isSelected && 'bg-primary text-white shadow-xl shadow-primary/20',
                    !isSelected && isCurrentMonth && 'hover:bg-surface-container-low'
                  )}
                >
                  {format(day, 'd')}
                  {dayTasks.length > 0 && !isSelected && dotCategory && (
                    <span className={cn('absolute bottom-2 w-1.5 h-1.5 rounded-full', CATEGORY_DOT[dotCategory])} />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-6 pt-8 border-t border-surface-container-highest/30">
            <LegendItem color="bg-primary" label={CATEGORY_LABELS.Work} />
            <LegendItem color="bg-tertiary-container" label={CATEGORY_LABELS.Personal} />
            <LegendItem color="bg-error-container" label={CATEGORY_LABELS.Health} />
          </div>
        </div>

        {/* Agenda */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex justify-between items-center px-2">
            <h2 className="font-headline font-bold text-xl">
              {isSameDay(selectedDate, today)
                ? 'Повестка на сегодня'
                : `Повестка на ${format(selectedDate, 'd MMM', { locale: ru })}`}
            </h2>
            <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded-full uppercase">
              {agenda.length} {pluralizeTasks(agenda.length)}
            </span>
          </div>

          <div className="space-y-4">
            {agenda.length === 0 && (
              <p className="text-on-surface-variant text-sm px-2">На этот день ничего не запланировано.</p>
            )}
            {agenda.map((task) => (
              <AgendaItem key={task.id} task={task} onToggle={toggleTaskStatus} />
            ))}
          </div>

          <button
            onClick={() => onScreenChange?.('create')}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Создать задачу
          </button>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn('w-2.5 h-2.5 rounded-full', color)}></span>
      <span className="text-[10px] font-bold text-outline uppercase tracking-wider">{label}</span>
    </div>
  );
}

function AgendaItem({ task, onToggle }: { task: Task; onToggle: (id: string) => void }) {
  const completed = task.status === 'Completed';
  return (
    <div
      className={cn(
        'p-6 bg-surface-container-low rounded-[1.5rem] transition-all hover:bg-surface-container-lowest group cursor-pointer',
        completed && 'opacity-60 grayscale'
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <button
          onClick={() => onToggle(task.id)}
          aria-label={completed ? 'Отметить как ожидающую' : 'Отметить как выполненную'}
        >
          {completed ? (
            <CheckCircle2 className="text-tertiary-container" size={20} />
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-outline group-hover:border-primary transition-colors" />
          )}
        </button>
        {!completed && (
          <div
            className={cn(
              'px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter',
              task.priority === 'High'
                ? 'bg-error-container text-on-error-container'
                : 'bg-primary-container text-on-primary'
            )}
          >
            {PRIORITY_LABELS[task.priority]}
          </div>
        )}
        {completed && (
          <div className="px-2 py-0.5 rounded-full bg-tertiary-container text-on-tertiary-container text-[9px] font-bold uppercase tracking-tighter">
            {STATUS_LABELS.Completed}
          </div>
        )}
      </div>
      <h3 className={cn('font-headline font-bold text-lg mb-1', completed && 'line-through')}>{task.title}</h3>
      {task.description && (
        <p className="text-on-surface-variant text-xs mb-4 leading-relaxed line-clamp-2">{task.description}</p>
      )}
      {task.time && (
        <div className="flex items-center gap-2 text-outline">
          <Clock size={14} />
          <span className="text-[10px] font-bold uppercase tracking-wider">{task.time}</span>
        </div>
      )}
    </div>
  );
}
