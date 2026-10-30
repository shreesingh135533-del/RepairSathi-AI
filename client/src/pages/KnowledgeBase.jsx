import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Wrench,
  AlertTriangle,
  ShieldAlert,
  Coins,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Filter,
  ExternalLink,
  ChevronRight,
  Cpu
} from 'lucide-react';

export default function KnowledgeBase({ onDiagnoseArticle }) {
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeArticle, setActiveArticle] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchArticles();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (e) {
      console.error('Failed to load categories', e);
    }
  };

  const fetchArticles = async (cat = selectedCategory, search = searchTerm) => {
    setLoading(true);
    try {
      let url = `/api/knowledge-base?category=${cat}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.articles) {
        setArticles(data.articles);
        if (data.articles.length > 0 && !activeArticle) {
          setActiveArticle(data.articles[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load articles', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (slug) => {
    setSelectedCategory(slug);
    fetchArticles(slug, searchTerm);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchArticles(selectedCategory, searchTerm);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 font-sans">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-white/[0.08] pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-mono font-medium mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          <span>VERIFIED HARDWARE ENCYCLOPEDIA</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
          Repair Knowledge Base
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2 font-sans max-w-2xl">
          Explore manufacturer-approved troubleshooting blueprints, component diagnostics, and safety protocols.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-lg relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search problems, symptoms, error codes (e.g. E20, fan, overheating)..."
            className="w-full pl-10 pr-24 py-3 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-charcoal-900 text-slate-900 dark:text-white text-xs sm:text-sm font-sans focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold"
          >
            Search
          </button>
        </form>

        {/* Category Pills (horizontal scrollable) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none font-mono">
          <button
            type="button"
            onClick={() => handleCategoryChange('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryChange(cat.slug)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                selectedCategory === cat.slug
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>{cat.name}</span>
              {cat.article_count > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-charcoal-800 text-slate-700 dark:text-slate-300">
                  {cat.article_count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Layout (Sidebar list + Detailed Article View) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Articles List */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Troubleshooting Guides ({articles.length})
          </h3>

          {loading ? (
            <div className="p-8 text-center bg-white dark:bg-charcoal-900 rounded-3xl border border-slate-200 dark:border-white/[0.08]">
              <span className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
              <p className="text-xs font-mono text-slate-400 mt-2">Loading verified guides...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-charcoal-900 rounded-3xl border border-slate-200 dark:border-white/[0.08]">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                No articles found matching "{searchTerm}".
              </p>
              <button
                type="button"
                onClick={() => { setSearchTerm(''); fetchArticles(selectedCategory, ''); }}
                className="mt-3 text-xs text-blue-600 dark:text-blue-400 underline font-mono font-bold"
              >
                Clear filter & show all
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
              {articles.map((art) => {
                const isSelected = activeArticle?.id === art.id;
                return (
                  <div
                    key={art.id}
                    onClick={() => setActiveArticle(art)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 shadow-sm'
                        : 'bg-white dark:bg-charcoal-900 border-slate-200 dark:border-white/[0.07] hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1 font-mono">
                      <span className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                        {art.device_name}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-charcoal-800 text-[10px] font-bold">
                        {art.difficulty}
                      </span>
                    </div>
                    <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white line-clamp-2">
                      {art.problem_title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 font-sans">
                      {art.symptoms}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Active Article Detail */}
        <div className="lg:col-span-7">
          {activeArticle ? (
            <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/[0.08] shadow-xl space-y-6 animate-fade-in">
              {/* Header */}
              <div className="border-b border-slate-100 dark:border-white/[0.06] pb-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2 font-mono">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 uppercase">
                    {activeArticle.device_name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                      Difficulty: {activeArticle.difficulty}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                      Cost: {activeArticle.estimated_cost_range}
                    </span>
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900 dark:text-white">
                  {activeArticle.problem_title}
                </h2>
              </div>

              {/* Symptoms */}
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Observed Symptoms
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-charcoal-850 p-4 rounded-2xl border border-slate-100 dark:border-white/[0.05] font-sans">
                  {activeArticle.symptoms}
                </p>
              </div>

              {/* Possible Causes */}
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Probable Causes
                </h4>
                <div className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-sans">
                  {activeArticle.possible_causes?.split(',').map((cause, cIdx) => (
                    <div key={cIdx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
                      <span>{cause.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety Warning */}
              {activeArticle.safety_warning && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <p className="font-mono font-bold uppercase">Safety Precaution Required</p>
                    <p className="font-sans leading-relaxed">{activeArticle.safety_warning}</p>
                  </div>
                </div>
              )}

              {/* Step-by-Step Resolution */}
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Step-by-Step Resolution Blueprint
                </h4>
                <div className="space-y-2.5">
                  {activeArticle.troubleshooting_steps?.map((step, sIdx) => (
                    <div key={sIdx} className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-charcoal-850/60 border border-slate-100 dark:border-white/[0.05] flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {sIdx + 1}
                      </span>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-sans leading-relaxed mt-0.5">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tools Required */}
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Tools Required
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activeArticle.tools_required?.map((tool, tIdx) => (
                    <span key={tIdx} className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-charcoal-800 text-slate-700 dark:text-slate-300 text-xs font-mono">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action: Open in Interactive AI Diagnosis */}
              {onDiagnoseArticle && (
                <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => onDiagnoseArticle({
                      category: activeArticle.category_slug,
                      deviceName: activeArticle.device_name,
                      problemDescription: `${activeArticle.problem_title}. ${activeArticle.symptoms}`
                    })}
                    className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-heading font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20"
                  >
                    <Sparkles className="w-4 h-4 text-acid" />
                    <span>Run AI Troubleshooting with this Article</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-charcoal-900 rounded-3xl border border-slate-200 dark:border-white/[0.08]">
              <p className="text-sm font-medium text-slate-500">Select an article from the list to view instructions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
