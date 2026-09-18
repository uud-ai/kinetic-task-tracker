import React from 'react';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface TaskActionsMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

export default function TaskActionsMenu({ onEdit, onDelete, className }: TaskActionsMenuProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label="Действия с задачей"
        className="p-2 text-outline hover:text-on-surface"
      >
        <MoreVertical size={18} />
      </button>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-full mt-1 bg-surface-container-lowest shadow-lg rounded-lg overflow-hidden z-10 border border-surface-container-highest"
        >
          <button
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-container-low whitespace-nowrap w-full"
          >
            <Pencil size={14} /> Редактировать
          </button>
          <button
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-on-error-container hover:bg-error-container whitespace-nowrap w-full"
          >
            <Trash2 size={14} /> Удалить
          </button>
        </div>
      )}
    </div>
  );
}
