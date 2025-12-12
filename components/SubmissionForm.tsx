import React, { useState } from 'react';
import { saveConfession } from '../services/firebase';

export const SubmissionForm: React.FC = () => {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    try {
      await saveConfession(text);
      setStatus('success');
      setText('');
      // Reset status after 3 seconds
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in text-center p-6">
        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-green-500/30 shadow-[0_0_30px_-5px_rgba(34,197,94,0.3)]">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h2 className="text-4xl font-bold text-white mb-3">Received.</h2>
        <p className="text-zinc-300 text-lg max-w-md">Your confession has been encrypted and securely recorded anonymously.</p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-10 px-6 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-all"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-zinc-400 mb-6 drop-shadow-sm">
          Unburden Yourself.
        </h1>
        <p className="text-zinc-400 text-lg md:text-xl font-light leading-relaxed">
          Submit your confession anonymously. <br className="hidden md:block" />
          No logs. No tracking. <span className="text-zinc-200 font-medium">Pure release.</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl opacity-30 group-hover:opacity-60 transition duration-500 blur-lg"></div>

        <div className="relative bg-zinc-950 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-2xl">
          <div className="mb-2">
            <label htmlFor="confession" className="sr-only">Your Confession</label>
            <textarea
              id="confession"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your confession here... (Don't worry, it's anonymous)"
              className="w-full h-56 bg-transparent text-lg md:text-xl text-white placeholder:text-zinc-600 resize-none focus:outline-none leading-relaxed"
              maxLength={1000}
              autoFocus
              required
            />
          </div>

          <div className="flex justify-between items-center mt-6 pt-6 border-t border-zinc-800/50">
            <span className={`text-sm font-mono transition-colors ${text.length > 900 ? 'text-orange-400' : 'text-zinc-500'}`}>
              {text.length} / 1000
            </span>
            <button
              type="submit"
              disabled={isSubmitting || !text.trim()}
              className="px-8 py-3 bg-white text-zinc-950 font-bold rounded-xl hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.5)] transform hover:-translate-y-0.5"
            >
              {isSubmitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-zinc-400 border-t-zinc-900 rounded-full animate-spin"></span>
                  Processing...
                </>
              ) : (
                <>
                  Confess
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      <div className="mt-10 flex flex-col md:flex-row justify-center gap-6 md:gap-12 opacity-60">
        <div className="flex items-center justify-center gap-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          <span className="text-sm font-medium text-zinc-300">End-to-End Encrypted</span>
        </div>
        <div className="flex items-center justify-center gap-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
          <span className="text-sm font-medium text-zinc-300">100% Anonymous</span>
        </div>
      </div>
    </div>
  );
};