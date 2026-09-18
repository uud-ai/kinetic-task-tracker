import { motion } from 'motion/react';
import { PlusCircle } from 'lucide-react';
import { Task } from '@/src/types';
import { useTasks } from '@/src/context/TasksContext';
import TaskForm from './TaskForm';

interface CreateTaskProps {
  onCreated?: (task: Task) => void;
}

export default function CreateTask({ onCreated }: CreateTaskProps) {
  const { addTask } = useTasks();

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

      <TaskForm
        submitLabel="Создать задачу"
        submitIcon={<PlusCircle size={24} />}
        resetOnSuccess
        onSubmit={async (values) => {
          const task = await addTask(values);
          onCreated?.(task);
        }}
      />
    </motion.div>
  );
}
