import React from 'react';
import { motion } from 'motion/react';
import { LogIn, UserPlus, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { getAuthErrorMessage } from '@/src/lib/labels';
import { seedInitialTasks } from '@/src/context/TasksContext';

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = React.useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [info, setInfo] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!email.trim() || !password) {
      setError('Заполните email и пароль.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'signUp') {
        const { user, sessionActive } = await signUp(email.trim(), password);
        if (sessionActive) {
          await seedInitialTasks(user.id);
        } else {
          setInfo('Проверьте почту — мы отправили письмо для подтверждения email. Стартовые задачи появятся после первого входа.');
        }
      } else {
        await signIn(email.trim(), password);
      }
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-10"
      >
        <header className="text-center space-y-3">
          <h1 className="font-headline font-extrabold text-3xl text-primary tracking-tight">
            Кинетическое пространство
          </h1>
          <p className="text-on-surface-variant">
            {mode === 'signIn' ? 'Войдите, чтобы синхронизировать задачи между устройствами' : 'Создайте аккаунт для синхронизации задач'}
          </p>
        </header>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
                <Mail size={18} />
              </div>
              <input
                className="w-full bg-surface-container-low border-none rounded-xl py-4 pl-12 pr-4 text-on-surface focus:ring-2 focus:ring-primary/10 focus:bg-surface-container-lowest transition-all font-medium"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Пароль</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
                <Lock size={18} />
              </div>
              <input
                className="w-full bg-surface-container-low border-none rounded-xl py-4 pl-12 pr-4 text-on-surface focus:ring-2 focus:ring-primary/10 focus:bg-surface-container-lowest transition-all font-medium"
                type="password"
                autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
                placeholder="Не менее 6 символов"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-on-error-container text-sm font-medium ml-1">{error}</p>}
          {info && <p className="text-primary text-sm font-medium ml-1">{info}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all duration-200 text-lg flex items-center justify-center gap-3 disabled:opacity-60 disabled:pointer-events-none"
          >
            {mode === 'signIn' ? <LogIn size={22} /> : <UserPlus size={22} />}
            {submitting ? 'Подождите…' : mode === 'signIn' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className="text-center text-sm text-on-surface-variant">
          {mode === 'signIn' ? 'Ещё нет аккаунта? ' : 'Уже есть аккаунт? '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signIn' ? 'signUp' : 'signIn');
              setError('');
              setInfo('');
            }}
            className="text-primary font-bold hover:underline"
          >
            {mode === 'signIn' ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
