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
import { Screen } from './types';
import { TasksProvider } from './context/TasksContext';

export default function App() {
  const [currentScreen, setCurrentScreen] = React.useState<Screen>('dashboard');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <Dashboard onScreenChange={setCurrentScreen} />;
      case 'tasks':
        return <Tasks />;
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
      <Layout currentScreen={currentScreen} onScreenChange={setCurrentScreen}>
        {renderScreen()}
      </Layout>
    </TasksProvider>
  );
}
