import React, { useState } from 'react';
import { saveConfessionForOwner } from '../services/firebase';

interface SubmissionFormProps {
  ownerUid: string | null;
}

export const SubmissionForm: React.FC<SubmissionFormProps> = ({ ownerUid }) => {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (!ownerUid) {
      setStatus('error');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveConfessionForOwner(ownerUid, text);
      setStatus('success');
      setText('');
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
      <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in text-center p-4 sm:p-6">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-4 sm:mb-6 ring-1 ring-green-500/30 shadow-[0_0_30px_-5px_rgba(34,197,94,0.3)]">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400 sm:w-48 sm:h-48">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-3">Received</h2>
        <p className="text-sm sm:text-lg text-zinc-300 max-w-md">Your confession has been stored anonymously on this account's page.</p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-4 sm:mt-6 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors text-base"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="confession" className="block text-sm font-semibold text-zinc-300 mb-2">
            Your confession
          </label>
          <textarea
            id="confession"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            minLength={1}
            maxLength={1000}
            rows={5}
            disabled={isSubmitting}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-4 text-white placeholder:text-zinc-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-all resize-none text-base"
            placeholder="Type your anonymous confession here..."
          />
          <p className="text-xs text-zinc-500 mt-1 text-right">{text.length}/1000</p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !text.trim()}
          className="w-full py-4 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-900/50 text-white font-bold rounded-xl transition-all shadow-lg shadow-violet-900/20 text-base flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Submitting...
            </>
          ) : (
            'Submit Confession'
          )}
        </button>

        {status === 'error' && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
            <p className="text-red-400 text-sm">Failed to submit. Please try again.</p>
          </div>
        )}
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Your confession is anonymous and only visible to this account owner.
      </p>
    </div>
  );
};