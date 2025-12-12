import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { SubmissionForm } from './components/SubmissionForm';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { AppView } from './types';
import { subscribeToAuth, logoutAdmin } from './services/firebase';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.SUBMIT);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      if (user) {
        setIsLoggedIn(true);
        // Optional: Auto-navigate to dashboard if on login page?
        // But let's respect currentView logic or update it.
        // If user is logged in and on LOGIN view, go to DASHBOARD.
        // We can't easily access 'currentView' inside this closure without ref refactoring or dependency,
        // but setState callback works.
        // Let's just set logged in. The user can navigate or we can force it.
      } else {
        setIsLoggedIn(false);
        // If on dashboard, should probably go to login or submit?
        // Let's handle this in the render/navigate logic or another effect.
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = () => {
    // Auth listener handles state, but it is async.
    // Optimistically set logged in to avoid flash of empty dashboard
    setIsLoggedIn(true);
    setCurrentView(AppView.DASHBOARD);
  };

  const handleLogout = () => {
    logoutAdmin();
    // Auth listener will handle setIsLoggedIn(false)
    setCurrentView(AppView.LOGIN);
  };

  const navigate = (view: AppView) => {
    if (view === AppView.DASHBOARD && !isLoggedIn) {
      setCurrentView(AppView.LOGIN);
    } else {
      setCurrentView(view);
    }
  };

  return (
    <Layout
      currentView={currentView}
      onNavigate={navigate}
      isLoggedIn={isLoggedIn}
      onLogout={handleLogout}
    >
      {currentView === AppView.SUBMIT && <SubmissionForm />}
      {currentView === AppView.LOGIN && <Login onLoginSuccess={handleLoginSuccess} />}
      {currentView === AppView.DASHBOARD && (
        isLoggedIn ? <Dashboard /> : (
          <div className="flex h-[50vh] w-full items-center justify-center">
            <span className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></span>
          </div>
        )
      )}
    </Layout>
  );
};

export default App;
