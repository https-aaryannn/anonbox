import React, { useState } from 'react';
import { registerUser } from '../services/firebase';

export const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await registerUser(email.trim(), password);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Log in instead.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak.');
      } else {
        setError(err.message || 'Sign up failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <p className="text-sm text-emerald-400">
        Account created. You are now logged in to your dashboard.
      </p>
    );
  }

  return (
    <div className="max-w-sm mx-auto mt-8 pt-6 border-t border-zinc-800">
      <h3 className="text-center text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
        New here? Create your own confession page
      </h3>
      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-2 uppercase tracking-wider">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-2 uppercase tracking-wider">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all"
            placeholder="At least 6 characters"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-violet-900/20 flex justify-center items-center"
        >
          {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Create account'}
        </button>
      </form>
    </div>
  );
};