import React from 'react';
import { CheckCircle2, Clock, Bolt, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Task, Screen } from '@/src/types';
import { useTasks } from '@/src/context/TasksContext';
import { isToday, parseISO, compareAsc } from 'date-fns';
import { CATEGORY_LABELS, STATUS_LABELS, pluralizeTasks } from '@/src/lib/labels';

interface DashboardProps {
  onScreenChange?: (screen: Screen) => void;
}

const CATEGORY_IMAGES: Record<Task['category'], string> = {
  Work: 'https://picsum.photos/seed/work/400/200',
  Personal: 'https://picsum.photos/seed/personal/400/200',
  Health: 'https://picsum.photos/seed/health/400/200',
};

const CATEGORY_COLORS: Record<Task['category'], string> = {
  Work: 'bg-primary',
  Personal: 'bg-outline',
  Health: 'bg-tertiary-container',
};

export default function Dashboard({ onScreenChange }: DashboardProps) {
  const { tasks } = useTasks();

  const completed = tasks.filter((t) => t.status === 'Completed');
  const inProgress = tasks.filter((t) => t.status === 'In Progress');
  const pendingToday = tasks.filter((t) => t.status !== 'Completed' && isToday(parseISO(t.dueDate)));

  const velocity = tasks.length === 0 ? 0 : Math.round((completed.length / tasks.length) * 100);

  const upcoming = tasks
    .filter((t) => t.status !== 'Completed')
    .sort((a, b) => compareAsc(parseISO(a.dueDate), parseISO(b.dueDate)))
    .slice(0, 3);

  const collections: Task['category'][] = ['Work', 'Personal', 'Health'];

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Доброе утро, куратор.';
    if (hour < 18) return 'Добрый день, куратор.';
    return 'Добрый вечер, куратор.';
  })();

  return (
    <div className="space-y-12">
      {/* Greeting */}
      <section>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-headline font-extrabold text-5xl tracking-tight text-on-surface mb-2"
        >
          {greeting}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-on-surface-variant font-medium text-lg"
        >
          Ваше пространство гармонизировано. На сегодня осталось {pendingToday.length}{' '}
          {pluralizeTasks(pendingToday.length)}.
        </motion.p>
      </section>

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Выполнено"
          value={String(completed.length).padStart(2, '0')}
          total={`/${tasks.length}`}
          icon={<CheckCircle2 className="text-tertiary-container" />}
          className="bg-surface-container-lowest"
        />
        <StatCard
          label="В работе"
          value={String(inProgress.length).padStart(2, '0')}
          total="активных"
          icon={<Clock className="text-white" />}
          className="bg-primary text-white"
          dark
        />
        <StatCard label="Фокус дня" icon={<Bolt className="text-primary" />} className="bg-surface-container-highest">
          <div className="w-full bg-surface-container-low h-2 rounded-full mb-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${velocity}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="bg-primary h-full"
            />
          </div>
          <span className="text-on-surface font-semibold text-sm">{velocity}% дневного темпа</span>
        </StatCard>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Deadlines */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="font-headline font-bold text-2xl text-on-surface">Ближайшие дедлайны</h3>
            <button
              onClick={() => onScreenChange?.('tasks')}
              className="text-primary font-bold text-sm hover:underline flex items-center gap-1"
            >
              Все задачи <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-4">
            {upcoming.length === 0 && (
              <p className="text-on-surface-variant text-sm">На горизонте пусто — можно выдохнуть.</p>
            )}
            {upcoming.map((task) => (
              <DeadlineCard key={task.id} task={task} />
            ))}
          </div>
        </div>

        {/* Collections */}
        <div className="lg:col-span-4 space-y-8">
          <h3 className="font-headline font-bold text-2xl text-on-surface">Коллекции</h3>
          <div className="space-y-6">
            {collections.map((cat) => {
              const count = tasks.filter((t) => t.category === cat).length;
              return (
                <CollectionItem
                  key={cat}
                  label={CATEGORY_LABELS[cat]}
                  count={`${String(count).padStart(2, '0')} ${pluralizeTasks(count)}`}
                  color={CATEGORY_COLORS[cat]}
                  image={CATEGORY_IMAGES[cat]}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value?: string;
  total?: string;
  icon: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  dark?: boolean;
}

function StatCard({ label, value, total, icon, className, children, dark = false }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn('p-8 rounded-xl flex flex-col justify-between h-48 transition-all', className)}
    >
      <div className="flex justify-between items-start">
        <span
          className={cn(
            'font-bold text-[10px] uppercase tracking-widest',
            dark ? 'text-white/70' : 'text-on-surface-variant'
          )}
        >
          {label}
        </span>
        {icon}
      </div>
      {children ? (
        children
      ) : (
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-headline font-bold">{value}</span>
          <span className={cn('font-medium text-sm', dark ? 'text-white/60' : 'text-on-surface-variant')}>{total}</span>
        </div>
      )}
    </motion.div>
  );
}

function DeadlineCard({ task }: { task: Task }) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl flex items-center gap-6 group hover:bg-surface-container-low transition-colors">
      <div
        className={cn(
          'flex flex-col items-center justify-center w-14 h-14 rounded-xl shrink-0',
          task.priority === 'High'
            ? 'bg-error-container text-on-error-container'
            : 'bg-surface-container-highest text-on-surface-variant'
        )}
      >
        <span className="text-base font-bold">{task.time ?? '—'}</span>
      </div>
      <div className="flex-grow">
        <h4 className="font-bold text-lg text-on-surface">{task.title}</h4>
        <p className="text-on-surface-variant text-sm">{task.tags.join(', ') || CATEGORY_LABELS[task.category]}</p>
      </div>
      {task.status === 'In Progress' && (
        <span className="bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight">
          {STATUS_LABELS['In Progress']}
        </span>
      )}
    </div>
  );
}

interface CollectionItemProps {
  label: string;
  count: string;
  color: string;
  image: string;
}

function CollectionItem({ label, count, color, image }: CollectionItemProps) {
  return (
    <div className="group cursor-pointer">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">
          <div className={cn('w-2 h-2 rounded-full', color)}></div>
          <span className="font-bold text-on-surface">{label}</span>
        </div>
        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{count}</span>
      </div>
      <div className="h-24 rounded-xl bg-surface-container-low overflow-hidden relative">
        <img
          src={image}
          className="w-full h-full object-cover opacity-20 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-surface/40 to-transparent"></div>
      </div>
    </div>
  );
}
