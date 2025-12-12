import React from 'react';
import { AppView } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  isLoggedIn: boolean;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  onNavigate,
  isLoggedIn,
  onLogout
}) => {
  return (
    <div className="min-h-screen font-sans selection:bg-violet-500/30 selection:text-white flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-zinc-800 bg-zinc-950/70 backdrop-blur-xl supports-[backdrop-filter]:bg-zinc-950/50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onNavigate(AppView.SUBMIT)}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-violet-900/30 group-hover:scale-105 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight text-white group-hover:text-violet-200 transition-colors">AnonBox</span>
          </div>

          <nav className="flex items-center gap-6">
            {currentView !== AppView.SUBMIT && (
              <button 
                onClick={() => onNavigate(AppView.SUBMIT)}
                className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
              >
                Submit
              </button>
            )}
            
            {isLoggedIn ? (
               <div className="flex items-center gap-4">
                 <button 
                  onClick={() => onNavigate(AppView.DASHBOARD)}
                  className={`text-sm font-medium transition-colors ${currentView === AppView.DASHBOARD ? 'text-violet-400' : 'text-zinc-300 hover:text-white'}`}
                >
                  Dashboard
                </button>
                <button 
                  onClick={onLogout}
                  className="text-sm px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 transition-all font-medium"
                >
                  Logout
                </button>
               </div>
            ) : (
              currentView !== AppView.LOGIN && (
                <button 
                  onClick={() => onNavigate(AppView.LOGIN)}
                  className="text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Admin
                </button>
              )
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-28 px-4 sm:px-6 pb-20 max-w-5xl mx-auto w-full">
        {children}
      </main>
      
      {/* Simple Footer */}
      <footer className="py-6 w-full text-center border-t border-zinc-900/50 mt-auto">
         <p className="text-sm text-zinc-500 font-medium">AnonBox Secure System v1.0 &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};