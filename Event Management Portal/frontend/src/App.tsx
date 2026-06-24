import React, { useState } from 'react';
import { NGOProvider, useNGO } from './context/NGOContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Volunteers } from './pages/Volunteers';
import { Events } from './pages/Events';
import { Login } from './pages/Login';

const AppContent: React.FC = () => {
  const { currentUser } = useNGO();
  const [activePage, setActivePage] = useState<string>(() => {
    return localStorage.getItem('ngo_session') ? 'dashboard' : 'login';
  });

  // If session is deleted, fallback to login page
  const resolvedPage = currentUser ? activePage : 'login';

  const renderActivePage = () => {
    switch (resolvedPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'volunteers':
        return <Volunteers />;
      case 'events':
        return <Events />;
      case 'login':
      default:
        return <Login onLoginSuccess={setActivePage} />;
    }
  };

  const getPageInfo = () => {
    switch (resolvedPage) {
      case 'dashboard':
        return {
          title: 'Impact Dashboard',
          description: 'Key performance metrics, activity reports, and live registrations feed.'
        };
      case 'volunteers':
        return {
          title: 'Volunteer Registry',
          description: 'Manage active volunteer profiles, search qualifications, and export CSV lists.'
        };
      case 'events':
        return {
          title: 'Campaign Events & Activities',
          description: 'Browse scheduled NGO events, manage rosters, update status, and track enrollment capacities.'
        };
      case 'login':
      default:
        return {
          title: 'Portal Authentication',
          description: 'Login as Administrator or select a Volunteer profile to test registration features.'
        };
    }
  };

  const pageInfo = getPageInfo();

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center">
        <Login onLoginSuccess={setActivePage} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-950">
      <Sidebar activePage={resolvedPage} setActivePage={setActivePage} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={pageInfo.title} description={pageInfo.description} />
        <main className="flex-1 overflow-y-auto">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <NGOProvider>
      <AppContent />
    </NGOProvider>
  );
};

export default App;
