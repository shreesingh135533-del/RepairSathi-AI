import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Trash2,
  Plus,
  Star,
  CheckCircle2,
  AlertTriangle,
  Flag,
  Sparkles,
  Coins,
  FileSpreadsheet,
  Upload,
  Check,
  X,
  History,
  Building2
} from 'lucide-react';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, kb, feedback, ai
  const [stats, setStats] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [recentQueries, setRecentQueries] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  // New KB Form state
  const [newKbCategory, setNewKbCategory] = useState('smartphones');
  const [newKbDevice, setNewKbDevice] = useState('');
  const [newKbTitle, setNewKbTitle] = useState('');
  const [newKbCauses, setNewKbCauses] = useState('');
  const [newKbSteps, setNewKbSteps] = useState('');
  const [newKbTools, setNewKbTools] = useState('');
  const [newKbDifficulty, setNewKbDifficulty] = useState('Moderate');
  const [newKbCost, setNewKbCost] = useState('₹500 - ₹1,500');
  const [newKbWarning, setNewKbWarning] = useState('');
  const [kbSuccess, setKbSuccess] = useState('');

  // Pricing Engine State
  const [pricingList, setPricingList] = useState([]);
  const [pendingQuotes, setPendingQuotes] = useState([]);
  const [auditLogs, setAuditLogs] = useState({ history: [], verifications: [] });
  const [csvInput, setCsvInput] = useState('');
  const [csvStatus, setCsvStatus] = useState('');
  const [priceForm, setPriceForm] = useState({
    brand_name: 'Samsung',
    model_name: '',
    variant: 'All Variants',
    component_name: 'Display / Screen',
    part_price: '',
    labour_price: '450',
    is_tax_inclusive: 1,
    source_url: '',
    warranty_terms: '90-Day Official Brand Warranty'
  });
  const [priceFormMsg, setPriceFormMsg] = useState('');

  useEffect(() => {
    fetchAdminData();
    if (activeTab === 'costs') {
      fetchPricingData();
    }
  }, [token, activeTab]);

  const fetchPricingData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const pRes = await fetch('/api/admin/costs/prices?limit=50', { headers });
      const pData = await pRes.json();
      if (pData.prices) setPricingList(pData.prices);

      const qRes = await fetch('/api/admin/costs/quotes/pending', { headers });
      const qData = await qRes.json();
      if (qData.quotes) setPendingQuotes(qData.quotes);

      const lRes = await fetch('/api/admin/costs/audit-logs', { headers });
      const lData = await lRes.json();
      if (lData) setAuditLogs(lData);
    } catch (err) {
      console.error('Failed to load pricing admin data:', err);
    }
  };

  const handleVerifyQuote = async (quoteId, action) => {
    try {
      const res = await fetch(`/api/admin/costs/quotes/${quoteId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action, notes: `Reviewed by admin on ${new Date().toISOString()}` })
      });
      if (res.ok) {
        setPendingQuotes(prev => prev.filter(q => q.id !== quoteId));
        fetchPricingData();
      }
    } catch (err) {
      console.error('Verify quote error:', err);
    }
  };

  const handleSavePriceEntry = async (e) => {
    e.preventDefault();
    setPriceFormMsg('');
    try {
      const res = await fetch('/api/admin/costs/prices/entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(priceForm)
      });
      const data = await res.json();
      if (res.ok) {
        setPriceFormMsg('Official price record saved successfully!');
        fetchPricingData();
      } else {
        setPriceFormMsg(data.error || 'Failed to save price record');
      }
    } catch (err) {
      setPriceFormMsg('Network error saving price entry');
    }
  };

  const handleImportCsv = async (e) => {
    e.preventDefault();
    setCsvStatus('Processing CSV import...');
    try {
      const res = await fetch('/api/admin/costs/import-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ csvContent: csvInput })
      });
      const data = await res.json();
      if (res.ok) {
        setCsvStatus(data.message || 'CSV imported successfully!');
        setCsvInput('');
        fetchPricingData();
      } else {
        setCsvStatus(data.error || 'Failed to import CSV');
      }
    } catch (err) {
      setCsvStatus('Network error importing CSV');
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const statsRes = await fetch('/api/admin/stats', { headers });
      const statsData = await statsRes.json();
      if (statsData.stats) {
        setStats(statsData.stats);
        setCategoryStats(statsData.categoryStats || []);
        setRecentQueries(statsData.recentQueries || []);
      }

      const usersRes = await fetch('/api/admin/users', { headers });
      const usersData = await usersRes.json();
      if (usersData.users) {
        setUsersList(usersData.users);
      }

      const feedbackRes = await fetch('/api/admin/feedback', { headers });
      const feedbackData = await feedbackRes.json();
      if (feedbackData.feedback) {
        setFeedbackList(feedbackData.feedback);
      }
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        setUsersList(prev => prev.map(u => (u.id === userId ? { ...u, role: newRole } : u)));
      }
    } catch (err) {
      console.error('Role update error', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setUsersList(prev => prev.filter(u => u.id !== userId));
      }
    } catch (err) {
      console.error('Delete user error', err);
    }
  };

  const handleAddKb = async (e) => {
    e.preventDefault();
    setKbSuccess('');

    try {
      const stepsArray = newKbSteps.split('\n').filter(s => s.trim().length > 0);
      const toolsArray = newKbTools.split(',').map(t => t.trim()).filter(Boolean);

      const res = await fetch('/api/admin/knowledge-base', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          category_slug: newKbCategory,
          device_name: newKbDevice || 'Generic Appliance',
          problem_title: newKbTitle,
          possible_causes: newKbCauses,
          troubleshooting_steps: stepsArray,
          tools_required: toolsArray,
          difficulty: newKbDifficulty,
          estimated_cost_range: newKbCost,
          safety_warning: newKbWarning,
          professional_recommended: newKbDifficulty === 'Professional Technician Required' ? 1 : 0
        })
      });

      if (res.ok) {
        setKbSuccess('Knowledge base article published successfully!');
        setNewKbTitle('');
        setNewKbDevice('');
        setNewKbCauses('');
        setNewKbSteps('');
        setNewKbTools('');
        setNewKbWarning('');
        fetchAdminData();
      }
    } catch (err) {
      console.error('KB create error', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Admin & Operations Dashboard
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time platform metrics, user management, knowledge base curation, and AI status.
          </p>
        </div>

        {/* AI Model Status Pill */}
        <div className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-blue-500" />
          <span>Status: <strong>{stats?.aiConfigured ? 'Gemini 1.5 Cloud' : 'Safe Knowledge Engine'}</strong></span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl max-w-2xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Overview & Metrics
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Users ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab('kb')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'kb'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Add Knowledge
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'feedback'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Feedback ({feedbackList.length})
        </button>
        <button
          onClick={() => setActiveTab('costs')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'costs'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Repair Pricing Engine
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Key Metrics Counters */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {stats?.totalUsers || 0}
              </p>
              <span className="text-[11px] text-green-600 font-medium mt-1 inline-block">Registered accounts</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Repair Queries</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                {stats?.totalQueries || 0}
              </p>
              <span className="text-[11px] text-slate-500 font-medium mt-1 inline-block">AI Diagnostic runs</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Verified Solutions</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
                {stats?.totalKbArticles || 0}
              </p>
              <span className="text-[11px] text-slate-500 font-medium mt-1 inline-block">Knowledge Base entries</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">User Satisfaction</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                <span>{stats?.avgRating || '4.8'}</span>
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              </p>
              <span className="text-[11px] text-slate-500 font-medium mt-1 inline-block">{stats?.totalFeedback || 0} Ratings recorded</span>
            </div>
          </div>

          {/* Breakdown by Device Category */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span>Repair Problem Queries by Appliance Category</span>
            </h3>

            <div className="space-y-3">
              {categoryStats.map((cat, idx) => {
                const count = cat.query_count || 0;
                const total = Math.max(stats?.totalQueries || 1, 1);
                const percent = Math.round((count / total) * 100);

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                      <span>{cat.category_name}</span>
                      <span>{count} queries ({percent}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-500"
                        style={{ width: `${Math.max(percent, count > 0 ? 5 : 0)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Repair Queries Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">
              Recent Live Diagnostic Requests
            </h3>

            {recentQueries.length === 0 ? (
              <p className="text-xs text-slate-400">No queries recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                      <th className="pb-2">Device</th>
                      <th className="pb-2">Diagnostic Summary</th>
                      <th className="pb-2">User</th>
                      <th className="pb-2">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {recentQueries.map((q) => (
                      <tr key={q.id} className="text-slate-700 dark:text-slate-300">
                        <td className="py-2.5 font-semibold text-blue-600 dark:text-blue-400">{q.device_name}</td>
                        <td className="py-2.5 truncate max-w-xs">{q.title}</td>
                        <td className="py-2.5">{q.user_name || 'Guest User'}</td>
                        <td className="py-2.5 text-slate-400">{new Date(q.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Users Management */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md animate-fadeIn">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
            Registered Users ({usersList.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[11px] font-semibold">
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Email</th>
                  <th className="pb-2">Role</th>
                  <th className="pb-2">Created</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {usersList.map((u) => (
                  <tr key={u.id} className="text-slate-700 dark:text-slate-300">
                    <td className="py-3 font-medium text-slate-900 dark:text-white">{u.name}</td>
                    <td className="py-3">{u.email}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                        u.role === 'admin'
                          ? 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="py-3 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleToggleRole(u.id, u.role)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        Make {u.role === 'admin' ? 'User' : 'Admin'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Knowledge Base Editor */}
      {activeTab === 'kb' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md space-y-6 animate-fadeIn">
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              Publish New Repair Knowledge Base Guide
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Articles added here directly train the local AI matching engine and become browsable by users.
            </p>
          </div>

          {kbSuccess && (
            <div className="p-3.5 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              <span>{kbSuccess}</span>
            </div>
          )}

          <form onSubmit={handleAddKb} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={newKbCategory}
                  onChange={(e) => setNewKbCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                >
                  <option value="smartphones">Smartphones</option>
                  <option value="laptops-computers">Laptops & Computers</option>
                  <option value="television">Television</option>
                  <option value="refrigerators">Refrigerators</option>
                  <option value="washing-machines">Washing Machines</option>
                  <option value="air-conditioners">Air Conditioners</option>
                  <option value="fans">Fans</option>
                  <option value="kitchen-appliances">Kitchen Appliances</option>
                  <option value="wifi-routers">Wi-Fi Routers</option>
                  <option value="other-electronics">Other Electronics</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Specific Device Name
                </label>
                <input
                  type="text"
                  required
                  value={newKbDevice}
                  onChange={(e) => setNewKbDevice(e.target.value)}
                  placeholder="e.g. Microwave Oven or Front Load Washer"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Problem Title
              </label>
              <input
                type="text"
                required
                value={newKbTitle}
                onChange={(e) => setNewKbTitle(e.target.value)}
                placeholder="e.g. Microwave turns on but does not heat food"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Possible Causes (comma separated)
              </label>
              <input
                type="text"
                required
                value={newKbCauses}
                onChange={(e) => setNewKbCauses(e.target.value)}
                placeholder="Blown high voltage fuse, failed magnetron, door latch switch"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Step-by-Step Instructions (one per line)
              </label>
              <textarea
                rows={4}
                required
                value={newKbSteps}
                onChange={(e) => setNewKbSteps(e.target.value)}
                placeholder="Step 1: Check door switch hooks&#10;Step 2: Unplug appliance and wait 10 minutes&#10;Step 3: Test ceramic cup of water"
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Tools (comma separated)
                </label>
                <input
                  type="text"
                  value={newKbTools}
                  onChange={(e) => setNewKbTools(e.target.value)}
                  placeholder="Multimeter, Screwdriver"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Difficulty Level
                </label>
                <select
                  value={newKbDifficulty}
                  onChange={(e) => setNewKbDifficulty(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                >
                  <option value="Easy">Easy</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Difficult">Difficult</option>
                  <option value="Professional Technician Required">Professional Technician Required</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Estimated Cost (INR ₹)
                </label>
                <input
                  type="text"
                  value={newKbCost}
                  onChange={(e) => setNewKbCost(e.target.value)}
                  placeholder="₹800 - ₹2,000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Safety Warning
              </label>
              <input
                type="text"
                value={newKbWarning}
                onChange={(e) => setNewKbWarning(e.target.value)}
                placeholder="High voltage hazard. Discharge capacitor before touching."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>

            <button
              type="submit"
              className="py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center gap-2 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Article</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: Feedback & Reports */}
      {activeTab === 'feedback' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 animate-fadeIn">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            User Feedback & Inaccurate Diagnosis Reports ({feedbackList.length})
          </h3>

          {feedbackList.length === 0 ? (
            <p className="text-xs text-slate-400">No feedback submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {feedbackList.map((f) => (
                <div
                  key={f.id}
                  className={`p-4 rounded-2xl border ${
                    f.is_incorrect_report
                      ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {f.user_name || 'Anonymous User'}
                    </span>
                    <div className="flex items-center gap-2">
                      {f.is_incorrect_report ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300 flex items-center gap-1">
                          <Flag className="w-3 h-3" />
                          <span>Flagged Inaccurate</span>
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-0.5">
                          {f.rating} ★
                        </span>
                      )}
                      <span className="text-slate-400 text-[11px]">
                        {new Date(f.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    "{f.comment || 'No written comment'}"
                  </p>
                  {f.conversation_title && (
                    <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1">
                      Related: {f.conversation_title}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Repair Pricing Engine Management */}
      {activeTab === 'costs' && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Metrics header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Official Price Entries</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                {pricingList.length}
              </p>
              <span className="text-[11px] text-slate-500 font-mono mt-1 block">Audited manufacturer spare parts</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Quote Audits</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {pendingQuotes.length}
              </p>
              <span className="text-[11px] text-slate-500 font-mono mt-1 block">Local workshop submissions</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Price Adjustments</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                {auditLogs.history?.length || 0}
              </p>
              <span className="text-[11px] text-slate-500 font-mono mt-1 block">Logged in audit trail</span>
            </div>
          </div>

          {/* Section 1: Add or Update Official Price Entry */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-500" />
                  Manual Official Price Entry
                </h3>
                <p className="text-xs text-slate-500">Insert or update published OEM spare part records.</p>
              </div>
            </div>

            <form onSubmit={handleSavePriceEntry} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans">
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samsung, Apple, OnePlus"
                  value={priceForm.brand_name}
                  onChange={(e) => setPriceForm({ ...priceForm, brand_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Model Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Galaxy A14 5G, iPhone 15"
                  value={priceForm.model_name}
                  onChange={(e) => setPriceForm({ ...priceForm, model_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Storage Variant
                </label>
                <input
                  type="text"
                  placeholder="e.g. 128GB or All Variants"
                  value={priceForm.variant}
                  onChange={(e) => setPriceForm({ ...priceForm, variant: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Component *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Display / Screen, Battery"
                  value={priceForm.component_name}
                  onChange={(e) => setPriceForm({ ...priceForm, component_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Spare Part Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 2750"
                  value={priceForm.part_price}
                  onChange={(e) => setPriceForm({ ...priceForm, part_price: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Labour / Service Fee (₹) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 450"
                  value={priceForm.labour_price}
                  onChange={(e) => setPriceForm({ ...priceForm, labour_price: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Tax Status
                </label>
                <select
                  value={priceForm.is_tax_inclusive}
                  onChange={(e) => setPriceForm({ ...priceForm, is_tax_inclusive: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value={1}>18% GST Inclusive</option>
                  <option value={0}>18% GST Exclusive (Add to Bill)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Official Portal URL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={priceForm.source_url}
                  onChange={(e) => setPriceForm({ ...priceForm, source_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-between pt-2">
                {priceFormMsg && (
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {priceFormMsg}
                  </span>
                )}
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono font-bold text-xs ml-auto shadow-sm"
                >
                  Save Price Record
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Bulk CSV Importer */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                  Bulk CSV Import
                </h3>
                <p className="text-xs text-slate-500">
                  Import spare pricing schedules in bulk. Headers required: <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">brand, model, component, part_price, labour_price, variant, source_url</code>
                </p>
              </div>
            </div>

            <form onSubmit={handleImportCsv} className="space-y-3">
              <textarea
                rows="4"
                placeholder="brand,model,component,part_price,labour_price,variant,source_url&#10;Samsung,Galaxy A54 5G,Display / Screen,5400,450,All Variants,https://www.samsung.com/in/support/out-of-warranty-repair-charges/&#10;Apple,iPhone 15,Battery,8800,999,All Variants,https://support.apple.com/en-in/iphone/repair"
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              ></textarea>

              <div className="flex items-center justify-between">
                {csvStatus && (
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {csvStatus}
                  </span>
                )}
                <button
                  type="submit"
                  disabled={!csvInput.trim()}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs ml-auto flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Execute Bulk Import</span>
                </button>
              </div>
            </form>
          </div>

          {/* Section 3: Quotation Verification Queue */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              Community Quotation Audit Queue ({pendingQuotes.length} Pending)
            </h3>

            {pendingQuotes.length === 0 ? (
              <p className="text-xs text-slate-400 font-mono">No pending user submissions to audit.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
                      <th className="py-2.5 px-3">Device & Component</th>
                      <th className="py-2.5 px-3">Shop & City</th>
                      <th className="py-2.5 px-3">Quoted Price</th>
                      <th className="py-2.5 px-3">Quality</th>
                      <th className="py-2.5 px-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {pendingQuotes.map((q) => (
                      <tr key={q.id}>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-900 dark:text-white">{q.brand_name} {q.model_name}</span>
                          <span className="block text-[11px] text-slate-500">{q.component_name}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                          <span>{q.shop_name}</span>
                          <span className="block text-[11px] text-slate-400">{q.city} ({q.address_locality})</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{q.total_price}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                          {q.part_quality}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleVerifyQuote(q.id, 'approve')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[11px] font-bold flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" /> Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleVerifyQuote(q.id, 'reject')}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-[11px] font-bold flex items-center gap-1"
                            >
                              <X className="w-3 h-3" /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 4: Live Price Catalogue List */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              Official Price Records ({pricingList.length})
            </h3>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-400 uppercase sticky top-0 bg-white dark:bg-slate-900">
                    <th className="py-2.5 px-3">Brand & Model</th>
                    <th className="py-2.5 px-3">Variant</th>
                    <th className="py-2.5 px-3">Component</th>
                    <th className="py-2.5 px-3">Part Price</th>
                    <th className="py-2.5 px-3">Labour</th>
                    <th className="py-2.5 px-3">Total (₹)</th>
                    <th className="py-2.5 px-3">Verified</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {pricingList.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                        {p.brand_name} {p.model_name}
                      </td>
                      <td className="py-2 px-3 text-slate-500">{p.variant}</td>
                      <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{p.component_name}</td>
                      <td className="py-2 px-3">₹{p.part_price}</td>
                      <td className="py-2 px-3">₹{p.labour_price}</td>
                      <td className="py-2 px-3 font-bold text-blue-600 dark:text-blue-400">₹{p.total_price}</td>
                      <td className="py-2 px-3 text-[11px] text-slate-400">{p.last_verified_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5: Audit Log History */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-slate-400" />
              Audit Trail & Verification History
            </h3>

            {auditLogs.history?.length === 0 && auditLogs.verifications?.length === 0 ? (
              <p className="text-xs text-slate-400 font-mono">No pricing audit entries recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {auditLogs.history?.map((h) => (
                  <div key={h.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs font-mono flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{h.brand_slug} {h.model_name} — {h.component_name}</span>
                      <p className="text-[11px] text-slate-500">{h.reason} (by {h.updated_by})</p>
                    </div>
                    <div className="text-right">
                      <span className="text-rose-500 line-through mr-2">₹{h.old_total}</span>
                      <span className="text-emerald-500 font-bold">₹{h.new_total}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
