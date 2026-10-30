import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Wrench,
  Sparkles,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Coins,
  Send,
  X,
  RefreshCw,
  Star,
  ThumbsUp,
  Flag,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  AlertCircle,
  Tag,
  Zap,
  Cpu,
  Layers,
  ArrowUpRight,
  Building2
} from 'lucide-react';

import AutocompleteInput from '../components/AutocompleteInput';
import DeviceVerificationBadge from '../components/DeviceVerificationBadge';
import SymptomAutocomplete from '../components/SymptomAutocomplete';
import ErrorCodeSelector from '../components/ErrorCodeSelector';

export default function Assistant({ initialData = null, onNavigateCost = null }) {
  const { token, user } = useAuth();

  // Form states
  const [category, setCategory] = useState(initialData?.category || 'smartphones');
  const [brand, setBrand] = useState(initialData?.brand || initialData?.deviceName || '');
  const [selectedBrandObj, setSelectedBrandObj] = useState(null);
  const [model, setModel] = useState(initialData?.model || '');
  const [selectedModelObj, setSelectedModelObj] = useState(null);
  const [errorCode, setErrorCode] = useState(initialData?.errorCode || '');
  const [errorCodeValidation, setErrorCodeValidation] = useState({ isValid: true, isUnrecognized: false });
  const [problemDescription, setProblemDescription] = useState(initialData?.problemDescription || '');
  const [problemValidation, setProblemValidation] = useState(null);

  // Validation states
  const [validation, setValidation] = useState(null);
  const [allowUnverifiedModel, setAllowUnverifiedModel] = useState(false);
  const [validationLoading, setValidationLoading] = useState(false);

  // Diagnosis results states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [diagnosis, setDiagnosis] = useState(initialData?.diagnosis || null);
  const [conversationId, setConversationId] = useState(initialData?.conversationId || null);
  const [completedSteps, setCompletedSteps] = useState({});

  useEffect(() => {
    window.__setDiagnosis = (diag, convId = null) => {
      setDiagnosis(diag);
      if (convId) setConversationId(convId);
    };
  }, []);

  // Follow-up chat states
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef(null);

  // Feedback states
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Categories list with Gen Z tech icons & badges
  const categories = [
    { slug: 'smartphones', label: 'Smartphones', icon: '📱' },
    { slug: 'laptops-computers', label: 'Laptops & PCs', icon: '💻' },
    { slug: 'television', label: 'Television', icon: '📺' },
    { slug: 'refrigerators', label: 'Refrigerators', icon: '❄️' },
    { slug: 'washing-machines', label: 'Washing Machines', icon: '🧺' },
    { slug: 'air-conditioners', label: 'Air Conditioners', icon: '💨' },
    { slug: 'fans', label: 'Fans', icon: '🌀' },
    { slug: 'kitchen-appliances', label: 'Kitchen Tech', icon: '⚡' },
    { slug: 'wifi-routers', label: 'Wi-Fi Routers', icon: '📡' },
    { slug: 'other-electronics', label: 'Other Tech', icon: '🔌' }
  ];

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, chatLoading]);

  // When category changes, reset brand/model validation
  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    setBrand('');
    setSelectedBrandObj(null);
    setModel('');
    setSelectedModelObj(null);
    setValidation(null);
    setAllowUnverifiedModel(false);
    setError('');
  };

  // Fetch brand suggestions
  const fetchBrandSuggestions = async (searchQuery) => {
    try {
      const res = await fetch(`/api/devices/brands?category=${encodeURIComponent(category)}&query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      return data.brands || [];
    } catch (e) {
      return [];
    }
  };

  // Fetch model suggestions filtered by selected brand
  const fetchModelSuggestions = async (searchQuery) => {
    try {
      let url = `/api/devices/models?category=${encodeURIComponent(category)}&query=${encodeURIComponent(searchQuery)}`;
      if (selectedBrandObj?.id) {
        url += `&brandId=${encodeURIComponent(selectedBrandObj.id)}`;
      } else if (brand) {
        url += `&brandSlug=${encodeURIComponent(brand.toLowerCase().replace(/\s+/g, '-'))}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      return data.models || [];
    } catch (e) {
      return [];
    }
  };

  // Trigger real-time device validation
  const validateDevice = async (bName = brand, mName = model) => {
    if (!bName || !bName.trim() || !mName || !mName.trim()) {
      setValidation(null);
      return;
    }

    setValidationLoading(true);
    try {
      const res = await fetch('/api/devices/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          brandName: bName,
          modelName: mName,
          brandId: selectedBrandObj?.id,
          modelId: selectedModelObj?.id
        })
      });
      const data = await res.json();
      setValidation(data);
      if (data.status === 'VERIFIED') {
        setError('');
      } else if (data.status === 'MISMATCHED_BRAND_MODEL') {
        setError(data.message);
      }
    } catch (err) {
      console.error('Validation error:', err);
    } finally {
      setValidationLoading(false);
    }
  };

  // Handle Brand selection
  const handleBrandSelect = (brandItem) => {
    if (brandItem) {
      setSelectedBrandObj(brandItem);
      setBrand(brandItem.name);
      setModel('');
      setSelectedModelObj(null);
      setValidation(null);
    } else {
      setSelectedBrandObj(null);
      setBrand('');
      setValidation(null);
    }
  };

  // Handle Model selection
  const handleModelSelect = (modelItem) => {
    if (modelItem) {
      setSelectedModelObj(modelItem);
      const mName = modelItem.model_name || modelItem;
      setModel(mName);
      validateDevice(brand, mName);
    } else {
      setSelectedModelObj(null);
      setModel('');
      setValidation(null);
    }
  };

  // Real-time Semantic Problem Description Validation
  useEffect(() => {
    let active = true;
    const text = (problemDescription || '').trim();

    if (!text) {
      setProblemValidation(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/repair/validate-problem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ problemDescription: text })
        });
        const data = await res.json();
        if (active) {
          setProblemValidation(data);
          if (data.status === 'VALID' && error && error.includes('problem description')) {
            setError('');
          }
        }
      } catch (e) {
        console.error('Problem validation failed:', e);
      }
    }, 200);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [problemDescription]);

  // Submit diagnostic request (Pure JSON, 100% photo-free)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!problemDescription.trim() || problemDescription.trim().length < 3) {
      setError('Please describe the problem in a few words.');
      return;
    }

    // Semantic problem description validation check
    if (problemValidation?.status === 'INVALID') {
      setError(problemValidation.message || 'Invalid problem description. Please describe a real problem with your device.');
      return;
    }
    if (problemValidation?.status === 'NEEDS_CLARIFICATION') {
      setError(problemValidation.message || 'Please provide more details about the problem with your device.');
      return;
    }

    // Unrecognized Error Code check
    if (errorCode?.trim() && errorCodeValidation?.isUnrecognized) {
      setError("Error code not recognized. Please verify the code or remove it if you don't have one.");
      return;
    }

    // Check device validation status
    if (validation?.status === 'MISMATCHED_BRAND_MODEL') {
      setError(`Cannot proceed: ${validation.message}`);
      return;
    }

    if (validation?.status === 'UNVERIFIED_MODEL' && !allowUnverifiedModel) {
      setError('Please check "I want to proceed with this unverified model" to continue with an unlisted device.');
      return;
    }

    setLoading(true);
    setDiagnosis(null);
    setMessages([]);
    setCompletedSteps({});
    setFeedbackSubmitted(false);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/repair/diagnose', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          category,
          brand: brand || 'Generic',
          deviceName: brand || 'Appliance',
          model,
          errorCode: errorCode ? errorCode.trim() : '',
          problemDescription: problemDescription.trim(),
          allowUnverifiedModel: allowUnverifiedModel ? '1' : '0'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process repair diagnosis');
      }

      setDiagnosis(data.diagnosis);
      setConversationId(data.conversationId);
      setMessages([
        { sender: 'user', content: problemDescription.trim() },
        { sender: 'assistant', content: data.diagnosis.summary }
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Follow-up chat send
  const handleSendFollowUp = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || !conversationId) return;

    const question = chatInput.trim();
    setChatInput('');
    setChatLoading(true);

    setMessages(prev => [...prev, { sender: 'user', content: question }]);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/repair/conversations/${conversationId}/message`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ question })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process follow-up');

      setMessages(prev => [...prev, data.message]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'assistant', content: `Unable to reply: ${err.message}. Please try again.` }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Submit Feedback
  const handleFeedbackSubmit = async (rating) => {
    setFeedbackRating(rating);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch('/api/repair/feedback', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          conversationId,
          rating,
          comment: feedbackComment
        })
      });
      setFeedbackSubmitted(true);
    } catch (err) {
      console.error('Feedback error:', err);
    }
  };

  const toggleStep = (stepIndex) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepIndex]: !prev[stepIndex]
    }));
  };

  const resetForm = () => {
    setDiagnosis(null);
    setConversationId(null);
    setProblemDescription('');
    setProblemValidation(null);
    setErrorCode('');
    setError('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header Badge & Title */}
      <div className="mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-mono font-medium mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
          DIAGNOSTIC ENGINE V2.5 • ZERO GUESSWORK
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
          Intelligent Device Diagnosis
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 font-sans max-w-2xl">
          Pinpoint appliance faults, unmask error codes, and review certified step-by-step resolution pathways without submitting photos.
        </p>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
          <div className="text-sm font-medium">{error}</div>
        </div>
      )}

      {/* 6-Step Simplified Diagnostic Form */}
      {!diagnosis && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-white/[0.08] shadow-xl shadow-black/5 dark:shadow-black/40 space-y-7">
            
            {/* STEP 1: Device Category */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-mono uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">1</span>
                  Select Device Category <span className="text-blue-500">*</span>
                </label>
                <span className="text-xs text-slate-400 font-mono">10 Categories Supported</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {categories.map((c) => {
                  const isSelected = category === c.slug;
                  return (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => handleCategoryChange(c.slug)}
                      className={`p-3 rounded-2xl text-left border transition-all duration-150 flex flex-col justify-between ${
                        isSelected
                          ? 'border-blue-600 dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-white shadow-sm ring-2 ring-blue-500/20'
                          : 'border-slate-200 dark:border-white/[0.06] bg-slate-50/50 dark:bg-charcoal-850/60 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/[0.15]'
                      }`}
                    >
                      <span className="text-xl mb-1.5">{c.icon}</span>
                      <span className="text-xs font-bold leading-tight font-heading">{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEPS 2 & 3: Brand & Model Autocomplete */}
            <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Brand Autocomplete */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold font-mono">2</span>
                    <label className="text-xs font-mono uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300">
                      Device Brand <span className="text-blue-500">*</span>
                    </label>
                  </div>
                  <AutocompleteInput
                    required
                    value={brand}
                    placeholder="e.g. Samsung, Apple, Dell, LG..."
                    fetchSuggestions={fetchBrandSuggestions}
                    onChange={(text) => {
                      setBrand(text);
                      setSelectedBrandObj(null);
                      setValidation(null);
                    }}
                    onSelect={handleBrandSelect}
                    helperText="Suggestions filtered by verified catalogue"
                  />
                </div>

                {/* Model Autocomplete */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold font-mono">3</span>
                    <label className="text-xs font-mono uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300">
                      Device Model <span className="text-blue-500">*</span>
                    </label>
                  </div>
                  <AutocompleteInput
                    required
                    value={model}
                    disabled={!brand.trim()}
                    placeholder={brand ? `Type ${brand} model (e.g. Gal, iP, 15 3520...)` : 'Select brand first'}
                    fetchSuggestions={fetchModelSuggestions}
                    onChange={(text) => {
                      setModel(text);
                      setSelectedModelObj(null);
                      validateDevice(brand, text);
                    }}
                    onSelect={handleModelSelect}
                    helperText={brand ? `Showing models associated with ${brand}` : 'Select brand first'}
                  />
                </div>
              </div>

              {/* Real-time Relationship Validation Banner */}
              <DeviceVerificationBadge
                validation={validation}
                allowUnverifiedModel={allowUnverifiedModel}
                onToggleAllowUnverified={setAllowUnverifiedModel}
              />
            </div>

            {/* STEP 4: Problem & Symptoms */}
            <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold font-mono">4</span>
                  <label className="text-xs font-mono uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300">
                    Describe Problem & Symptoms <span className="text-blue-500">*</span>
                  </label>
                </div>
                <span className="text-xs text-slate-400 font-mono">Natural English / Hinglish</span>
              </div>

              <textarea
                rows={4}
                required
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                placeholder="Explain what is happening: What sounds does it make? Does it turn on? Is it leaking, overheating, or stuck in a restart loop?"
                className={`w-full p-4 rounded-2xl border bg-slate-50/50 dark:bg-charcoal-850/70 text-slate-900 dark:text-white text-sm focus:ring-2 focus:outline-none resize-y transition-colors font-sans ${
                  problemValidation?.status === 'INVALID'
                    ? 'border-red-400 dark:border-red-600 focus:ring-red-400'
                    : problemValidation?.status === 'VALID'
                    ? 'border-emerald-400 dark:border-emerald-600 focus:ring-emerald-400'
                    : 'border-slate-200 dark:border-white/[0.08] focus:ring-blue-500'
                }`}
              ></textarea>

              {/* Validation Feedback Messages */}
              {problemValidation?.status === 'INVALID' && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-700 dark:text-red-300 flex items-start gap-2 animate-fade-in">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Invalid problem description.</p>
                    <p className="text-[11px] text-red-600 dark:text-red-400 mt-0.5">Please describe a real problem with your device.</p>
                  </div>
                </div>
              )}

              {problemValidation?.status === 'NEEDS_CLARIFICATION' && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Needs more detail.</p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                      {problemValidation.message || 'Explain what your device is doing (e.g. screen dark, battery draining, not charging).'}
                    </p>
                  </div>
                </div>
              )}

              {problemValidation?.status === 'VALID' && (
                <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium animate-fade-in pt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Valid description {problemValidation.detectedSymptom ? `— Symptom recognized: "${problemValidation.detectedSymptom}"` : ''}
                  </span>
                </div>
              )}

              {/* Smart Symptom Autocomplete Chips */}
              <SymptomAutocomplete
                category={category}
                currentText={problemDescription}
                onSelectSymptom={(sym) => {
                  setProblemDescription((prev) => (prev ? `${prev}. ${sym}` : sym));
                }}
              />
            </div>

            {/* STEP 5: Error Code (Optional) */}
            <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06]">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-white text-[11px] flex items-center justify-center font-bold font-mono">5</span>
                <label className="text-xs font-mono uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300">
                  Error Code (Optional)
                </label>
              </div>

              <ErrorCodeSelector
                category={category}
                brand={brand}
                value={errorCode}
                onChange={setErrorCode}
                onValidationChange={setErrorCodeValidation}
              />
            </div>

            {/* STEP 6: Execute Diagnosis Button */}
            <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06]">
              <button
                type="submit"
                disabled={
                  loading ||
                  !problemDescription.trim() ||
                  problemValidation?.status === 'INVALID' ||
                  problemValidation?.status === 'NEEDS_CLARIFICATION' ||
                  validation?.status === 'MISMATCHED_BRAND_MODEL' ||
                  (validation?.status === 'UNVERIFIED_MODEL' && !allowUnverifiedModel) ||
                  (errorCode.trim() !== '' && errorCodeValidation?.isUnrecognized)
                }
                className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-heading font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/25 glow-blue"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Analyzing Device Architecture & Schematics...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-acid" />
                    <span>Run Intelligent Repair Diagnosis</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <p className="text-center text-[11px] text-slate-400 font-mono mt-2">
                100% photo-free • Grounded in verified manufacturer service bulletins
              </p>
            </div>
          </div>
        </form>
      )}

      {/* Upgraded Gen Z Bento Diagnostic Result Display */}
      {diagnosis && (
        <div className="space-y-6 animate-fade-in">
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 uppercase">
                Diagnosis Complete • {brand} {model || category}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {onNavigateCost && (
                <button
                  type="button"
                  onClick={() => onNavigateCost({ brand, model, category })}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-300 text-xs font-bold font-mono flex items-center gap-1.5 hover:bg-blue-100 transition-colors"
                >
                  <Coins className="w-3.5 h-3.5 text-blue-500" />
                  <span>Check Repair Costs</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              )}
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-charcoal-800 text-slate-700 dark:text-slate-300 text-xs font-bold font-mono flex items-center gap-1.5 hover:bg-slate-200 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>New Diagnosis</span>
              </button>
            </div>
          </div>

          {/* Critical Hazard Alert Banner (if applicable) */}
          {diagnosis.safety_alert?.isCritical && (
            <div className="p-6 rounded-3xl bg-red-600 text-white shadow-xl shadow-red-600/30 border border-red-400 animate-pulse">
              <div className="flex items-start gap-4">
                <ShieldAlert className="w-8 h-8 text-white shrink-0 mt-1" />
                <div className="space-y-2">
                  <h3 className="text-xl font-heading font-extrabold uppercase tracking-wide">
                    {diagnosis.safety_alert.alertTitle}
                  </h3>
                  <p className="text-sm font-sans text-red-100 font-medium leading-relaxed">
                    {diagnosis.safety_alert.warning}
                  </p>
                  <div className="bg-red-700/80 p-4 rounded-2xl mt-3 space-y-1.5 text-xs font-mono">
                    <p className="font-bold underline uppercase">Immediate Action Protocol:</p>
                    {diagnosis.safety_alert.actionSteps.map((step, sIdx) => (
                      <p key={sIdx} className="flex items-start gap-2">
                        <span>•</span>
                        <span>{step}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bento Grid Diagnostic Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Card 1: Problem Identification & Summary (2 cols) */}
            <div className="md:col-span-2 p-6 sm:p-7 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" /> 1. Problem Identification
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                  diagnosis.severity === 'Critical' ? 'bg-red-500/10 text-red-600 border border-red-500/30' :
                  diagnosis.severity === 'High' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30' :
                  'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                }`}>
                  Severity: {diagnosis.severity || 'Moderate'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900 dark:text-white leading-snug">
                {diagnosis.problem_identification || diagnosis.summary}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
                {diagnosis.most_likely_explanation || diagnosis.summary}
              </p>

              {/* Confidence & Uncertainty disclosure */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-charcoal-850/80 border border-slate-200/80 dark:border-white/[0.06] text-xs space-y-1 font-sans">
                <p className="font-bold text-slate-700 dark:text-slate-200 font-mono flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-500" /> Confidence & Uncertainty:
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  {diagnosis.confidence_and_uncertainty || diagnosis.confidence_note || 'Standard verified diagnostic profile.'}
                </p>
              </div>
            </div>

            {/* Card 2: Source-Backed Verified Repair Pricing & Technical Specs */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-white/[0.08] shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-emerald-500" /> Verified Repair Price
                  </span>
                  {diagnosis.verified_pricing?.matchingStatus === 'VERIFIED_EXACT_MATCH' && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      Exact Match
                    </span>
                  )}
                  {diagnosis.verified_pricing?.matchingStatus === 'SUSPECTED_ELECTRICAL_FAULT' && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      Inspection Needed
                    </span>
                  )}
                  {(!diagnosis.verified_pricing || diagnosis.verified_pricing?.matchingStatus === 'PRICE_NOT_VERIFIED' || diagnosis.verified_pricing?.matchingStatus === 'UNVERIFIED_MODEL') && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500">
                      Unverified
                    </span>
                  )}
                </div>

                {/* Case 1: Suspected Electrical Fault (The iPhone 15 Pro Max PMIC condition) */}
                {diagnosis.verified_pricing?.matchingStatus === 'SUSPECTED_ELECTRICAL_FAULT' && (
                  <div className="mt-3 space-y-3 font-sans">
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs space-y-1">
                      <p className="font-heading font-bold text-[12px] flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Possible power-management issue detected.</span>
                      </p>
                      <p className="text-[11px] font-mono text-amber-700 dark:text-amber-300">
                        Exact component failure has not been confirmed.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-charcoal-850 border border-slate-200/60 dark:border-white/[0.06] space-y-1.5">
                      <div className="text-[10px] font-mono uppercase font-bold text-slate-400">
                        Pricing Status
                      </div>
                      <p className="text-sm font-heading font-extrabold text-amber-600 dark:text-amber-400">
                        PRICE NOT VERIFIED
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        Your device requires hardware inspection to identify the faulty component and confirm the final repair price.
                      </p>
                    </div>

                    {/* Independent Workshop chip-level quote if available (never labeled official) */}
                    {diagnosis.verified_pricing.thirdPartyOption && (
                      <div className="p-3 rounded-2xl bg-slate-100/70 dark:bg-charcoal-800/60 border border-slate-200/70 dark:border-white/[0.05] space-y-1 text-xs">
                        <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase">
                          <span>Independent Workshop Rework:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{diagnosis.verified_pricing.thirdPartyOption.priceRange}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal">
                          {diagnosis.verified_pricing.thirdPartyOption.disclaimer}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Case 2: Verified Exact Match (e.g. Display / Battery replacement) */}
                {diagnosis.verified_pricing?.matchingStatus === 'VERIFIED_EXACT_MATCH' && diagnosis.verified_pricing.official && (
                  <div className="mt-3 space-y-3 font-mono">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400 font-bold uppercase">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{diagnosis.verified_pricing.official.providerName}</span>
                      </div>
                      <p className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white mt-1">
                        ₹{diagnosis.verified_pricing.official.finalTotal?.toLocaleString()}
                      </p>
                      <p className="text-[11px] font-sans text-slate-500 mt-0.5">
                        Part: ₹{diagnosis.verified_pricing.official.partPrice?.toLocaleString()} + Service: ₹{diagnosis.verified_pricing.official.labourPrice?.toLocaleString()} {diagnosis.verified_pricing.official.isTaxInclusive ? '(GST Incl.)' : '+ 18% GST'}
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-charcoal-850 border border-slate-200/60 dark:border-white/[0.06] space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{diagnosis.verified_pricing.official.partQuality}</span>
                      </div>
                      {diagnosis.verified_pricing.official.exchangeConditions && (
                        <p className="text-[10px] text-slate-500 leading-normal font-sans pt-1 border-t border-slate-200/40 dark:border-white/[0.04]">
                          {diagnosis.verified_pricing.official.exchangeConditions}
                        </p>
                      )}
                      {diagnosis.verified_pricing.official.sourceUrl && (
                        <a
                          href={diagnosis.verified_pricing.official.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline pt-0.5"
                        >
                          <span>Published Service Source</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Case 3: Price Not Verified (No matching official record & no random numbers) */}
                {(!diagnosis.verified_pricing || diagnosis.verified_pricing?.matchingStatus === 'PRICE_NOT_VERIFIED' || diagnosis.verified_pricing?.matchingStatus === 'UNVERIFIED_MODEL') && (
                  <div className="mt-3 space-y-3">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-charcoal-850 border border-slate-200/60 dark:border-white/[0.06] space-y-2">
                      <div className="text-[10px] font-mono uppercase font-bold text-slate-400">
                        Verified Pricing
                      </div>
                      <p className="text-base font-heading font-extrabold text-slate-700 dark:text-slate-300">
                        PRICE NOT VERIFIED
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                        An exact repair quotation is unavailable for this suspected fault. Professional hardware inspection is required.
                      </p>
                    </div>
                  </div>
                )}

                {/* Technical Specs Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.06] space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-400">Difficulty:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{diagnosis.difficulty || 'Moderate'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-400">DIY Status:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {diagnosis.professional_recommended ? '⚠️ Technician Advised' : '✅ DIY Friendly'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Find Authorised Centre OR Compare Rates */}
              <div className="space-y-2 pt-2">
                {diagnosis.verified_pricing?.showAuthorizedCenterButton && (
                  <a
                    href={diagnosis.verified_pricing.authorizedCenterUrl || 'https://locate.apple.com/in/en/'}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90 shadow-sm"
                  >
                    <span>Find Authorised Repair Centre</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {onNavigateCost && (
                  <button
                    type="button"
                    onClick={() => onNavigateCost({
                      brand,
                      model,
                      component: diagnosis.verified_pricing?.component || 'Display / Screen',
                      category
                    })}
                    className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-blue-500/20"
                  >
                    <span>Compare Multi-Channel Rates</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Card 3: Possible Causes */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-500" /> 2. Root Causes Identified
              </span>
              <ul className="space-y-2 pt-1">
                {(diagnosis.possible_causes || []).map((cause, cIdx) => (
                  <li key={cIdx} className="text-xs font-sans text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5"></span>
                    <span>{cause}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Card 4: Step-by-Step Troubleshooting (2 cols) */}
            <div className="md:col-span-2 p-6 sm:p-7 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-4 h-4" /> 3. Step-by-Step Resolution Steps
                </span>
                <span className="text-xs text-slate-400 font-mono">Check off completed steps</span>
              </div>

              <div className="space-y-2.5 pt-1">
                {(diagnosis.troubleshooting_steps || []).map((step, idx) => {
                  const isDone = completedSteps[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleStep(idx)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                        isDone
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                          : 'bg-slate-50/70 dark:bg-charcoal-850/60 border-slate-200/80 dark:border-white/[0.06] text-slate-800 dark:text-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <button
                        type="button"
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isDone
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-400 dark:border-slate-600'
                        }`}
                      >
                        {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                      <div className="text-xs sm:text-sm font-sans leading-relaxed">
                        <span className="font-mono font-bold mr-1.5">Step {idx + 1}:</span>
                        <span className={isDone ? 'line-through opacity-75' : ''}>{step}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card 5: Tools Required & Safety Warnings */}
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-white/[0.08] space-y-2.5">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Tools & Gear Required
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(diagnosis.tools_required || []).map((tool, tIdx) => (
                    <span key={tIdx} className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-charcoal-800 text-slate-700 dark:text-slate-300 text-xs font-mono">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-white/[0.08] space-y-2.5">
                <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Safety Precautions
                </span>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-sans pt-1">
                  {(diagnosis.safety_precautions || []).map((safe, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{safe}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>

          {/* Interactive Follow-Up Chat Box */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base">
                  Interactive Troubleshooting Assistant
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Ask clarification or tool steps</span>
            </div>

            {/* Chat Messages */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {messages.map((m, mIdx) => (
                <div
                  key={mIdx}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm font-sans leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-slate-100 dark:bg-charcoal-850 text-slate-800 dark:text-slate-200 rounded-bl-sm border border-slate-200/60 dark:border-white/[0.05]'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-charcoal-850 text-xs font-mono text-slate-400 flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                    <span>Assistant is typing...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef}></div>
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendFollowUp} className="flex gap-2 pt-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about replacement parts, voltages, or alternative tools..."
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-charcoal-850 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Feedback Rating Card */}
          <div className="p-6 rounded-3xl bg-slate-100/60 dark:bg-charcoal-850/60 border border-slate-200 dark:border-white/[0.06] text-center space-y-3">
            <p className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase">
              Was this diagnosis helpful?
            </p>
            {feedbackSubmitted ? (
              <p className="text-xs text-emerald-600 font-bold">Thank you for your feedback! It helps improve diagnostic precision.</p>
            ) : (
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleFeedbackSubmit(star)}
                    className="p-2 hover:scale-110 text-slate-400 hover:text-amber-400 transition-transform"
                  >
                    <Star className="w-6 h-6 fill-current" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
