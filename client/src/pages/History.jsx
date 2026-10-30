import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  History as HistoryIcon,
  Search,
  Trash2,
  Calendar,
  Wrench,
  ArrowRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function History({ onResumeConversation }) {
  const { token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchConversations();
  }, [token]);

  const fetchConversations = async (search = '') => {
    setLoading(true);
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      let url = '/api/repair/conversations';
      if (search) url += `?search=${encodeURIComponent(search)}`;

      const res = await fetch(url, { headers });
      const data = await res.json();
      if (data.conversations) {
        setConversations(data.conversations);
      }
    } catch (err) {
      setError('Failed to retrieve repair history');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchConversations(searchTerm);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this repair conversation?')) {
      return;
    }

    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`/api/repair/conversations/${id}`, {
        method: 'DELETE',
        headers
      });

      setConversations(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Delete error', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 font-sans">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-white/[0.08] pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-mono font-medium mb-3">
            <HistoryIcon className="w-3.5 h-3.5" />
            <span>SESSION TIMELINE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
            Diagnostic History
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-sans mt-2">
            Review past troubleshooting sessions, follow-up messages, and recommended solutions.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search past repairs..."
            className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-charcoal-900 text-xs sm:text-sm font-sans text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center bg-white dark:bg-charcoal-900 rounded-3xl border border-slate-200 dark:border-white/[0.08]">
          <span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin inline-block"></span>
          <p className="text-xs font-mono text-slate-400 mt-2">Loading sessions...</p>
        </div>
      ) : conversations.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-charcoal-900 rounded-3xl border border-slate-200 dark:border-white/[0.08] space-y-3">
          <p className="text-sm text-slate-500 font-sans">No diagnostic sessions found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => onResumeConversation(c.id)}
              className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-white/[0.07] hover:border-blue-500/40 hover:shadow-md cursor-pointer transition-all flex items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="font-bold text-blue-600 dark:text-blue-400 uppercase">
                    {c.brand || c.device_name || c.category_slug}
                  </span>
                  {c.model && (
                    <span className="text-slate-400">• {c.model}</span>
                  )}
                  {c.error_code && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 font-bold">
                      Code {c.error_code}
                    </span>
                  )}
                </div>
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white truncate group-hover:text-blue-500 transition-colors">
                  {c.title}
                </h3>
                <p className="text-xs text-slate-500 font-sans line-clamp-1">
                  {c.problem_description}
                </p>
                <span className="text-[10px] font-mono text-slate-400 block pt-1">
                  {new Date(c.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={(e) => handleDelete(c.id, e)}
                  title="Delete session"
                  className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-charcoal-800 text-slate-600 dark:text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
