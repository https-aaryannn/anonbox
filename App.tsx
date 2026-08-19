import React, { useEffect, useState } from 'react';
import { Layout } from './components/Layout';
import { SubmissionForm } from './components/SubmissionForm';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { Dashboard } from './components/Dashboard';
import { PublicPage } from './components/PublicPage';
import { Route } from './types';
import { subscribeToAuth, signOutUser, auth } from './services/firebase';

export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#\/?/, '');
  if (!path) return { name: 'landing' };
  const [first, second] = path.split('/');
  if (first === 'u' && second) {
    return { name: 'public', ownerUid: decodeURIComponent(second) };
  }
  if (first === 'login') return { name: 'login' };
  if (first === 'dashboard') return { name: 'dashboard' };
  return { name: 'landing' };
}

const App: React.FC = () => {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash));
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const onHashChange = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setIsLoggedIn(!!user);
      if (user) {
        const current = parseRoute(window.location.hash);
        if (current.name === 'login') {
          setRoute({ name: 'dashboard' });
        }
      }
    });
    return () => unsubscribe;
  }, []);

  const navigate = (next: Route) => {
    let hash = '';
    if (next.name === 'login') hash = '#/login';
    else if (next.name === 'dashboard') hash = '#/dashboard';
    else if (next.name === 'public') hash = `#/u/${encodeURIComponent(next.ownerUid)}`;
    if (window.location.hash === hash) {
      setRoute(next);
    } else {
      window.location.hash = hash;
    }
  };

  const handleLogout = async () => {
    await signOutUser();
    navigate({ name: 'landing' });
  };

  let view: React.ReactNode;
  if (route.name === 'public') {
    view = <PublicPage ownerUid={route.ownerUid} />;
  } else if (route.name === 'dashboard') {
    view = isLoggedIn ? <Dashboard /> : <Login />;
  } else if (route.name === 'login') {
    view = isLoggedIn ? <Dashboard /> : <Login />;
  } else {
    // Landing page: redirect to login (no global confession box anymore)
    view = <Login />;
  }

  return (
    <Layout
      currentView={route}
      onNavigate={navigate}
      isLoggedIn={isLoggedIn}
      onLogout={handleLogout}
      currentUserUid={auth.currentUser?.uid ?? null}
    >
      {view}
      {route.name === 'login' && !isLoggedIn ? (
        <Signup />
      ) : isLoggedIn && route.name !== 'public' ? (
        <div className="mt-10 text-center">
          <a
            href={`#/u/${auth.currentUser?.uid ?? ''}`}
            className="text-sm text-zinc-500 hover:text-violet-400 transition-colors"
          >
            Your public confession page
          </a>
        </div>
      ) : null}
    </Layout>
  );
};

export default App;