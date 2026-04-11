import React from 'react';
import { LayoutDashboard, ListTodo, PlusCircle, Calendar as CalendarIcon, Search } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Screen } from '@/src/types';

interface LayoutProps {
  children: React.ReactNode;
  currentScreen: Screen;
  onScreenChange: (screen: Screen) => void;
}

export default function Layout({ children, currentScreen, onScreenChange }: LayoutProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: ListTodo },
    { id: 'create', label: 'Create', icon: PlusCircle },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
  ] as const;

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass shadow-sm flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md overflow-hidden bg-surface-container-highest">
            <img 
              src="https://picsum.photos/seed/curator/100/100" 
              alt="User" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-xl font-extrabold text-primary tracking-tighter font-headline">
            The Kinetic Workspace
          </h1>
        </div>
        <button className="p-2 text-outline hover:bg-surface-container-low rounded-full transition-colors">
          <Search size={20} />
        </button>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-6 max-w-5xl mx-auto">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-3 bg-white/90 backdrop-blur-2xl rounded-t-[2rem] shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onScreenChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center p-2 transition-all duration-300 active:scale-90",
                isActive 
                  ? "text-primary bg-primary/5 rounded-2xl px-5" 
                  : "text-outline hover:text-primary"
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold uppercase tracking-widest mt-1.5">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
