import { motion, AnimatePresence } from 'motion/react';
import { X, Save } from 'lucide-react';
import { Task } from '@/src/types';
import { useTasks } from '@/src/context/TasksContext';
import TaskForm from './TaskForm';

interface EditTaskModalProps {
  task: Task;
  onClose: () => void;
}

export default function EditTaskModal({ task, onClose }: EditTaskModalProps) {
  const { updateTask } = useTasks();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-surface-container-lowest rounded-2xl p-8 space-y-8"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-headline font-extrabold text-2xl text-on-surface">Редактировать задачу</h2>
            <button
              onClick={onClose}
              aria-label="Закрыть"
              className="p-2 text-outline hover:text-on-surface hover:bg-surface-container-low rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <TaskForm
            initialValues={{
              title: task.title,
              description: task.description,
              dueDate: task.dueDate,
              priority: task.priority,
              category: task.category,
              tags: task.tags,
            }}
            submitLabel="Сохранить изменения"
            submitIcon={<Save size={22} />}
            onCancel={onClose}
            onSuccess={onClose}
            onSubmit={(values) => updateTask(task.id, values)}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
