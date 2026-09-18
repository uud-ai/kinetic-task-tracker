import React from 'react';
import { Calendar as CalendarIcon, AlertCircle, Tag, PlusCircle, X } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Priority, Task } from '@/src/types';
import { useTasks } from '@/src/context/TasksContext';
import { format } from 'date-fns';
import { PRIORITY_LABELS, CATEGORY_LABELS } from '@/src/lib/labels';

interface CreateTaskProps {
  onCreated?: (task: Task) => void;
}

export default function CreateTask({ onCreated }: CreateTaskProps) {
  const { addTask } = useTasks();

  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [dueDate, setDueDate] = React.useState(format(new Date(), 'yyyy-MM-dd'));
  const [priority, setPriority] = React.useState<Priority>('Medium');
  const [category, setCategory] = React.useState<Task['category']>('Work');
  const [tags, setTags] = React.useState<string[]>(['дизайн', 'студия']);
  const [tagDraft, setTagDraft] = React.useState('');
  const [error, setError] = React.useState('');

  const addTag = () => {
    const value = tagDraft.trim();
    if (value && !tags.includes(value)) {
      setTags([...tags, value]);
    }
    setTagDraft('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Дайте задаче название перед созданием.');
      return;
    }

    const task = addTask({
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate,
      tags,
      category,
    });

    setTitle('');
    setDescription('');
    setDueDate(format(new Date(), 'yyyy-MM-dd'));
    setPriority('Medium');
    setCategory('Work');
    setTags(['дизайн', 'студия']);
    setError('');
    onCreated?.(task);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-12"
    >
      <header>
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-3 block">Архитектурный куратор</span>
        <h2 className="font-headline font-extrabold text-4xl lg:text-5xl text-on-surface tracking-tight leading-none mb-6">Новая задача</h2>
        <p className="text-on-surface-variant text-lg max-w-md">Превратите свои идеи в структурированное действие в вашей цифровой студии.</p>
      </header>

      <form className="space-y-8" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Название задачи</label>
          <input
            className="w-full bg-surface-container-low border-none rounded-xl px-6 py-5 text-xl font-headline font-semibold placeholder:text-outline focus:ring-2 focus:ring-primary/10 focus:bg-surface-container-lowest transition-all"
            placeholder="Что нужно сделать?"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {error && <p className="text-on-error-container text-sm font-medium ml-1">{error}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-container-low p-6 rounded-xl space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <CalendarIcon size={18} />
              <label className="text-[10px] font-bold uppercase tracking-wider">Срок выполнения</label>
            </div>
            <input
              className="w-full bg-transparent border-none p-0 text-on-surface font-medium focus:ring-0"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="bg-surface-container-low p-6 rounded-xl space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <AlertCircle size={18} />
              <label className="text-[10px] font-bold uppercase tracking-wider">Уровень приоритета</label>
            </div>
            <div className="flex gap-2">
              {(['High', 'Medium', 'Low'] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={cn(
                    "flex-1 py-2 rounded-full text-[10px] font-bold uppercase tracking-tighter transition-all",
                    priority === p
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-low"
                  )}
                >
                  {PRIORITY_LABELS[p]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <Tag size={18} />
            <label className="text-[10px] font-bold uppercase tracking-wider">Категория</label>
          </div>
          <div className="flex gap-2">
            {(['Work', 'Personal', 'Health'] as Task['category'][]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  "flex-1 py-2 rounded-full text-[10px] font-bold uppercase tracking-tighter transition-all",
                  category === c
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-low"
                )}
              >
                {CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Контекст и детали</label>
          <textarea
            className="w-full bg-surface-container-low border-none rounded-xl px-6 py-4 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/10 focus:bg-surface-container-lowest transition-all resize-none"
            placeholder="Добавьте немного архитектурной глубины к этой задаче..."
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Теги</label>
          <div className="flex flex-wrap gap-2 items-center">
            {tags.map((tag) => (
              <span key={tag} className="px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                #{tag}
                <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} aria-label={`Удалить тег ${tag}`}>
                  <X size={12} />
                </button>
              </span>
            ))}
            <input
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Тег"
              className="px-4 py-1.5 rounded-full border border-dashed border-outline-variant bg-transparent text-outline text-[10px] font-bold uppercase tracking-wider placeholder:text-outline/60 focus:outline-none focus:border-primary w-28"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-1.5 rounded-full border border-dashed border-outline-variant text-outline text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-surface-container-low transition-colors"
            >
              <PlusCircle size={12} /> Добавить тег
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold py-5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all duration-200 text-lg flex items-center justify-center gap-3"
        >
          <PlusCircle size={24} />
          Создать задачу
        </button>
      </form>
    </motion.div>
  );
}
