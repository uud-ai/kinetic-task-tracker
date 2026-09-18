import { Priority, Status, Task } from '@/src/types';

export const PRIORITY_LABELS: Record<Priority, string> = {
  High: 'Высокий',
  Medium: 'Средний',
  Low: 'Низкий',
};

export const STATUS_LABELS: Record<Status, string> = {
  Completed: 'Выполнено',
  'In Progress': 'В работе',
  Pending: 'Ожидает',
};

export const CATEGORY_LABELS: Record<Task['category'], string> = {
  Work: 'Работа',
  Personal: 'Личное',
  Health: 'Здоровье',
};

export function pluralizeTasks(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod100 >= 11 && mod100 <= 14) return 'задач';
  if (mod10 === 1) return 'задача';
  if (mod10 >= 2 && mod10 <= 4) return 'задачи';
  return 'задач';
}
