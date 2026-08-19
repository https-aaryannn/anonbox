import React from 'react';
import { Route } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: Route;
  onNavigate: (view: Route) => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  currentUserUid: string | null;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  currentView,
  onNavigate,
  isLoggedIn,
  onLogout,
  currentUserUid,
}) => {
  return (
    <div className="min-h-screen font-sans selection:bg-violet-500/30 selection:text-white flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-zinc-800 bg-zinc-950/70 backdrop-blur-xl supports-[backdrop-filter]:bg-zinc-950/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => window.location.hash = '#/'}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-violet-900/30 group-hover:scale-105 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white sm:w-20 sm:h-20">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <span className="font-bold text-lg sm:text-xl tracking-tight text-white group-hover:text-violet-200 transition-colors">AnonBox</span>
          </div>

          <nav className="flex items-center gap-2 sm:gap-6 flex-wrap justify-end">
            {currentView.name !== 'public' && (
              <button
                onClick={() => window.location.hash = '#/'}
                className="text-xs sm:text-sm font-medium text-zinc-300 hover:text-white transition-colors"
              >
                Submit
              </button>
            )}

            {isLoggedIn ? (
              <div className="flex items-center gap-2 sm:gap-4">
                {currentView.name !== 'dashboard' && (
                  <button
                    onClick={() => onNavigate({ name: 'dashboard' })}
                    className="text-xs sm:text-sm font-medium text-zinc-300 hover:text-white transition-colors hidden sm:inline"
                  >
                    Dashboard
                  </button>
                )}
                <button
                  onClick={onLogout}
                  className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 transition-all font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate({ name: 'login' })}
                className="text-xs sm:text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                {currentView.name === 'login' ? 'Already have an account?' : 'Log in / Sign up'}
              </button>
            )}
            {isLoggedIn && currentUserUid && (
              <button
                onClick={() => onNavigate({ name: 'public', ownerUid: currentUserUid })}
                className="text-xs sm:text-sm font-medium text-zinc-400 hover:text-violet-300 transition-colors hidden sm:inline whitespace-nowrap"
              >
                My page
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-24 sm:pt-28 px-4 sm:px-6 pb-16 sm:pb-20 max-w-5xl mx-auto w-full">
        {children}
      </main>

      {/* Simple Footer */}
      <footer className="py-6 w-full text-center border-t border-zinc-900/50 mt-auto">
        <p className="text-sm text-zinc-500 font-medium">AnonBox Secure System v1.0 &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};