/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Tasks from './components/Tasks';
import CreateTask from './components/CreateTask';
import Calendar from './components/Calendar';
import Login from './components/Login';
import ResetPassword from './components/ResetPassword';
import { Screen } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TasksProvider } from './context/TasksContext';

function AuthenticatedApp() {
  const [currentScreen, setCurrentScreen] = React.useState<Screen>('dashboard');
  const [focusSearchToken, setFocusSearchToken] = React.useState(0);

  const goToTasksAndFocusSearch = () => {
    setCurrentScreen('tasks');
    setFocusSearchToken((n) => n + 1);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <Dashboard onScreenChange={setCurrentScreen} />;
      case 'tasks':
        return <Tasks focusSearchToken={focusSearchToken} />;
      case 'create':
        return <CreateTask onCreated={() => setCurrentScreen('tasks')} />;
      case 'calendar':
        return <Calendar onScreenChange={setCurrentScreen} />;
      default:
        return <Dashboard onScreenChange={setCurrentScreen} />;
    }
  };

  return (
    <TasksProvider>
      <Layout currentScreen={currentScreen} onScreenChange={setCurrentScreen} onSearchClick={goToTasksAndFocusSearch}>
        {renderScreen()}
      </Layout>
    </TasksProvider>
  );
}

function Gate() {
  const { user, initializing, passwordRecovery } = useAuth();

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center text-on-surface-variant font-medium">Загрузка…</div>
    );
  }

  if (passwordRecovery) {
    return <ResetPassword />;
  }

  return user ? <AuthenticatedApp /> : <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
