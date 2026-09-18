import React from 'react';
import { CheckCircle2, Clock, Bolt, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Task, Screen } from '@/src/types';
import { useTasks } from '@/src/context/TasksContext';
import { isToday, parseISO, compareAsc } from 'date-fns';

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
    if (hour < 12) return 'Morning, Curator.';
    if (hour < 18) return 'Afternoon, Curator.';
    return 'Evening, Curator.';
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
          Your workspace is harmonized. {pendingToday.length} task{pendingToday.length === 1 ? '' : 's'} remain for today.
        </motion.p>
      </section>

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Completed"
          value={String(completed.length).padStart(2, '0')}
          total={`/${tasks.length}`}
          icon={<CheckCircle2 className="text-tertiary-container" />}
          className="bg-surface-container-lowest"
        />
        <StatCard
          label="In Progress"
          value={String(inProgress.length).padStart(2, '0')}
          total="active"
          icon={<Clock className="text-white" />}
          className="bg-primary text-white"
          dark
        />
        <StatCard
          label="Today's Focus"
          icon={<Bolt className="text-primary" />}
          className="bg-surface-container-highest"
        >
          <div className="w-full bg-surface-container-low h-2 rounded-full mb-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${velocity}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="bg-primary h-full"
            />
          </div>
          <span className="text-on-surface font-semibold text-sm">{velocity}% of Daily Velocity</span>
        </StatCard>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Deadlines */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="font-headline font-bold text-2xl text-on-surface">Immediate Deadlines</h3>
            <button
              onClick={() => onScreenChange?.('tasks')}
              className="text-primary font-bold text-sm hover:underline flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-4">
            {upcoming.length === 0 && (
              <p className="text-on-surface-variant text-sm">Nothing on the horizon — enjoy the calm.</p>
            )}
            {upcoming.map((task) => (
              <DeadlineCard key={task.id} task={task} />
            ))}
          </div>
        </div>

        {/* Collections */}
        <div className="lg:col-span-4 space-y-8">
          <h3 className="font-headline font-bold text-2xl text-on-surface">Collections</h3>
          <div className="space-y-6">
            {collections.map((cat) => (
              <CollectionItem
                key={cat}
                label={cat}
                count={`${String(tasks.filter((t) => t.category === cat).length).padStart(2, '0')} Tasks`}
                color={CATEGORY_COLORS[cat]}
                image={CATEGORY_IMAGES[cat]}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, total, icon, className, children, dark = false }: any) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn("p-8 rounded-xl flex flex-col justify-between h-48 transition-all", className)}
    >
      <div className="flex justify-between items-start">
        <span className={cn("font-bold text-[10px] uppercase tracking-widest", dark ? "text-white/70" : "text-on-surface-variant")}>
          {label}
        </span>
        {icon}
      </div>
      {children ? children : (
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-headline font-bold">{value}</span>
          <span className={cn("font-medium text-sm", dark ? "text-white/60" : "text-on-surface-variant")}>{total}</span>
        </div>
      )}
    </motion.div>
  );
}

function DeadlineCard({ task }: { task: Task }) {
  const [time, period] = (task.time ?? '— —').split(' ');
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl flex items-center gap-6 group hover:bg-surface-container-low transition-colors">
      <div className={cn(
        "flex flex-col items-center justify-center w-14 h-14 rounded-xl shrink-0",
        task.priority === 'High' ? "bg-error-container text-on-error-container" : "bg-surface-container-highest text-on-surface-variant"
      )}>
        <span className="text-[10px] font-bold uppercase">{time}</span>
        <span className="text-lg font-bold">{period}</span>
      </div>
      <div className="flex-grow">
        <h4 className="font-bold text-lg text-on-surface">{task.title}</h4>
        <p className="text-on-surface-variant text-sm">{task.tags.join(', ') || task.category}</p>
      </div>
      {task.status === 'In Progress' && (
        <span className="bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight">
          In Progress
        </span>
      )}
    </div>
  );
}

function CollectionItem({ label, count, color, image }: any) {
  return (
    <div className="group cursor-pointer">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">
          <div className={cn("w-2 h-2 rounded-full", color)}></div>
          <span className="font-bold text-on-surface">{label}</span>
        </div>
        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{count}</span>
      </div>
      <div className="h-24 rounded-xl bg-surface-container-low overflow-hidden relative">
        <img
          src={image}
          className="w-full h-full object-cover opacity-20 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
          alt={label}
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-surface/40 to-transparent"></div>
      </div>
    </div>
  );
}
