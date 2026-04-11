import React from 'react';
import { ChevronLeft, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

export default function Calendar() {
  const [currentDate, setCurrentDate] = React.useState(new Date(2024, 9, 9)); // October 2024 as in screenshot

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="font-headline font-extrabold text-5xl text-on-surface tracking-tight mb-2">
            {format(currentDate, 'MMMM yyyy')}
          </h1>
          <p className="text-on-surface-variant font-medium text-lg">Your focus for today is curated.</p>
        </div>
        <div className="flex gap-2 mb-2">
          <button 
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container-highest transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
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
            {daysOfWeek.map(day => (
              <div key={day} className="text-[10px] font-bold uppercase tracking-widest text-outline">
                {day}
              </div>
            ))}
            {calendarDays.map((day, idx) => {
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isToday = isSameDay(day, currentDate);
              const hasEvent = [2, 4, 8, 10, 13, 15, 18].includes(day.getDate()) && isCurrentMonth;
              
              return (
                <div 
                  key={idx} 
                  className={cn(
                    "h-16 flex flex-col items-center justify-center font-headline font-bold text-lg rounded-2xl cursor-pointer transition-all relative",
                    !isCurrentMonth && "text-outline-variant/40",
                    isToday && "bg-primary text-white shadow-xl shadow-primary/20",
                    !isToday && isCurrentMonth && "hover:bg-surface-container-low"
                  )}
                >
                  {format(day, 'd')}
                  {hasEvent && !isToday && (
                    <span className={cn(
                      "absolute bottom-2 w-1.5 h-1.5 rounded-full",
                      day.getDate() % 3 === 0 ? "bg-primary" : 
                      day.getDate() % 5 === 0 ? "bg-tertiary-container" : "bg-error-container"
                    )} />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-6 pt-8 border-t border-surface-container-highest/30">
            <LegendItem color="bg-primary" label="Projects" />
            <LegendItem color="bg-tertiary-container" label="Personal" />
            <LegendItem color="bg-error-container" label="Deadlines" />
          </div>
        </div>

        {/* Today's Agenda */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex justify-between items-center px-2">
            <h2 className="font-headline font-bold text-xl">Today's Agenda</h2>
            <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded-full uppercase">3 TASKS</span>
          </div>
          
          <div className="space-y-4">
            <AgendaItem 
              title="Architectural Review" 
              description="Final walkthrough of the new design system implementation with the dev team."
              time="09:00 — 10:30 AM"
              priority="High"
            />
            <AgendaItem 
              title="Stakeholder Sync" 
              description="Monthly performance overview and roadmap prioritization for Q4."
              time="02:00 — 03:00 PM"
              priority="Project"
            />
            <AgendaItem 
              title="Inbox Zero Session" 
              time="08:00 AM"
              completed
            />
          </div>

          <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: any) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn("w-2.5 h-2.5 rounded-full", color)}></span>
      <span className="text-[10px] font-bold text-outline uppercase tracking-wider">{label}</span>
    </div>
  );
}

function AgendaItem({ title, description, time, priority, completed }: any) {
  return (
    <div className={cn(
      "p-6 bg-surface-container-low rounded-[1.5rem] transition-all hover:bg-surface-container-lowest group cursor-pointer",
      completed && "opacity-60 grayscale"
    )}>
      <div className="flex justify-between items-start mb-4">
        {completed ? (
          <CheckCircle2 className="text-tertiary-container" size={20} />
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-outline group-hover:border-primary transition-colors" />
        )}
        {priority && (
          <div className={cn(
            "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter",
            priority === 'High' ? "bg-error-container text-on-error-container" : "bg-primary-container text-on-primary"
          )}>
            {priority}
          </div>
        )}
        {completed && (
          <div className="px-2 py-0.5 rounded-full bg-tertiary-container text-on-tertiary-container text-[9px] font-bold uppercase tracking-tighter">
            Done
          </div>
        )}
      </div>
      <h3 className={cn("font-headline font-bold text-lg mb-1", completed && "line-through")}>{title}</h3>
      {description && <p className="text-on-surface-variant text-xs mb-4 leading-relaxed line-clamp-2">{description}</p>}
      <div className="flex items-center gap-2 text-outline">
        <Clock size={14} />
        <span className="text-[10px] font-bold uppercase tracking-wider">{time}</span>
      </div>
    </div>
  );
}
