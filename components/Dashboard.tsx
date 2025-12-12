import React, { useEffect, useState } from 'react';
import { Confession } from '../types';
import { getConfessions, deleteConfession, updateConfession, archiveConfession, markConfessionRead } from '../services/firebase';


export const Dashboard: React.FC = () => {
    const [confessions, setConfessions] = useState<Confession[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const loadData = async () => {
        setLoading(true);
        const data = await getConfessions();
        setConfessions(data.sort((a, b) => b.createdAt - a.createdAt));
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Permanently delete this confession?")) return;
        await deleteConfession(id);
        setConfessions(prev => prev.filter(c => c.id !== id));
    };

    const handleMarkRead = async (id: string, currentStatus: boolean) => {
        await markConfessionRead(id, !currentStatus);
        setConfessions(prev => prev.map(c => c.id === id ? { ...c, isRead: !currentStatus } : c));
    };

    const handleArchive = async (id: string, currentStatus: boolean | undefined) => {
        const newStatus = !currentStatus;
        await archiveConfession(id, newStatus);
        setConfessions(prev => prev.map(c => c.id === id ? { ...c, archived: newStatus } : c));
    };



    const handleExportCSV = () => {
        const headers = ["ID", "Content", "Date", "Sentiment Score", "Tags"];
        const rows = confessions.map(c => [
            c.id,
            `"${c.content.replace(/"/g, '""')}"`,
            new Date(c.createdAt).toISOString(),
            c.aiAnalysis?.sentimentScore || '',
            (c.aiAnalysis?.tags || []).join(';')
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `confessions-${Date.now()}.csv`;
        a.click();
    };

    const filteredConfessions = confessions.filter(c =>
        c.content.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="animate-fade-in max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-zinc-800">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Confessions Dashboard</h1>
                    <p className="text-zinc-400 mt-2">Overview of {confessions.length} anonymous submissions.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-grow md:flex-grow-0">
                        <input
                            type="text"
                            placeholder="Search content or tags..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 w-full md:w-72 transition-all placeholder:text-zinc-600"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3.5 top-3 text-zinc-500"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </div>
                    <button
                        onClick={handleExportCSV}
                        className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-zinc-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        Export
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-32">
                    <div className="flex flex-col items-center gap-4">
                        <span className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></span>
                        <p className="text-zinc-500 text-sm">Loading submissions...</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredConfessions.map(confession => (
                        <div
                            key={confession.id}
                            className={`group relative bg-zinc-900 border rounded-xl overflow-hidden transition-all duration-300 ${confession.isRead
                                ? 'border-zinc-800 opacity-80 hover:opacity-100'
                                : 'border-violet-500/30 shadow-lg shadow-violet-900/10 ring-1 ring-violet-500/10'
                                }`}
                        >
                            {/* Status Bar Indicator */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${confession.isRead ? 'bg-zinc-700' : 'bg-violet-500'}`}></div>

                            <div className="p-6 pl-8">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-mono font-medium text-zinc-500 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                                            {new Date(confession.createdAt).toLocaleDateString()} &bull; {new Date(confession.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {!confession.isRead && (
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">
                                                New
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleMarkRead(confession.id, confession.isRead)}
                                            className={`p-2 rounded-lg transition-colors border ${confession.isRead ? 'border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800' : 'border-violet-900/50 text-violet-400 hover:bg-violet-500/10 bg-violet-500/5'}`}
                                            title={confession.isRead ? "Mark as Unread" : "Mark as Read"}
                                        >
                                            {confession.isRead ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12l5 5L22 7"></path></svg>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleArchive(confession.id, confession.archived)}
                                            className={`p-2 rounded-lg transition-colors border ${confession.archived ? 'border-orange-500/50 text-orange-400 bg-orange-500/10' : 'border-zinc-800 text-zinc-500 hover:text-orange-300 hover:bg-orange-500/10 hover:border-orange-500/30'}`}
                                            title={confession.archived ? "Unarchive" : "Archive"}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(confession.id)}
                                            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 border border-zinc-800 hover:border-red-500/30 rounded-lg transition-colors"
                                            title="Delete Submission"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
                                    </div>
                                </div>

                                <p className="text-zinc-100 text-lg leading-relaxed whitespace-pre-wrap mb-8 font-normal">
                                    {confession.content}
                                </p>

                                {confession.archived && (
                                    <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full">
                                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                                        <span className="text-xs font-medium text-orange-400">Archived</span>
                                    </div>
                                )}

                                {/* Removed AI Section */}
                            </div>
                        </div>
                    ))}

                    {filteredConfessions.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-zinc-500 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/30">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                            <p className="text-lg font-medium">No confessions found</p>
                            <p className="text-sm opacity-60">Try adjusting your search terms</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};