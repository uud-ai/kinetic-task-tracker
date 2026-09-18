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

const AUTH_ERROR_LABELS: [match: string, label: string][] = [
  ['Invalid login credentials', 'Неверный email или пароль.'],
  ['User already registered', 'Этот email уже зарегистрирован.'],
  ['Password should be at least', 'Пароль должен содержать не менее 6 символов.'],
  ['Unable to validate email address', 'Некорректный адрес электронной почты.'],
  ['Email not confirmed', 'Подтвердите email — мы отправили письмо со ссылкой.'],
  ['rate limit', 'Слишком много попыток. Попробуйте позже.'],
];

export function getAuthErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  const match = AUTH_ERROR_LABELS.find(([needle]) => message.toLowerCase().includes(needle.toLowerCase()));
  return match?.[1] ?? 'Что-то пошло не так. Попробуйте ещё раз.';
}
