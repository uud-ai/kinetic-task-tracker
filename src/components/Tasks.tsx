import React from 'react';
import { Search, MoreVertical, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Priority, Status } from '@/src/types';

export default function Tasks() {
  const filters = ['All', 'Today', 'Important', 'Projects'];
  const [activeFilter, setActiveFilter] = React.useState('All');

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
          />
        </div>
      </section>

      <nav className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {filters.map((filter) => (
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
        <TaskItem 
          priority="High"
          due="Due in 2h"
          title="Refactor the Design System Documentation"
          description="Ensure all tokens map correctly to the new Tailwind configuration and update the accessibility guidelines for ghost borders."
          tags={['Engineering', 'Design']}
        />
        <TaskItem 
          priority="Medium"
          due="Tomorrow"
          title="Weekly Synchronized Review"
          description="Gather metrics from the last sprint and prepare the deck for the Friday stakeholder presentation."
          tags={['Management']}
        />
        <TaskItem 
          status="Completed"
          title="Audit Color Contrast"
          description="Run WCAG 2.1 compliance check on the new Indigo palette variants."
          tags={['Design']}
        />
        <TaskItem 
          priority="Low"
          due="Next Week"
          title="Update Asset Library"
          description="Prune unused icons and export latest SVG set for the development team."
          tags={['Assets']}
        />
      </div>
    </div>
  );
}

function TaskItem({ priority, due, title, description, tags, status = 'Pending' }: any) {
  const isCompleted = status === 'Completed';

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "group relative bg-surface-container-lowest rounded-xl p-6 transition-all duration-300 hover:shadow-[0px_24px_48px_rgba(26,27,36,0.06)] flex items-start gap-5",
        isCompleted && "opacity-60 bg-surface-container-low/50"
      )}
    >
      <div className="mt-1">
        <button className={cn(
          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
          isCompleted 
            ? "bg-tertiary-container border-tertiary-container text-on-tertiary-container" 
            : "border-outline group-hover:border-primary"
        )}>
          {isCompleted && <Check size={14} strokeWidth={3} />}
        </button>
      </div>
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          {priority && (
            <span className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
              priority === 'High' ? "bg-error-container text-on-error-container" :
              priority === 'Medium' ? "bg-secondary-container text-on-secondary-container" :
              "bg-surface-container-highest text-on-surface-variant"
            )}>
              {priority} Priority
            </span>
          )}
          {isCompleted && (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-tertiary-container text-on-tertiary-container">
              Completed
            </span>
          )}
          {due && <span className="text-[11px] text-on-surface-variant font-medium">{due}</span>}
        </div>
        <h3 className={cn("text-xl font-bold text-on-surface mb-2", isCompleted && "line-through")}>{title}</h3>
        <p className={cn("text-on-surface-variant text-sm mb-4 leading-relaxed max-w-2xl", isCompleted && "line-through")}>
          {description}
        </p>
        <div className="flex gap-2">
          {tags.map((tag: string) => (
            <span key={tag} className="px-2.5 py-1 rounded-md bg-surface-container-low text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">
              #{tag}
            </span>
          ))}
        </div>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-2 text-outline hover:text-on-surface">
          <MoreVertical size={20} />
        </button>
      </div>
    </motion.div>
  );
}
