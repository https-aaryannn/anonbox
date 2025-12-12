import React, { useState } from 'react';

import { loginAdmin } from '../services/firebase';

interface LoginProps {
    onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [detailedError, setDetailedError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await loginAdmin(email, password);
            // onLoginSuccess will be handled by App.tsx listening to auth state, 
            // but we can call it here or just let the redirect happen.
            // However, App.tsx handles state, so we might need to rely on that.
            // For now, let's keep onLoginSuccess if we want manual triggering, 
            // but usually auth state listener is better. 
            // The user code passed onLoginSuccess. Let's call it if no error.
            onLoginSuccess();
        } catch (err: any) {
            console.error(err);
            setDetailedError(JSON.stringify(err, Object.getOwnPropertyNames(err), 2));

            // Show simpler error message for common codes
            // Show simpler error message for common codes
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Invalid email or password.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Too many failed attempts. Try again later.');
            } else {
                setError(err.message || 'Login failed. Check console/API key.');
            }
            if (err.message && err.message.includes("API key")) {
                setError("Invalid API Key. Check your .env file.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-full max-w-sm bg-zinc-900/80 p-8 rounded-2xl border border-zinc-800 shadow-2xl backdrop-blur-sm">
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800 mb-4 text-violet-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Admin Access</h2>
                    <p className="text-zinc-400 text-sm mt-2">Please authenticate to continue.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-2 uppercase tracking-wider">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all"
                            placeholder="admin@anonbox.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-2 uppercase tracking-wider">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                            <p className="text-red-400 text-sm flex items-center gap-2 font-medium">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                {error}
                            </p>
                            {detailedError && (
                                <details className="mt-2">
                                    <summary className="text-xs text-red-500/70 cursor-pointer hover:text-red-400 transition-colors">Technical Details</summary>
                                    <pre className="mt-2 p-2 bg-black/30 rounded text-[10px] text-red-300 overflow-x-auto whitespace-pre-wrap">
                                        {detailedError}
                                    </pre>
                                </details>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-violet-900/20 hover:shadow-violet-900/40 flex justify-center items-center mt-2"
                    >
                        {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Secure Login'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Login Required</p>
                    <p className="text-sm font-mono text-zinc-300">
                        Use your Firebase Admin credentials
                    </p>
                </div>
            </div>
        </div>
    );
};