import React from 'react';
import {
  LayoutDashboard,
  ListTodo,
  PlusCircle,
  Calendar as CalendarIcon,
  Search,
  Sun,
  Moon,
  LogOut,
  Loader2,
  AlertTriangle,
  WifiOff,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Screen } from '@/src/types';
import { useTheme } from '@/src/lib/useTheme';
import { useAuth } from '@/src/context/AuthContext';
import { useTasks } from '@/src/context/TasksContext';
import { useOnlineStatus } from '@/src/lib/useOnlineStatus';

interface LayoutProps {
  children: React.ReactNode;
  currentScreen: Screen;
  onScreenChange: (screen: Screen) => void;
  onSearchClick: () => void;
}

export default function Layout({ children, currentScreen, onScreenChange, onSearchClick }: LayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { loading, error, retry } = useTasks();
  const online = useOnlineStatus();
  const navItems = [
    { id: 'dashboard', label: 'Обзор', icon: LayoutDashboard },
    { id: 'tasks', label: 'Задачи', icon: ListTodo },
    { id: 'create', label: 'Создать', icon: PlusCircle },
    { id: 'calendar', label: 'Календарь', icon: CalendarIcon },
  ] as const;

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass shadow-sm flex justify-between items-center px-6 h-16">
        <button
          onClick={() => onScreenChange('dashboard')}
          aria-label="На главную"
          className="flex items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          <div className="w-10 h-10 rounded-md overflow-hidden bg-surface-container-highest">
            <img
              src="https://picsum.photos/seed/curator/100/100"
              alt="Пользователь"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-xl font-extrabold text-primary tracking-tighter font-headline">
            Кинетическое пространство
          </h1>
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
            className="p-2 text-outline hover:bg-surface-container-low rounded-full transition-colors"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={onSearchClick}
            aria-label="Поиск по задачам"
            className="p-2 text-outline hover:bg-surface-container-low rounded-full transition-colors"
          >
            <Search size={20} />
          </button>
          <button
            onClick={() => signOut()}
            aria-label={user?.email ? `Выйти из аккаунта ${user.email}` : 'Выйти из аккаунта'}
            title={user?.email ?? undefined}
            className="p-2 text-outline hover:bg-surface-container-low rounded-full transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-6 max-w-5xl mx-auto">
        {!online && (
          <div
            role="status"
            className="mb-6 rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 bg-surface-container-low text-on-surface-variant"
          >
            <WifiOff size={16} aria-hidden="true" />
            Нет подключения — показаны последние загруженные задачи. Изменения будут недоступны до восстановления сети.
          </div>
        )}
        {online && (loading || error) && (
          <div
            role="status"
            className={cn(
              'mb-6 rounded-xl px-4 py-3 text-sm font-medium flex items-center justify-between gap-3',
              error ? 'bg-error-container text-on-error-container' : 'bg-surface-container-low text-on-surface-variant'
            )}
          >
            <span className="flex items-center gap-2">
              {error ? (
                <AlertTriangle size={16} aria-hidden="true" />
              ) : (
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              )}
              {error ?? 'Синхронизация задач…'}
            </span>
            {error && (
              <button type="button" onClick={retry} className="font-bold underline shrink-0">
                Повторить
              </button>
            )}
          </div>
        )}
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-3 bg-surface-container-lowest/90 backdrop-blur-2xl rounded-t-[2rem] shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onScreenChange(item.id)}
              className={cn(
                'flex flex-col items-center justify-center p-2 transition-all duration-300 active:scale-90',
                isActive ? 'text-primary bg-primary/5 rounded-2xl px-5' : 'text-outline hover:text-primary'
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold uppercase tracking-widest mt-1.5">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
