import React from 'react';
import { motion } from 'motion/react';
import { KeyRound, Lock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { getAuthErrorMessage } from '@/src/lib/labels';

export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Пароль должен содержать не менее 6 символов.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Пароли не совпадают.');
      return;
    }

    setSubmitting(true);
    try {
      await updatePassword(password);
      setSuccess(true);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-10">
        <header className="text-center space-y-3">
          <h1 className="font-headline font-extrabold text-3xl text-primary tracking-tight">Новый пароль</h1>
          <p className="text-on-surface-variant">Придумайте новый пароль для входа в аккаунт</p>
        </header>

        {success ? (
          <div className="flex flex-col items-center gap-4 text-center bg-tertiary-container text-on-tertiary-container rounded-xl p-8">
            <CheckCircle2 size={40} />
            <p className="font-semibold">Пароль обновлён. Продолжаем работу с приложением…</p>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                Новый пароль
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
                  <Lock size={18} />
                </div>
                <input
                  className="w-full bg-surface-container-low border-none rounded-xl py-4 pl-12 pr-4 text-on-surface focus:ring-2 focus:ring-primary/10 focus:bg-surface-container-lowest transition-all font-medium"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Не менее 6 символов"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                Повторите пароль
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
                  <Lock size={18} />
                </div>
                <input
                  className="w-full bg-surface-container-low border-none rounded-xl py-4 pl-12 pr-4 text-on-surface focus:ring-2 focus:ring-primary/10 focus:bg-surface-container-lowest transition-all font-medium"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Ещё раз"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {error && <p className="text-on-error-container text-sm font-medium ml-1">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all duration-200 text-lg flex items-center justify-center gap-3 disabled:opacity-60 disabled:pointer-events-none"
            >
              <KeyRound size={22} />
              {submitting ? 'Сохраняем…' : 'Сохранить пароль'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
