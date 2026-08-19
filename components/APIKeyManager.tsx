import React, { useEffect, useState } from 'react';
import {
  auth,
  generateApiKey,
  getApiKeyStatus,
  revokeApiKey,
} from '../services/firebase';
import { ApiKeyStatus as ApiKeyStatusType } from '../types';

export const APIKeyManager: React.FC = () => {
  const [status, setStatus] = useState<ApiKeyStatusType>({
    hasKey: false,
    createdAt: null,
    lastUsedAt: null,
    preview: null,
  });
  const [loading, setLoading] = useState(true);
  const [rawKey, setRawKey] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedPreview, setCopiedPreview] = useState(false);

  const uid = auth.currentUser?.uid;

  const loadStatus = async () => {
    if (!uid) return;
    setLoading(true);
    const s = await getApiKeyStatus(uid);
    setStatus(s);
    setLoading(false);
  };

  useEffect(() => {
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const handleGenerate = async () => {
    if (!uid) return;
    setError('');
    const res = await generateApiKey(uid);
    if (res.ok) {
      setRawKey(res.key);
      await loadStatus();
    } else {
      setError(res.error);
    }
  };

  const handleCopy = async () => {
    if (!rawKey) return;
    try {
      await navigator.clipboard.writeText(rawKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Could not copy to clipboard.');
    }
  };

  const handleCopyPreview = async () => {
    if (!status.preview) return;
    try {
      await navigator.clipboard.writeText(status.preview);
      setCopiedPreview(true);
      setTimeout(() => setCopiedPreview(false), 2000);
    } catch {
      setError('Could not copy to clipboard.');
    }
  };

  const handleRevoke = async () => {
    if (!uid) return;
    if (!window.confirm('Revoke this API key? Requests using it will stop working immediately.')) return;
    await revokeApiKey(uid);
    setRawKey(null);
    await loadStatus();
  };

  const handleRegenerate = async () => {
    if (!uid) return;
    if (!window.confirm('Regenerate API key? The current key will be permanently invalidated.')) return;
    setError('');
    const res = await generateApiKey(uid);
    if (res.ok) {
      setRawKey(res.key);
      await loadStatus();
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="mt-12 pt-10 border-t border-zinc-800">
      <h2 className="text-2xl font-bold text-white mb-2">API Access</h2>
      <p className="text-zinc-400 text-sm mb-6 max-w-2xl">
        Use your private API key to pull the latest confessions submitted to your page in
        external apps, widgets, or displays. This key grants read access to your confessions —
        <span className="text-zinc-200 font-medium"> keep it secret</span>. Never paste it into
        public code or share it.
      </p>

      {loading ? (
        <div className="flex items-center gap-2 text-zinc-500 text-sm">
          <span className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></span>
          Checking key status…
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Key status</span>
              <span
                className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  status.hasKey
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${status.hasKey ? 'bg-green-400' : 'bg-zinc-500'}`}></span>
                {status.hasKey ? 'Active' : 'No key'}
              </span>
            </div>

            {status.hasKey && (
              <dl className="space-y-3 text-sm mb-6">
                <div className="flex justify-between gap-4 items-center">
                  <dt className="text-zinc-500">Created</dt>
                  <dd className="text-zinc-200">
                    {status.createdAt ? new Date(status.createdAt).toLocaleString() : '—'}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 items-center">
                  <dt className="text-zinc-500">Key</dt>
                  <dd className="flex items-center gap-2">
                    <code className="text-zinc-200 font-mono flex-1 break-all">{status.preview}</code>
                    <button
                      onClick={handleCopyPreview}
                      title="Copy masked key preview"
                      className="px-2 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-zinc-700 transition-colors"
                    >
                      {copiedPreview ? 'Copied!' : 'Copy'}
                    </button>
                  </dd>
                </div>
                <div className="flex justify-between gap-4 items-center">
                  <dt className="text-zinc-500">Last used</dt>
                  <dd className="text-zinc-200">
                    {status.lastUsedAt ? new Date(status.lastUsedAt).toLocaleString() : 'Never'}
                  </dd>
                </div>
              </dl>
            )}

            {rawKey && (
              <div className="mb-6">
                <div className="bg-zinc-950 border border-emerald-500/30 rounded-lg p-3 mb-2">
                  <p className="text-[10px] uppercase tracking-wider text-emerald-400 mb-1 font-bold">
                    Your new API key (shown once)
                  </p>
                  <code className="text-emerald-300 text-sm break-all font-mono select-all">{rawKey}</code>
                </div>
                <button
                  onClick={handleCopy}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm font-medium border border-zinc-700 transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy key'}
                </button>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {!status.hasKey && (
                <button
                  onClick={handleGenerate}
                  className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Generate API key
                </button>
              )}
              {status.hasKey && (
                <>
                  <button
                    onClick={handleRegenerate}
                    className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm font-medium border border-zinc-700 transition-colors"
                  >
                    Regenerate
                  </button>
                  <button
                    onClick={handleRevoke}
                    className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-semibold border border-red-500/20 transition-colors"
                  >
                    Revoke
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4">Usage</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-zinc-500 mb-1">Endpoint</p>
                <code className="text-zinc-200 bg-zinc-950 border border-zinc-800 rounded px-2 py-1 block font-mono text-xs">
                  GET /api/confessions?limit=10
                </code>
              </div>
              <div>
                <p className="text-zinc-500 mb-1">Example request</p>
                <pre className="bg-zinc-950 border border-zinc-800 rounded p-3 text-xs font-mono text-zinc-300 overflow-x-auto">
{`curl -H "Authorization: Bearer YOUR_API_KEY" \\
  "/api/confessions?limit=10"`}
                </pre>
              </div>
              <div>
                <p className="text-zinc-500 mb-1">Example response</p>
                <pre className="bg-zinc-950 border border-zinc-800 rounded p-3 text-xs font-mono text-zinc-300 overflow-x-auto">
{`{
  "confessions": [
    {
      "id": "123",
      "content": "I have a crush on someone here...",
      "created_at": "2026-08-19T14:30:00Z"
    }
  ],
  "count": 1
}`}
                </pre>
              </div>
              <div className="pt-2">
                <p className="text-zinc-400">
                  Returns the newest confessions for your page, newest first. Supports{' '}
                  <code className="text-violet-300 font-mono">?limit</code> (1–50, default 10) and{' '}
                  <code className="text-violet-300 font-mono">?offset</code> for pagination.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};